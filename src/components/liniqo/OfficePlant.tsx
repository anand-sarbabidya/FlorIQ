'use client';
// Office plant: A plant on a desk: the leaf on the pointer's side reaches out towards it, and the leaves beside it follow a little.
// Liniqo Live interactive figure (https://liniqo.com). Auto-tour + pointer.
import { useLiniqoLive } from './useLiniqoLive';

type OfficePlantProps = {
  className?: string;
  /** Bright stroke (hairline hi). */
  accent?: string;
  /** Silhouette stroke (hairline edge). */
  line?: string;
  /** Plate / fill colour — use `transparent` for outline-only. */
  bg?: string;
};

export default function OfficePlant({
  className,
  accent = '#3d9b6e',
  line = '#1e5c45',
  bg = '#f3efe6',
}: OfficePlantProps) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="office-plant"
      data-key="lq1.Wersl7e1qBdFXNZGLOD2LsmbT1I7y7IWyys5XLA0girk__tNERRkPqqq-7G8N6ruO6pvJTsLp9LOmhWXfIGXYP0LJC_Tkjt6PehQMBbZF91rYag3uhSMkA"
      data-accent={accent}
      data-line={line}
      data-bg={bg}
      data-intensity="0.8"
      role="img"
      aria-label="Office plant"
    />
  );
}
