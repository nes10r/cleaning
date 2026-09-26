import type { Dictionary } from '@/lib/dictionary';
import { Icon, type IconName } from '@/components/ui/icon';

const ICONS: IconName[] = ['userCheck', 'leaf', 'wallet', 'pointer', 'award', 'headset'];

/** Deep-green band: deliberately different from the white service cards. */
export function TrustBenefits({ dict }: { dict: Dictionary }) {
  const tr = dict.trust;
  return (
    <section className="on-dark relative overflow-hidden bg-primary py-16 text-white md:py-20 lg:py-28" aria-labelledby="trust-title">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 size-[32rem] rounded-full bg-[radial-gradient(closest-side,rgb(183_227_106/0.16),transparent)]" />
      <div className="container-x relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        <div className="reveal grid content-start justify-items-start gap-4">
          <span className="eyebrow bg-white/12 text-white">
            <Icon name="checkCircle" size={15} />
            {tr.eyebrow}
          </span>
          <h2 id="trust-title" className="text-h2 font-bold">
            {tr.title}
          </h2>
          <p className="text-lead max-w-[40ch] text-white/80">{tr.lead}</p>
        </div>
        <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {tr.items.map((item, i) => (
            <li key={item.title} className="reveal grid grid-cols-[3rem_minmax(0,1fr)] gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-white/10 text-accent ring-1 ring-white/15">
                <Icon name={ICONS[i]} size={24} strokeWidth={1.7} />
              </span>
              <div>
                <h3 className="text-[1.0625rem] font-bold">{item.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-white/75">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
