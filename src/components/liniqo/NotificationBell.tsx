'use client';
// Notification bell tray: A desk bell and its notification cards: the card under the pointer lifts, and the bell's plunger dips.
// Liniqo Live interactive figure (https://liniqo.com). Auto-tour + pointer.
import { useLiniqoLive } from './useLiniqoLive';

export default function NotificationBellTray({ className }: { className?: string }) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="notification-bell-tray"
      data-key="lq1.qj729sGr18MRV20x_fT9eUA4xF5AsmjBdJ5by3jQv36EExNYCpyccTdiqhgZPO-Ky16XWhct2g1filaOHcuVn8yRGvjyB0ryGV8-bz4sVWNoscBI9Jq4VQ"
      data-accent="#52b788"
      data-line="#1e5c45"
      data-bg="#f3efe6"
      data-intensity="0.8"
      role="img"
      aria-label="Notification bell tray"
    />
  );
}
