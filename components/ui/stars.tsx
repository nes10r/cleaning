import { Icon } from './icon';

export function Stars({ label }: { label: string }) {
  return (
    <div className="flex gap-0.5 text-rating" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" size={17} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}
