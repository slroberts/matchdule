import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * global.css composite text styles (.text-display … .text-label) set font family,
 * size, weight, leading and tracking together. Registering them as their own group
 * stops tailwind-merge from mistaking them for text COLORS and deleting them when
 * a `text-(--color-…)` class follows.
 */
const twMerge = extendTailwindMerge<'text-style'>({
  extend: {
    classGroups: {
      'text-style': [
        { text: ['display', 'score', 'title', 'control', 'meta', 'label'] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
