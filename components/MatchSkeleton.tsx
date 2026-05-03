export function MatchSkeleton() {
  return (
    <div className='flex flex-col gap-4 w-full max-w-md mx-auto'>
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className='h-56 w-full rounded-2xl bg-slate-200 animate-pulse'
        />
      ))}
    </div>
  );
}
