'use client';
// Status lights: A status panel of lamps: the lamp under the pointer pushes up out of its bezel, its neighbours a little after.
// Liniqo Live interactive figure (https://liniqo.com). Auto-tour + pointer.
import { useLiniqoLive } from './useLiniqoLive';

export default function StatusLights({ className }: { className?: string }) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="status-lights"
      data-key="lq1.rUVuzd_CAISKEKEQqp3ELriRMnNdmMQeDW661R55SIqEJq6eyjrh-0NimjFnX_PH_Rd6QI1TyzuQOb_G1sP0CzVmqmZV4Ge-rhlN4Detw3bb0GCx31dX_w"
      data-accent="#52b788"
      data-line="#1e5c45"
      data-bg="#f3efe6"
      data-intensity="0.8"
      role="img"
      aria-label="Status lights"
    />
  );
}
