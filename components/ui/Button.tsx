import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm',
    secondary:
      'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20',
    outline:
      'border-1 border-divider bg-transparent text-brand-navy hover:bg-surface-canvas',
    ghost:
      'bg-transparent text-surface-muted hover:text-brand-navy hover:bg-surface-canvas',
  };

  const sizes = {
    sm: 'px-3 py-1 text-[10px]',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-md',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold capitalize tracking-normal transition-colors gap-1.5 active:scale-95',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
