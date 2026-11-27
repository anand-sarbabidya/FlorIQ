'use client';
// Growth chart: Growth blocks stepping up like stairs: the pointer scrubs how far growth has come, and a flag rides the newest step.
// Liniqo Live interactive figure (https://liniqo.com). Auto-tour + pointer.
import { useLiniqoLive } from './useLiniqoLive';

export default function GrowthChart({ className }: { className?: string }) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="growth-chart"
      data-key="lq1.wC_87ZDC83iSqgd-jo4c2u0LW33lOoONffAySDktE9ryaX4voZncDRlix9a3_qyVw7i8sfhfO517kj59q-u2M4cPbwNM5ZYlBC8DQ-rViPv2pf3Vbfk0sg"
      data-accent="#3d9b6e"
      data-line="#1e5c45"
      data-bg="#f3efe6"
      data-intensity="0.8"
      role="img"
      aria-label="Growth chart"
    />
  );
}
