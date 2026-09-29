'use client';

import { deleteRecordAction, setRecordStatusAction } from '@/app/admin/actions';
import type { RecordKind } from '@/lib/db';

/** Status dropdown that saves as soon as it changes. */
export function StatusSelect({ id, kind, status, options }: { id: string; kind: RecordKind; status: string; options: Record<string, string> }) {
  return (
    <form action={setRecordStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <select name="status" defaultValue={status} className="a-input !min-h-8 !w-auto !py-0 text-sm" aria-label="Status" onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        {Object.entries(options).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}

export function DeleteRecordButton({ id }: { id: string }) {
  return (
    <form action={deleteRecordAction} onSubmit={(e) => !confirm('Qeyd birdəfəlik silinsin?') && e.preventDefault()}>
      <input type="hidden" name="id" value={id} />
      <button className="a-btn a-btn-sm a-btn-danger">Sil</button>
    </form>
  );
}
