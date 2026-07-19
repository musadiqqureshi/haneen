"use client";

import { useMemo, useRef, useState } from "react";
import { CHART } from "./tokens";
import { formatPrice } from "@/lib/utils";

export interface AreaPoint {
  date: string;
  value: number;
}

/**
 * Single-series area chart (change over time).
 * One series → no legend; the card title names it. Recessive grid, 2px line,
 * crosshair + tooltip on hover, and a table view for accessibility.
 */
export function AreaChart({
  data,
  height = 240,
  color = CHART.gold,
  format = "number",
  label = "Value",
}: {
  data: AreaPoint[];
  height?: number;
  color?: string;
  format?: "currency" | "number";
  label?: string;
}) {
  // Formatting lives in the client so no function prop crosses the RSC boundary.
  const formatValue = (n: number) =>
    format === "currency" ? formatPrice(n) : n.toLocaleString("en-PK");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const W = 800; // viewBox units; scales responsively
  const H = height;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 26;

  const { line, area, xs, ys, max } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 1);
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;
    const xs = data.map((_, i) => padL + i * stepX);
    const ys = data.map((d) => padT + innerH - (d.value / max) * innerH);
    const line = xs
      .map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)},${ys[i].toFixed(1)}`)
      .join(" ");
    const area = `${line} L${xs[xs.length - 1]},${padT + innerH} L${xs[0]},${padT + innerH} Z`;
    return { line, area, xs, ys, max };
  }, [data, H]);

  function onMove(e: React.MouseEvent) {
    const el = wrapRef.current;
    if (!el || data.length === 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width; // 0..1
    const idx = Math.round(ratio * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, idx)));
  }

  const gridLines = [0, 0.5, 1];
  const tickIdx = [0, Math.floor(data.length / 3), Math.floor((2 * data.length) / 3), data.length - 1];
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const active = hover != null ? data[hover] : null;

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="relative w-full"
        style={{ height: H }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label={`${label} over time`}
        >
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.26" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* recessive grid */}
          {gridLines.map((g) => {
            const y = padT + (H - padT - padB) * g;
            return (
              <line
                key={g}
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                stroke="#e8e0d5"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          <path d={area} fill="url(#areaFill)" />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* crosshair */}
          {hover != null && (
            <>
              <line
                x1={xs[hover]}
                x2={xs[hover]}
                y1={padT}
                y2={H - padB}
                stroke="#9c9188"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={xs[hover]}
                cy={ys[hover]}
                r="4"
                fill={color}
                stroke="#fff"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>

        {/* tooltip */}
        {active && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(xs[hover!] / W) * 100}%`,
              top: `${(ys[hover!] / H) * 100}%`,
              marginTop: -10,
            }}
          >
            <p className="whitespace-nowrap font-medium text-ink">
              {formatValue(active.value)}
            </p>
            <p className="whitespace-nowrap text-ink-muted">{fmtDate(active.date)}</p>
          </div>
        )}
      </div>

      {/* x labels + max */}
      <div className="mt-1 flex justify-between text-[0.62rem] text-ink-muted">
        {tickIdx
          .filter((i, n, arr) => data[i] && arr.indexOf(i) === n)
          .map((i) => (
            <span key={i}>{fmtDate(data[i].date)}</span>
          ))}
      </div>
      <p className="sr-only">
        Peak {label.toLowerCase()}: {formatValue(max)}
      </p>
    </div>
  );
}
