import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ContentKey } from '@/lib/content/types';

/**
 * Storage for editable content, bookings/inquiries and the media library.
 *   DATABASE_URL set  → Postgres (Neon). Tables are created automatically.
 *   otherwise         → JSON file in .data/ (local development only).
 * Uploaded image bytes (when Vercel Blob is not used) go to the `media_files`
 * table in Postgres, or to .data/uploads with the file store.
 */
export type RecordKind = 'booking' | 'contact' | 'application' | 'admin_login';

export interface DbRecord {
  id: string;
  kind: RecordKind;
  status: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  url: string;
  pathname: string;
  name: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export interface Db {
  kind: 'postgres' | 'file';
  getContent(): Promise<Partial<Record<ContentKey, unknown>>>;
  setContent(key: ContentKey, value: unknown): Promise<void>;
  insertRecord(rec: Omit<DbRecord, 'createdAt'>): Promise<void>;
  listRecords(kind: RecordKind, limit?: number): Promise<DbRecord[]>;
  countRecords(kind: RecordKind, status?: string): Promise<number>;
  updateRecordStatus(id: string, status: string): Promise<void>;
  deleteRecord(id: string): Promise<void>;
  listMedia(): Promise<MediaItem[]>;
  addMedia(item: Omit<MediaItem, 'createdAt'>): Promise<void>;
  getMedia(id: string): Promise<MediaItem | null>;
  deleteMedia(id: string): Promise<void>;
  putMediaFile(name: string, bytes: Buffer): Promise<void>;
  getMediaFile(name: string): Promise<Buffer | null>;
  deleteMediaFile(name: string): Promise<void>;
}

/* ---------------- Postgres (Neon) ---------------- */

function postgresDb(url: string): Db {
  const sql: NeonQueryFunction<false, false> = neon(url);
  let ready: Promise<void> | null = null;
  const init = () =>
    (ready ??= (async () => {
      await sql`create table if not exists content (key text primary key, value jsonb not null, updated_at timestamptz not null default now())`;
      await sql`create table if not exists records (id text primary key, kind text not null, status text not null default 'new', data jsonb not null, created_at timestamptz not null default now())`;
      await sql`create index if not exists records_kind_created on records (kind, created_at desc)`;
      await sql`create table if not exists media (id text primary key, url text not null, pathname text not null, name text not null, content_type text not null, size integer not null, created_at timestamptz not null default now())`;
      // Base64 text keeps the HTTP driver simple; images are small.
      await sql`create table if not exists media_files (name text primary key, data text not null)`;
    })().catch((e) => {
      ready = null;
      throw e;
    }));

  const toRecord = (r: Record<string, unknown>): DbRecord => ({
    id: String(r.id),
    kind: r.kind as RecordKind,
    status: String(r.status),
    data: r.data as Record<string, unknown>,
    createdAt: new Date(r.created_at as string).toISOString(),
  });
  const toMedia = (r: Record<string, unknown>): MediaItem => ({
    id: String(r.id),
    url: String(r.url),
    pathname: String(r.pathname),
    name: String(r.name),
    contentType: String(r.content_type),
    size: Number(r.size),
    createdAt: new Date(r.created_at as string).toISOString(),
  });

  return {
    kind: 'postgres',
    async getContent() {
      await init();
      const rows = await sql`select key, value from content`;
      return Object.fromEntries(rows.map((r) => [r.key, r.value]));
    },
    async setContent(key, value) {
      await init();
      await sql`insert into content (key, value, updated_at) values (${key}, ${JSON.stringify(value)}::jsonb, now())
                on conflict (key) do update set value = excluded.value, updated_at = now()`;
    },
    async insertRecord(rec) {
      await init();
      await sql`insert into records (id, kind, status, data) values (${rec.id}, ${rec.kind}, ${rec.status}, ${JSON.stringify(rec.data)}::jsonb)`;
    },
    async listRecords(kind, limit = 300) {
      await init();
      const rows = await sql`select * from records where kind = ${kind} order by created_at desc limit ${limit}`;
      return rows.map(toRecord);
    },
    async countRecords(kind, status) {
      await init();
      const rows = status
        ? await sql`select count(*)::int as n from records where kind = ${kind} and status = ${status}`
        : await sql`select count(*)::int as n from records where kind = ${kind}`;
      return Number(rows[0]?.n ?? 0);
    },
    async updateRecordStatus(id, status) {
      await init();
      await sql`update records set status = ${status} where id = ${id}`;
    },
    async deleteRecord(id) {
      await init();
      await sql`delete from records where id = ${id}`;
    },
    async listMedia() {
      await init();
      const rows = await sql`select * from media order by created_at desc`;
      return rows.map(toMedia);
    },
    async addMedia(item) {
      await init();
      await sql`insert into media (id, url, pathname, name, content_type, size) values (${item.id}, ${item.url}, ${item.pathname}, ${item.name}, ${item.contentType}, ${item.size})`;
    },
    async getMedia(id) {
      await init();
      const rows = await sql`select * from media where id = ${id}`;
      return rows[0] ? toMedia(rows[0]) : null;
    },
    async deleteMedia(id) {
      await init();
      await sql`delete from media where id = ${id}`;
    },
    async putMediaFile(name, bytes) {
      await init();
      await sql`insert into media_files (name, data) values (${name}, ${bytes.toString('base64')})
                on conflict (name) do update set data = excluded.data`;
    },
    async getMediaFile(name) {
      await init();
      const rows = await sql`select data from media_files where name = ${name}`;
      return rows[0] ? Buffer.from(String(rows[0].data), 'base64') : null;
    },
    async deleteMediaFile(name) {
      await init();
      await sql`delete from media_files where name = ${name}`;
    },
  };
}

/* ---------------- Local JSON file (development) ---------------- */

interface FileData {
  content: Partial<Record<ContentKey, unknown>>;
  records: DbRecord[];
  media: MediaItem[];
}

export const LOCAL_DATA_DIR = path.join(process.cwd(), '.data');
export const UPLOAD_DIR = path.join(LOCAL_DATA_DIR, 'uploads');

function fileDb(): Db {
  const file = path.join(LOCAL_DATA_DIR, 'db.json');
  let queue: Promise<unknown> = Promise.resolve();

  const read = async (): Promise<FileData> => {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8')) as FileData;
    } catch {
      return { content: {}, records: [], media: [] };
    }
  };
  const write = async (d: FileData) => {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(d, null, 2));
    await fs.rename(tmp, file);
  };
  /** Serialise writes so concurrent requests can't lose updates. */
  const mutate = <T,>(fn: (d: FileData) => T): Promise<T> => {
    const next = queue.then(async () => {
      const d = await read();
      const result = fn(d);
      await write(d);
      return result;
    });
    queue = next.catch(() => undefined);
    return next;
  };

  return {
    kind: 'file',
    getContent: async () => (await read()).content,
    setContent: (key, value) => mutate((d) => void (d.content[key] = value)),
    insertRecord: (rec) => mutate((d) => void d.records.unshift({ ...rec, createdAt: new Date().toISOString() })),
    listRecords: async (kind, limit = 300) => (await read()).records.filter((r) => r.kind === kind).slice(0, limit),
    countRecords: async (kind, status) => (await read()).records.filter((r) => r.kind === kind && (!status || r.status === status)).length,
    updateRecordStatus: (id, status) =>
      mutate((d) => {
        const r = d.records.find((x) => x.id === id);
        if (r) r.status = status;
      }),
    deleteRecord: (id) => mutate((d) => void (d.records = d.records.filter((r) => r.id !== id))),
    listMedia: async () => (await read()).media,
    addMedia: (item) => mutate((d) => void d.media.unshift({ ...item, createdAt: new Date().toISOString() })),
    getMedia: async (id) => (await read()).media.find((m) => m.id === id) ?? null,
    deleteMedia: (id) => mutate((d) => void (d.media = d.media.filter((m) => m.id !== id))),
    async putMediaFile(name, bytes) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOAD_DIR, path.basename(name)), bytes);
    },
    getMediaFile: (name) => fs.readFile(path.join(UPLOAD_DIR, path.basename(name))).catch(() => null),
    deleteMediaFile: (name) => fs.rm(path.join(UPLOAD_DIR, path.basename(name)), { force: true }),
  };
}

let instance: Db | null = null;
export function db(): Db {
  if (!instance) instance = process.env.DATABASE_URL ? postgresDb(process.env.DATABASE_URL) : fileDb();
  return instance;
}

/** On Vercel without DATABASE_URL nothing can be saved (read-only filesystem). */
export function storageStatus() {
  const hasDb = !!process.env.DATABASE_URL;
  const onVercel = !!process.env.VERCEL;
  return {
    database: hasDb ? 'postgres' : 'file',
    writable: hasDb || !onVercel,
    blob: !!process.env.BLOB_READ_WRITE_TOKEN,
    /** Where uploaded image bytes live. */
    media: process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : hasDb ? 'postgres' : 'file',
    onVercel,
  } as const;
}

export const newId = (prefix = '') => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
