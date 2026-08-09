"use client";

import { useMemo, useState } from "react";
import type { DailyBookingPoint } from "@/features/bookings/stats";

const SERIES_COLOR = "#2563eb"; // matches the app's primary blue (buttonPrimary)
const WIDTH = 720;
const HEIGHT = 240;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function formatShortDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${day} ${monthNames[Number(month) - 1]}`;
}

export function StatsChart({ points }: { points: DailyBookingPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxCount = niceMax(Math.max(...points.map((p) => p.count), 0));
  const n = points.length;

  const xAt = (i: number) => PAD_LEFT + (n <= 1 ? plotWidth / 2 : (i / (n - 1)) * plotWidth);
  const yAt = (count: number) => PAD_TOP + plotHeight - (count / maxCount) * plotHeight;

  const linePath = useMemo(
    () => points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.count)}`).join(" "),
    [points, maxCount], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const baseline = PAD_TOP + plotHeight;
    const top = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.count)}`).join(" ");
    return `${top} L ${xAt(n - 1)} ${baseline} L ${xAt(0)} ${baseline} Z`;
  }, [points, maxCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const yTicks = [0, maxCount / 2, maxCount];

  // Show at most ~6 x-axis labels so dense ranges don't collide.
  const labelEvery = Math.max(1, Math.ceil(n / 6));

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (relX - PAD_LEFT) / plotWidth;
    const index = Math.round(ratio * (n - 1));
    setHoverIndex(Math.min(n - 1, Math.max(0, index)));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const tooltipLeft = hoverIndex !== null ? (xAt(hoverIndex) / WIDTH) * 100 : 0;
  const tooltipOnRight = tooltipLeft > 60;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        role="img"
        aria-label="Bookings created per day for the selected period"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke="#e1e0d9"
              strokeWidth={1}
            />
            <text x={PAD_LEFT - 8} y={yAt(tick)} textAnchor="end" dominantBaseline="middle" className="fill-gray-400 text-[10px]">
              {Math.round(tick)}
            </text>
          </g>
        ))}

        {points.map((p, i) =>
          i % labelEvery === 0 ? (
            <text
              key={p.date}
              x={xAt(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-gray-400 text-[10px]"
            >
              {formatShortDate(p.date)}
            </text>
          ) : null,
        )}

        <path d={areaPath} fill={SERIES_COLOR} fillOpacity={0.1} stroke="none" />
        <path d={linePath} fill="none" stroke={SERIES_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {hoverIndex !== null && (
          <>
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={PAD_TOP}
              y2={PAD_TOP + plotHeight}
              stroke="#c3c2b7"
              strokeWidth={1}
            />
            <circle
              cx={xAt(hoverIndex)}
              cy={yAt(points[hoverIndex].count)}
              r={5}
              fill={SERIES_COLOR}
              stroke="#fcfcfb"
              strokeWidth={2}
            />
          </>
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 min-w-[9rem] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: tooltipOnRight ? undefined : `${tooltipLeft}%`,
            right: tooltipOnRight ? `${100 - tooltipLeft}%` : undefined,
          }}
        >
          <p className="font-medium text-gray-900">{formatShortDate(hovered.date)}</p>
          <p className="mt-1 text-gray-600">
            <span className="font-semibold text-gray-900">{hovered.count}</span> booking
            {hovered.count === 1 ? "" : "s"}
          </p>
          <p className="text-gray-600">THB {hovered.totalAmount.toFixed(0)}</p>
        </div>
      )}
    </div>
  );
}
