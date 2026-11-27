'use client';
// Team avatars: A row of team avatars on posts: the one under the pointer rises, and its neighbours rise a little after it.
// Liniqo Live interactive figure (https://liniqo.com). Auto-tour + pointer.
import { useLiniqoLive } from './useLiniqoLive';

export default function TeamAvatars({ className }: { className?: string }) {
  const ref = useLiniqoLive({ auto: true });
  return (
    <div
      ref={ref}
      className={className}
      data-liniqo="team-avatars"
      data-key="lq1.MqlqHcx8c2CKDKwrioxA2h_pjCljOiS8v3Np9hgJQ2ajn_eZ4RPObQ2bMy8hPaF73Vj92ur08CK8nPuHJAGMMPrSiNxYFLjfFqdvVGD-RLiLkTVt3ZUhtQ"
      data-accent="#3d9b6e"
      data-line="#1e5c45"
      data-bg="#f3efe6"
      data-intensity="0.8"
      role="img"
      aria-label="Team avatars"
    />
  );
}
