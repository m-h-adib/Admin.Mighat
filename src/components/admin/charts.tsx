"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/admin/overlay";
import { StatusDot, type BadgeTone } from "@/components/admin/primitives";
import { formatCompact, formatNumber, formatPercent } from "@/lib/admin/format";

function niceStep(max: number, ticks: number) {
  const raw = Math.max(1, max) / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return Math.max(1, nice * magnitude);
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry?.contentRect.width ?? 0)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

interface TrendChartProps {
  data: { key: string; label: string; detail: string; value: number }[];
  label: string;
  unit: string;
  height?: number;
}

export function TrendChart({ data, label, unit, height = 220 }: TrendChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId();
  const pad = { top: 14, bottom: 26, axis: 40, edge: 8 };
  const plotWidth = Math.max(0, width - pad.axis - pad.edge);
  const plotHeight = height - pad.top - pad.bottom;
  const peak = Math.max(...data.map((point) => point.value), 1);
  const step = niceStep(peak, 4);
  const top = Math.ceil(peak / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);

  const x = (index: number) =>
    pad.edge + plotWidth - (index / Math.max(1, data.length - 1)) * plotWidth;
  const y = (value: number) => pad.top + plotHeight - (value / top) * plotHeight;

  const line = data
    .map(
      (point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(point.value).toFixed(1)}`,
    )
    .join("");
  const area = `${line}L${x(data.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(plotWidth / 56)));

  function pick(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const offset = pad.edge + plotWidth - (event.clientX - box.left);
    const index = Math.round((offset / plotWidth) * (data.length - 1));
    setActive(Math.min(data.length - 1, Math.max(0, index)));
  }

  function onKey(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const forward = event.key === "ArrowLeft";
    setActive((current) => {
      const base = current ?? data.length - 1;
      return Math.min(data.length - 1, Math.max(0, base + (forward ? 1 : -1)));
    });
  }

  const point = active !== null ? data[active] : undefined;

  return (
    <div ref={ref} className="relative" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={label}
          tabIndex={0}
          onPointerMove={pick}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(data.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={onKey}
          style={{ direction: "ltr" }}
          className="block touch-pan-y outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-gold"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-firuze-deep)" stopOpacity={0.16} />
              <stop offset="100%" stopColor="var(--color-firuze-deep)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={pad.edge}
                x2={pad.edge + plotWidth}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
              <text
                x={width - 2}
                y={y(tick)}
                dy="0.32em"
                textAnchor="end"
                className="fill-ink-muted text-[0.6875rem] tabular-nums"
              >
                {formatCompact(tick)}
              </text>
            </g>
          ))}
          {data.map((entry, index) =>
            (data.length - 1 - index) % labelEvery === 0 ? (
              <text
                key={entry.key}
                x={x(index)}
                y={height - 6}
                textAnchor={
                  x(index) < pad.edge + 30
                    ? "start"
                    : x(index) > pad.edge + plotWidth - 30
                      ? "end"
                      : "middle"
                }
                className="fill-ink-muted text-[0.6875rem]"
              >
                {entry.label}
              </text>
            ) : null,
          )}
          <path d={area} fill={`url(#${gradientId})`} />
          <path
            d={line}
            fill="none"
            stroke="var(--color-firuze-deep)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {point && active !== null && (
            <g>
              <line
                x1={x(active)}
                x2={x(active)}
                y1={pad.top}
                y2={y(0)}
                stroke="var(--color-ink-muted)"
                strokeWidth={1}
                opacity={0.4}
              />
              <circle
                cx={x(active)}
                cy={y(point.value)}
                r={4.5}
                fill="var(--color-firuze-deep)"
                stroke="white"
                strokeWidth={2}
              />
            </g>
          )}
          <circle
            cx={x(data.length - 1)}
            cy={y(data[data.length - 1]?.value ?? 0)}
            r={4}
            fill="var(--color-firuze-deep)"
            stroke="white"
            strokeWidth={2}
          />
        </svg>
      )}
      {point && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 z-10 rounded-md border border-line bg-white px-2.5 py-1.5 shadow-pop"
          style={{
            insetInlineStart: Math.min(Math.max(0, width - x(active) - 70), width - 150),
          }}
        >
          <p className="text-sm font-bold text-ink tabular-nums">
            {formatNumber(point.value)}{" "}
            <span className="text-2xs font-normal text-ink-muted">{unit}</span>
          </p>
          <p className="text-2xs text-ink-muted">{point.detail}</p>
        </div>
      )}
    </div>
  );
}

export interface Segment {
  key: string;
  label: string;
  value: number;
  tone: BadgeTone;
  href?: string;
}

const segmentFill: Partial<Record<BadgeTone, string>> = {
  pending: "bg-status-pending",
  judging: "bg-status-judging",
  judged: "bg-status-judged",
  selected: "bg-status-selected",
  rejected: "bg-status-rejected",
  teal: "bg-firuze-deep",
  gold: "bg-gold",
  neutral: "bg-sage",
};

export function StackedBar({ segments, label }: { segments: Segment[]; label: string }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div>
      <div
        role="img"
        aria-label={label}
        className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-xs"
      >
        {total === 0 ? (
          <div className="h-full w-full bg-line" />
        ) : (
          segments
            .filter((segment) => segment.value > 0)
            .map((segment) => (
              <Tooltip
                key={segment.key}
                content={`${segment.label}: ${formatNumber(segment.value)} (${formatPercent(segment.value / total)})`}
              >
                <div
                  tabIndex={-1}
                  className={cn(
                    "h-full min-w-1 transition-opacity hover:opacity-80",
                    segmentFill[segment.tone],
                  )}
                  style={{ flexGrow: segment.value, flexBasis: 0 }}
                />
              </Tooltip>
            ))
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 xl:grid-cols-5">
        {segments.map((segment) => (
          <div key={segment.key} className="flex flex-col">
            <dt className="flex items-center gap-1.5 text-2xs text-ink-muted">
              <StatusDot tone={segment.tone} />
              {segment.label}
            </dt>
            <dd className="flex items-baseline gap-1.5 ps-3.5">
              <span className="text-sm font-bold text-ink tabular-nums">
                {formatNumber(segment.value)}
              </span>
              <span className="text-2xs text-ink-muted tabular-nums">
                {total ? `(${formatPercent(segment.value / total)})` : ""}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function BarList({
  items,
  label,
}: {
  items: { key: string; label: string; value: number }[];
  label: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <ul aria-label={label} className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.key} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-3">
          <span className="truncate text-caption text-ink">{item.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-green-900/5">
            <span
              className="block h-full rounded-full bg-firuze-deep transition-[width] duration-700 ease-miqat"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </span>
          <span className="text-end text-caption font-bold text-ink tabular-nums">
            {formatNumber(item.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({
  values,
  width = 96,
  height = 32,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const x = (index: number) => width - 3 - (index / (values.length - 1)) * (width - 6);
  const y = (value: number) => height - 3 - (value / max) * (height - 6);
  const points = values
    .map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`)
    .join(" ");
  const last = values.length - 1;
  return (
    <svg width={width} height={height} aria-hidden className="shrink-0 overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-mist)"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={x(last)}
        cy={y(values[last]!)}
        r={3}
        fill="var(--color-firuze-deep)"
        stroke="white"
        strokeWidth={1.5}
      />
    </svg>
  );
}
