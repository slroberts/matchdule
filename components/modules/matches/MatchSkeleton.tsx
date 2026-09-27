/**
 * MatchSkeleton — mirrors MatchCard's real geometry so there's no layout shift on load:
 * day header · meta row · 2 team rows (crest + name) · footer (directions + share).
 * Pulse only when motion is allowed.
 */

const Bone = ({ className = '' }: { className?: string }) => (
  <div
    className={`rounded-(--radius-full) bg-(--color-bg-subtle) ${className}`}
  />
);

const CardSkeleton = () => (
  <div className='flex w-full flex-col gap-(--space-stack-md) rounded-(--radius-card) bg-(--color-bg-surface) p-(--space-card-pad) shadow-(--shadow-card)'>
    {/* Meta */}
    <div className='flex items-center gap-(--space-stack-sm)'>
      <Bone className='size-4' />
      <Bone className='h-3.5 w-16' />
      <Bone className='ml-auto h-5 w-12' />
    </div>

    {/* Teams */}
    <div className='flex flex-col gap-(--space-stack-sm)'>
      {[0.75, 0.55].map((width) => (
        <div key={width} className='flex items-center gap-(--space-stack-md)'>
          <Bone className='size-(--size-avatar) shrink-0' />
          <div
            className='h-4 rounded-(--radius-full) bg-(--color-bg-subtle)'
            style={{ width: `${width * 100}%` }}
          />
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className='flex gap-(--space-stack-sm)'>
      <div className='min-h-(--size-tap) flex-1 rounded-(--radius-control) bg-(--color-bg-subtle)' />
      <div className='size-(--size-tap) rounded-(--radius-control) bg-(--color-bg-subtle)' />
    </div>
  </div>
);

export function MatchSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div
      role='status'
      aria-busy='true'
      className='mx-auto flex w-full max-w-lg flex-col gap-(--space-stack-md) px-(--space-gutter) motion-safe:animate-pulse'
    >
      <span className='visually-hidden'>Loading matches…</span>
      <Bone className='h-3 w-28' />
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
