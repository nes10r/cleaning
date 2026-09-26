import { adminModules } from '@/config/admin';
import { LogoMark } from '@/components/layout/logo';

export default function AdminHome() {
  return (
    <main className="container-x py-12">
      <div className="flex items-center gap-3">
        <LogoMark className="size-9 text-primary" />
        <h1 className="text-h3 font-bold">Administravimo skydelis</h1>
      </div>
      <p className="mt-3 max-w-[60ch] text-ink-2">Skydelis ruošiamas. Žemiau – numatyti moduliai. Prieš įjungiant bet kurį modulį būtina prisijungimo apsauga.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminModules.map((m) => (
          <li key={m.key} className="card p-5">
            <h2 className="font-bold">{m.title}</h2>
            <p className="mt-1 text-sm text-ink-2">{m.description}</p>
            <p className="mt-3 font-mono text-xs text-ink-muted">/admin/{m.key}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
