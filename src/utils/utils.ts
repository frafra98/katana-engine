import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toCamelCase(text: string) {
  if (!text) return '';

  return (
    text
      .trim()
      // Split on spaces, underscores, hyphens, OR camelCase boundaries
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/[\s_-]+/)
      .map((word: string, index: number) => {
        word = word.toLowerCase();
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('')
  );
}
