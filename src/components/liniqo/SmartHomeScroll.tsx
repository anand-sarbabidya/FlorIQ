'use client';
// Smart home: A cut-away house whose devices switch on room by room. Auto-sweep replaces scroll inside fixed slides.
// Liniqo Live interactive figure (https://liniqo.com). Auto-play + pointer.
import { useLiniqoLive } from './useLiniqoLive';

export default function SmartHomeScroll({ className }: { className?: string }) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="smart-home-scroll"
      data-key="lq1.CVii4K4hQEjVNRGYriVVpRiHKzm-gQiZN00qxMjpiqmrPzNxp5CcwVWWSWNXDW79Yuo3hAWxZn25VdKO9icuC4B5FfgjdEosOuJZeBEF87UJIArpoG40qw"
      data-accent="#5b7f76"
      data-line="#1e5c45"
      data-bg="#f3efe6"
      data-intensity="0.8"
      role="img"
      aria-label="Smart home"
    />
  );
}
