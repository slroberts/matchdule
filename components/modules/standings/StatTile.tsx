/**
 * StatTile — Figma: StatTile. One number, one label (PL-stats style).
 * tone: positive → win green · negative → danger red · default → primary
 */

type Tone = 'default' | 'positive' | 'negative';

const TONES: Record<Tone, string> = {
  default: 'text-(--color-text-primary)',
  positive: 'text-(--color-text-win)',
  negative: 'text-(--color-danger-on-surface)',
};

export const StatTile = ({
  value,
  label,
  tone = 'default',
}: {
  value: string | number;
  label: string;
  tone?: Tone;
}) => (
  <div className='flex min-w-0 flex-col gap-0.5 rounded-(--radius-control) bg-(--color-bg-subtle) px-3 py-2.5'>
    <span className={`text-display font-bold tabular-nums ${TONES[tone]}`}>
      {value}
    </span>
    <span className='text-label truncate text-(--color-text-secondary)'>
      {label}
    </span>
  </div>
);
