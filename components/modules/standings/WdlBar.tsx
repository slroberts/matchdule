/**
 * WdlBar — won / drawn / lost as proportions (read by color, no decoding "2–0–1").
 * Segments grow by count; empty results are omitted. The legend carries the numbers
 * as text, so the bar itself is decorative for screen readers.
 */

const SEGMENTS = [
  { key: 'w', className: 'bg-(--color-result-win)' },
  { key: 'd', className: 'bg-(--color-result-draw)' },
  { key: 'l', className: 'bg-(--color-result-loss)' },
] as const;

type Counts = { w: number; d: number; l: number };

export const WdlBar = (counts: Counts) => {
  const total = counts.w + counts.d + counts.l;
  return (
    <div
      aria-hidden='true'
      className='flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-(--color-bg-subtle)'
    >
      {total > 0 &&
        SEGMENTS.filter(({ key }) => counts[key] > 0).map(
          ({ key, className }) => (
            <span
              key={key}
              className={className}
              style={{ flexGrow: counts[key] }}
            />
          ),
        )}
    </div>
  );
};

export const WdlLegend = ({ w, d, l }: Counts) => (
  <p className='text-control flex flex-wrap gap-x-3 font-bold'>
    <span className='text-(--color-text-win)'>{w} Won</span>
    <span className='text-(--color-text-secondary)'>{d} Drawn</span>
    <span className='text-(--color-danger-on-surface)'>{l} Lost</span>
  </p>
);
