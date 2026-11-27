'use client';
// Pricing tiers: Three pricing tiers as pedestals: the tier under the pointer rises, and the other two settle down.
// Liniqo Live interactive figure (https://liniqo.com). Auto-tour + pointer.
import { useLiniqoLive } from './useLiniqoLive';

export default function PricingTiers({ className }: { className?: string }) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="pricing-tiers"
      data-key="lq1.QnNvV8lz6AONUq_kVsasqkMNPlIG1_FXHFaNKtSnKU7hOlbf4Tzy4YKAHWfvNeNrtF9wpyouKeDm8vKsBq-YqI3HUapaWY4gXMg_lsr3B6pYteoC4iUlTw"
      data-accent="#c4a574"
      data-line="#1e5c45"
      data-bg="#f3efe6"
      data-intensity="0.8"
      role="img"
      aria-label="Pricing tiers"
    />
  );
}
