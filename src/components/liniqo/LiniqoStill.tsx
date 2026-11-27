"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";

/**
 * Liniqo illustration from the ZIP library.
 * Auto: float SVG (draw-in + ambient bob). Manual: pointer tilt on hover/touch.
 */
export default function LiniqoStill({
  id,
  alt,
  className,
  animated = true,
  interactive = true,
}: {
  id: string;
  alt: string;
  className?: string;
  /** Use draw+float animated SVG when available (default on for ambient motion) */
  animated?: boolean;
  /** Pointer tilt / follow (default on) */
  interactive?: boolean;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  // Cache-bust after premium multi-tone recolor
  const v = "v=color4";
  const primary = animated
    ? `/assets/liniqo/float/${id}.svg?${v}`
    : `/assets/liniqo/still/${id}.svg?${v}`;
  const fallbacks = animated
    ? [
        `/assets/liniqo/still/${id}.svg?${v}`,
        `/assets/liniqo/still-dark/${id}.svg?${v}`,
        `/assets/liniqo/${id}.svg?${v}`,
      ]
    : [
        `/assets/liniqo/still-dark/${id}.svg?${v}`,
        `/assets/liniqo/${id}.svg?${v}`,
      ];

  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!interactive) return;
    const node = wrapRef.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    node.style.setProperty("--lq-tilt-x", `${(-y * 14).toFixed(2)}deg`);
    node.style.setProperty("--lq-tilt-y", `${(x * 16).toFixed(2)}deg`);
    node.style.setProperty("--lq-lift", "1");
  };

  const onLeave = () => {
    const node = wrapRef.current;
    if (!node) return;
    node.style.setProperty("--lq-tilt-x", "0deg");
    node.style.setProperty("--lq-tilt-y", "0deg");
    node.style.setProperty("--lq-lift", "0");
  };

  return (
    <span
      ref={wrapRef}
      className={`lq-still-wrap${interactive ? " lq-still-wrap--interactive" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--lq-tilt-x": "0deg",
          "--lq-tilt-y": "0deg",
          "--lq-lift": "0",
        } as CSSProperties
      }
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerCancel={onLeave}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={primary}
        alt={alt}
        className="lq-still"
        width={200}
        height={200}
        decoding="async"
        draggable={false}
        onError={(e) => {
          const img = e.currentTarget;
          const i = Number(img.dataset.fb || "0");
          if (i >= fallbacks.length) return;
          img.dataset.fb = String(i + 1);
          img.src = fallbacks[i];
        }}
      />
    </span>
  );
}
