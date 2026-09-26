'use client';

import { useState } from 'react';
import type { Dictionary } from '@/locales/lt';
import { EMAIL_RE, normalizeLtPhone } from '@/lib/booking/validation';
import { Icon } from '@/components/ui/icon';

type F = Dictionary['recruitment']['form'];
type ErrKey = 'name' | 'phone' | 'email' | 'availability' | 'consent';

export function RecruitmentForm({ labels, errors: E, cities, optional }: { labels: F; errors: Dictionary['booking']['errors']; cities: { key: string; name: string }[]; optional: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Set<ErrKey>>(new Set());

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get('name') ?? '').trim(),
      phone: String(fd.get('phone') ?? ''),
      email: String(fd.get('email') ?? '').trim(),
      city: String(fd.get('city') ?? ''),
      experience: String(fd.get('experience') ?? ''),
      availability: fd.getAll('availability').map(String),
      message: String(fd.get('message') ?? ''),
      consent: fd.get('consent') === 'on',
    };
    const bad = new Set<ErrKey>();
    if (data.name.length < 3) bad.add('name');
    if (!normalizeLtPhone(data.phone)) bad.add('phone');
    if (data.email && !EMAIL_RE.test(data.email)) bad.add('email');
    if (!data.availability.length) bad.add('availability');
    if (!data.consent) bad.add('consent');
    setErrors(bad);
    if (bad.size) {
      document.getElementById(`rf-${[...bad][0]}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
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
      <p id={`rf-${k}-err`} className="error-text">
        <Icon name="alert" size={16} />
        {text}
      </p>
    );

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5 rounded-[24px] border border-line bg-white p-5 shadow-md sm:p-8">
      <div>
        <h2 className="text-h4 font-bold">{labels.title}</h2>
        <p className="mt-1 text-sm text-ink-2">{labels.lead}</p>
      </div>
      <div className="field">
        <label className="label" htmlFor="rf-name">
          {labels.name}
        </label>
        <input id="rf-name" name="name" className="input" autoComplete="name" aria-invalid={invalid('name')} aria-describedby={invalid('name') ? 'rf-name-err' : undefined} />
        {msg('name', labels.errors.name)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label className="label" htmlFor="rf-phone">
            {labels.phone}
          </label>
          <input id="rf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+370 612 34567" className="input" aria-invalid={invalid('phone')} aria-describedby={invalid('phone') ? 'rf-phone-err' : undefined} />
          {msg('phone', E.phone)}
        </div>
        <div className="field">
          <label className="label" htmlFor="rf-email">
            {labels.email} <span className="optional">({optional})</span>
          </label>
          <input id="rf-email" name="email" type="email" inputMode="email" autoComplete="email" className="input" aria-invalid={invalid('email')} aria-describedby={invalid('email') ? 'rf-email-err' : undefined} />
          {msg('email', E.email)}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label className="label" htmlFor="rf-city">
            {labels.city}
          </label>
          <select id="rf-city" name="city" className="input">
            {cities.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="rf-experience">
            {labels.experience}
          </label>
          <select id="rf-experience" name="experience" className="input">
            {Object.entries(labels.experienceOptions).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="field" aria-describedby={invalid('availability') ? 'rf-availability-err' : undefined}>
        <legend className="label mb-1">{labels.availability}</legend>
        <div className="grid gap-x-4 sm:grid-cols-2">
          {Object.entries(labels.availabilityOptions).map(([k, v], i) => (
            <label key={k} className="check-row">
              <input id={i === 0 ? 'rf-availability' : undefined} type="checkbox" name="availability" value={k} className="checkbox" aria-invalid={invalid('availability')} />
              {v}
            </label>
          ))}
        </div>
        {msg('availability', labels.errors.availability)}
      </fieldset>
      <div className="field">
        <label className="label" htmlFor="rf-message">
          {labels.message} <span className="optional">({optional})</span>
        </label>
        <textarea id="rf-message" name="message" rows={3} maxLength={1000} className="input" />
      </div>
      <div className="field gap-1">
        <label className="check-row items-start">
          <input id="rf-consent" type="checkbox" name="consent" className="checkbox mt-0.5" aria-invalid={invalid('consent')} aria-describedby={invalid('consent') ? 'rf-consent-err' : undefined} />
          <span className="text-sm">{labels.consent}</span>
        </label>
        {msg('consent', E.consent)}
      </div>
      {status === 'error' && (
        <p className="flex gap-2.5 rounded-xl bg-error-soft p-4 text-sm font-semibold text-error" role="alert">
          <Icon name="alert" size={18} className="mt-0.5 flex-none" />
          {E.submit}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={status === 'sending'} aria-busy={status === 'sending'}>
        {status === 'sending' ? <Icon name="loader" size={18} className="animate-spin-slow" /> : null}
        {labels.submit}
      </button>
    </form>
  );
}
