'use client';
// Automation gears: A train of three gears: the pointer's sweep turns the train, each gear by its ratio, the small one fastest.
// Liniqo Live interactive figure (https://liniqo.com). Auto-tour + pointer.
import { useLiniqoLive } from './useLiniqoLive';

export default function AutomationGears({ className }: { className?: string }) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="automation-gears"
      data-key="lq1.oV1Mebk-P0BM2dX5SdDKrWkxZSlGzFe8s8KWWcbB3aes1TrzllrK5TL-qmlnTDK-RtkZLJLxRmSEVDgYvwFzANaqpnBNk0dGyhyPlaWs1lGZ7E_pxJBi1A"
      data-accent="#6b9e88"
      data-line="#1e5c45"
      data-bg="#f3efe6"
      data-intensity="0.8"
      role="img"
      aria-label="Automation gears"
    />
  );
}
