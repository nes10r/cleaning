import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { uploadMedia } from '@/lib/admin/media';

/** Multipart upload from the admin media library (field "files", one or more). */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Giriş tələb olunur.' }, { status: 401 });
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Fayl oxunmadı.' }, { status: 400 });
  }
  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: 'Fayl seçilməyib.' }, { status: 400 });

  const items = [];
  const errors: string[] = [];
  for (const file of files.slice(0, 20)) {
    try {
      items.push(await uploadMedia(file));
    } catch (e) {
      errors.push(e instanceof Error ? e.message : `"${file.name}": yüklənmədi.`);
    }
  }
  return NextResponse.json({ items, errors }, { status: items.length ? 200 : 400 });
}
