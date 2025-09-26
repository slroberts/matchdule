import { cn } from '@/lib/utils';

export default function DividerDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-block size-1.5 rounded-full bg-border align-middle',
        className
      )}
      aria-hidden
    />
  );
}
