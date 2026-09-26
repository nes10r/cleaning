'use client';

import { useState } from 'react';
import type { Dictionary } from '@/locales/lt';
import { EMAIL_RE } from '@/lib/booking/validation';
import { Icon } from '@/components/ui/icon';

type F = Dictionary['contact']['form'];
type ErrKey = 'name' | 'email' | 'message';

export function ContactForm({ labels, emailError, submitError, optional }: { labels: F; emailError: string; submitError: string; optional: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Set<ErrKey>>(new Set());

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(['name', 'email', 'phone', 'topic', 'message'].map((k) => [k, String(fd.get(k) ?? '').trim()]));
    const bad = new Set<ErrKey>();
    if (data.name.length < 2) bad.add('name');
    if (!EMAIL_RE.test(data.email)) bad.add('email');
    if (data.message.length < 10) bad.add('message');
    setErrors(bad);
    if (bad.size) {
      document.getElementById(`cf-${[...bad][0]}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="grid justify-items-center gap-3 rounded-[24px] border border-line bg-white p-8 text-center" role="status">
        <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <Icon name="check" size={30} strokeWidth={2.4} />
        </span>
        <p className="max-w-[36ch] text-lg font-semibold">{labels.success}</p>
      </div>
    );
  }

  const invalid = (k: ErrKey) => errors.has(k);
  const msg = (k: ErrKey, text: string) =>
    invalid(k) && (
      <p id={`cf-${k}-err`} className="error-text">
        <Icon name="alert" size={16} />
        {text}
      </p>
    );

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5 rounded-[24px] border border-line bg-white p-5 shadow-md sm:p-8">
      <h2 className="text-h4 font-bold">{labels.title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label className="label" htmlFor="cf-name">
            {labels.name}
          </label>
          <input id="cf-name" name="name" autoComplete="given-name" className="input" aria-invalid={invalid('name')} aria-describedby={invalid('name') ? 'cf-name-err' : undefined} />
          {msg('name', labels.errors.name)}
        </div>
        <div className="field">
          <label className="label" htmlFor="cf-email">
            {labels.email}
          </label>
          <input id="cf-email" name="email" type="email" inputMode="email" autoComplete="email" className="input" aria-invalid={invalid('email')} aria-describedby={invalid('email') ? 'cf-email-err' : undefined} />
          {msg('email', emailError)}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label className="label" htmlFor="cf-phone">
            {labels.phone} <span className="optional">({optional})</span>
          </label>
          <input id="cf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className="input" />
        </div>
        <div className="field">
          <label className="label" htmlFor="cf-topic">
            {labels.topic}
          </label>
          <select id="cf-topic" name="topic" className="input">
            {Object.entries(labels.topics).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="cf-message">
          {labels.message}
        </label>
        <textarea id="cf-message" name="message" rows={5} maxLength={2000} className="input" aria-invalid={invalid('message')} aria-describedby={invalid('message') ? 'cf-message-err' : undefined} />
        {msg('message', labels.errors.message)}
      </div>
      {status === 'error' && (
        <p className="flex gap-2.5 rounded-xl bg-error-soft p-4 text-sm font-semibold text-error" role="alert">
          <Icon name="alert" size={18} className="mt-0.5 flex-none" />
          {submitError}
        </p>
      )}
      <button type="submit" className="btn btn-primary justify-self-start max-sm:w-full" disabled={status === 'sending'} aria-busy={status === 'sending'}>
        {status === 'sending' && <Icon name="loader" size={18} className="animate-spin-slow" />}
        {labels.submit}
      </button>
    </form>
  );
}
