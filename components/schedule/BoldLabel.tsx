export type TimingTone = 'conflict' | 'tightgap';

export default function BoldLabel({
  label,
  tone,
}: {
  label: string;
  tone: TimingTone;
}) {
  const sep = tone === 'conflict' ? '↔' : '→';

  const metaStart = label.lastIndexOf('(');
  const hasMeta = metaStart !== -1 && label.endsWith(')');
  const meta = hasMeta ? label.slice(metaStart).trim() : '';
  const main = hasMeta ? label.slice(0, metaStart).trim() : label.trim();

  const parts = main.split(sep).map((s) => s.trim());
  if (parts.length !== 2) return <>{label}</>;

  const parseSide = (s: string) => {
    const tokens = s.split(/\s+/).filter(Boolean);
    if (tokens.length < 2) return { team: s, time: '' };
    return { team: tokens.slice(0, -1).join(' '), time: tokens.at(-1) ?? '' };
  };

  const a = parseSide(parts[0]);
  const b = parseSide(parts[1]);

  return (
    <>
      <span className='font-bold'>{a.team}</span>{' '}
      <span className='font-bold'>{a.time}</span> {sep}{' '}
      <span className='font-bold'>{b.team}</span>{' '}
      <span className='font-bold'>{b.time}</span>{' '}
      {meta ? <span className='text-white/80'>{meta}</span> : null}
    </>
  );
}
