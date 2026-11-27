'use client';
// Dashboard widgets: A dashboard of widget tiles: the tile under the pointer lifts with its chart, and the others rise less with distance.
// Liniqo Live interactive figure (https://liniqo.com). Auto-tour + pointer.
import { useLiniqoLive } from './useLiniqoLive';

export default function DashboardWidgets({ className }: { className?: string }) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="dashboard-widgets"
      data-key="lq1.iu_nJMoooc1XSiN76K5AsK_iJI18hoPm1eWqsuKWCtzkhTP0vUKEgIZzvojOMDu5KlVxBMyHyD_7evmUGsBBtd1-09iK0e2F6Fch82JtaXdvRAbm6NVcLQ"
      data-accent="#52b788"
      data-line="#1e5c45"
      data-bg="#f3efe6"
      data-intensity="0.8"
      role="img"
      aria-label="Dashboard widgets"
    />
  );
}
