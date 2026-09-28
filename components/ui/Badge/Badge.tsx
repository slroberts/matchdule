import { cn } from '@/lib/utils';

/**
 * Badge — Figma: Atoms › Badge (Tone=Neutral|Inverse|Warning|Accent · + Danger)
 *
 * Size = hierarchy, not decoration:
 *   xs           — inline tag beside label text (header "This week") · 10px caps, 7×3px, ~16px tall
 *   sm (default) — metadata: Home/Away, status, alerts · text-label (11/12px caps)
 *   md           — identity next to a name when it needs more weight · text-control (13/14px)
 *
 * The text style is applied OUTSIDE cn() so tailwind-merge can never mistake
 * `text-label` for a color and drop it next to `text-(--color-…)`.
 * Keep source strings sentence case — caps come from the text style.
 */

type Variant =
  | 'default'
  | 'inverse'
  | 'accent'
  | 'primary'
  | 'warning'
  | 'destructive';
type Size = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

const TEXT_STYLE: Record<Size, string> = {
  /* A hair smaller than the adjacent label so it reads as a tag ON it, with room to breathe */
  xs: 'text-label text-[0.625rem] leading-none tracking-[0.08em]',
  sm: 'text-label',
  md: 'text-control',
};

const SIZES: Record<Size, string> = {
  xs: 'px-1.75 py-0.75 [&_svg]:size-2.5',
  sm: 'px-(--space-stack-sm) py-(--space-stack-xs) [&_svg]:size-3',
  md: 'px-(--space-stack-md) py-(--space-stack-xs) [&_svg]:size-3.5',
};

const VARIANTS: Record<Variant, string> = {
  /* Neutral — Home/Away, status */
  default: 'bg-(--color-bg-subtle) text-(--color-text-secondary)',
  /* Inverse — age group (U9 / U13) */
  inverse: 'bg-(--color-bg-inverse) text-(--color-text-on-inverse)',
  /* Accent — "you are here" status (This week). Tinted surface, no border.
     Text ≥4.5:1 light, ≥6:1 dark */
  accent: 'bg-(--color-accent-surface) text-(--color-accent-on-surface)',
  /** @deprecated use `accent` — kept so existing call sites don't break */
  primary: 'bg-(--color-accent-surface) text-(--color-accent-on-surface)',
  /* Status badges = neutral pill + navy text; the ICON carries the meaning.
     Tight gap, Time TBD, Pending */
  warning:
    'bg-(--color-bg-subtle) text-(--color-text-primary) [&_svg]:text-(--color-warning-icon)',
  /* Conflict */
  destructive:
    'bg-(--color-bg-subtle) text-(--color-text-primary) [&_svg]:text-(--color-danger-icon)',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) => (
  <span
    className={`${TEXT_STYLE[size]} ${cn(
      'inline-flex shrink-0 items-center gap-(--space-stack-xs) whitespace-nowrap rounded-(--radius-full) [&_svg]:shrink-0',
      SIZES[size],
      VARIANTS[variant],
      className,
    )}`}
  >
    {children}
  </span>
);
