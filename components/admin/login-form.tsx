'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/admin/actions';

export function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="mt-5 grid gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="a-label">
        Parol
        <input className="a-input" type="password" name="password" autoComplete="current-password" required autoFocus />
      </label>
      {error && (
        <p className="text-sm font-semibold text-error" role="alert">
          {error}
        </p>
      )}
      <button className="a-btn a-btn-primary" disabled={pending}>
        {pending ? 'Yoxlanılır…' : 'Daxil ol'}
      </button>
    </form>
  );
}
