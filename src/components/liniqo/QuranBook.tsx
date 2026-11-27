'use client';
// Holy Qur'an stand-in: open ledger Live figure — pages turn under the pointer.
// Liniqo Live interactive figure (https://liniqo.com). Auto-tour + pointer.
import { useLiniqoLive } from './useLiniqoLive';

type QuranBookProps = {
  className?: string;
  /** Bright stroke (hairline hi). */
  accent?: string;
  /** Silhouette stroke (hairline edge). */
  line?: string;
  /** Plate / fill colour — use `transparent` for outline-only. */
  bg?: string;
};

export default function QuranBook({
  className,
  accent = '#d4bc7a',
  line = '#52b788',
  bg = 'transparent',
}: QuranBookProps) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="accounting-ledger"
      data-accent={accent}
      data-line={line}
      data-bg={bg}
      data-intensity="0.8"
      role="img"
      aria-label="The Holy Qur’an"
    />
  );
}
