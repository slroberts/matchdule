import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'destructive' | 'warning' | 'default';
  className?: string;
}

export const Badge = ({
  children,
  variant = 'default',
  className,
}: BadgeProps) => {
  const variants = {
    default: 'bg-surface-muted text-white',
    primary: 'bg-brand-primary/20 text-brand-primary',
    destructive: 'bg-status-conflict text-white',
    warning: 'bg-status-warning text-white',
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gp-1',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};
