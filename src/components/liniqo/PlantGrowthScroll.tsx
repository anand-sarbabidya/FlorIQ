'use client';
// Plant growth: A seed in a flared pot that sprouts. Auto-sweep replaces scroll inside fixed slides.
// Liniqo Live interactive figure (https://liniqo.com). Auto-play + pointer.
import { useLiniqoLive } from './useLiniqoLive';

export default function PlantGrowthScroll({ className }: { className?: string }) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="plant-growth-scroll"
      data-key="lq1.twtPAubPQgtNBtgWDs96EfTudzrGnk0kiF4qolasC1kak4SmZ5Fi0uyZcdpu5hw-r3SqVce0YboS87L6Zi0Dh_AQIvmruVvQSu5y8csgdIYnL-vN9bskpA"
      data-accent="#3d9b6e"
      data-line="#1e5c45"
      data-bg="#f3efe6"
      data-intensity="0.8"
      role="img"
      aria-label="Plant growth"
    />
  );
}
