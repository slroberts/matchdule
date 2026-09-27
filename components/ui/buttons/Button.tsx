import { cn } from '@/lib/utils';

/**
 * Button — Figma: Atoms › Button (Type=Primary|Text · State=Default|Disabled)
 * Every size keeps the 44px tap target; sizes only change horizontal padding.
 * Labels are sentence case (no `capitalize`): "Clear filters", not "Clear Filters".
 */

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'muted';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  /* Figma Primary — one per view */
  primary:
    'bg-(--color-bg-inverse) text-(--color-text-on-inverse) shadow-(--shadow-control-selected)',
  /* Raised neutral (same material as FilterChip default) */
  secondary:
    'bg-(--color-bg-surface) text-(--color-text-primary) shadow-(--shadow-control)',
  /* Hairline only — for low-emphasis actions on busy surfaces */
  outline:
    'bg-transparent text-(--color-text-primary) ring-1 ring-(--color-border-strong) ring-inset hover:bg-(--color-bg-subtle)',
  /* Figma Text — Reset, Clear all, Back to this week */
  ghost:
    'bg-transparent text-(--color-text-primary) hover:bg-(--color-bg-subtle)',
  /* Tinted well — secondary actions inside cards */
  muted:
    'bg-(--color-bg-subtle) text-(--color-text-primary) hover:text-(--color-text-primary)',
};

const SIZES: Record<Size, string> = {
  sm: 'px-(--space-stack-sm)',
  md: 'px-(--space-stack-md) py-(--space-stack-sm)',
  lg: 'px-6 py-(--space-stack-md)',
};

/* Disabled look for both `disabled` and `aria-disabled` (the latter stays focusable,
   so screen readers can still reach it and hear why it's unavailable) */
const DISABLED =
  'disabled:cursor-not-allowed disabled:bg-(--color-bg-subtle) disabled:text-(--color-text-disabled) disabled:shadow-none disabled:ring-0 ' +
  'aria-disabled:cursor-not-allowed aria-disabled:bg-(--color-bg-subtle) aria-disabled:text-(--color-text-disabled) aria-disabled:shadow-none aria-disabled:ring-0';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      'pressable text-control inline-flex min-h-(--size-tap) items-center justify-center gap-(--space-stack-sm) rounded-(--radius-control)',
      'transition-[background-color,color,box-shadow] duration-(--duration-fade)',
      '[&_svg]:size-4 [&_svg]:shrink-0',
      VARIANTS[variant],
      SIZES[size],
      DISABLED,
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
