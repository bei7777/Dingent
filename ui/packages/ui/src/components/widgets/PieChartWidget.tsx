"use client";

import { useEffect, useId, useMemo } from "react";
import { PieChartPayload, PieChartSlice } from "@repo/types";
import { WidgetCard } from "./WidgetCard";

type PieChartWidgetProps = {
  data: PieChartPayload;
  showCard?: boolean;
};

const FALLBACK_COLORS = [
  "#6366F1",
  "#22C55E",
  "#F97316",
  "#EC4899",
  "#0EA5E9",
  "#8B5CF6",
  "#14B8A6",
  "#F59E0B",
];

const LEGEND_ITEM_CLASSES =
  "flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/60 px-3 py-2";

const CHART_SIZE = 224; // px
const TAU = Math.PI * 2;

type Segment = {
  label: string;
  value: number;
  percent: number;
  path: string;
  color: string;
};

function polarToCartesian(angle: number) {
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
}

export function PieChartWidget({ data, showCard = true }: PieChartWidgetProps) {
  const chartId = useId();
  const { title, description, totalLabel } = data;

  const segments = useMemo<Segment[]>(() => {
    const slicesSource =
      Array.isArray(data.slices) && data.slices.length > 0
        ? data.slices
        : Array.isArray(data.data)
          ? data.data
          : [];

    const slices: PieChartSlice[] = Array.isArray(slicesSource)
      ? (slicesSource as PieChartSlice[])
      : [];
    const total = slices
      .map((slice) => Number(slice?.value ?? 0))
      .filter((value) => Number.isFinite(value) && value > 0)
      .reduce((sum, value) => sum + value, 0);

    if (!total) {
      return [];
    }

    let cumulative = 0;
    return slices
      .map((slice, index) => {
        const rawValue = Number(slice?.value ?? 0);
        if (!Number.isFinite(rawValue) || rawValue <= 0) {
          return null;
        }

        const startAngle = (cumulative / total) * TAU - Math.PI / 2;
        cumulative += rawValue;
        const endAngle = (cumulative / total) * TAU - Math.PI / 2;
        const { x: startX, y: startY } = polarToCartesian(startAngle);
        const { x: endX, y: endY } = polarToCartesian(endAngle);
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

        const path = [
          "M 0 0",
          `L ${startX.toFixed(5)} ${startY.toFixed(5)}`,
          `A 1 1 0 ${largeArcFlag} 1 ${endX.toFixed(5)} ${endY.toFixed(5)}`,
          "Z",
        ].join(" ");

        const fallbackColor =
          FALLBACK_COLORS[index % FALLBACK_COLORS.length] ??
          FALLBACK_COLORS[0] ??
          "#6366F1";

        return {
          label: String(slice?.label ?? slice?.name ?? `Slice ${index + 1}`),
          value: rawValue,
          percent: (rawValue / total) * 100,
          path,
          color: slice?.color ?? fallbackColor,
        } satisfies Segment;
      })
      .filter((segment): segment is Segment => Boolean(segment));
  }, [data.data, data.slices]);

  const totalValue = useMemo(() => {
    return segments.reduce((sum, segment) => sum + segment.value, 0);
  }, [segments]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && segments.length === 0) {
      // eslint-disable-next-line no-console
      console.debug("PieChartWidget: no valid slices to display", data);
    }
  }, [data, segments]);

  const content = (
    <div className="flex flex-col gap-6" style={{ gap: "1.5rem" }}>
      <div
        className="flex flex-col items-center justify-center gap-4 md:flex-row"
        style={{ gap: "1rem" }}
      >
        <figure
          aria-describedby={description ? `${chartId}-description` : undefined}
          aria-labelledby={`${chartId}-title`}
          className="relative flex items-center justify-center"
        >
          <svg
            viewBox="-1 -1 2 2"
            role="img"
            aria-label={title ?? "Pie chart"}
            width={CHART_SIZE}
            height={CHART_SIZE}
            className="h-56 w-56 md:h-64 md:w-64"
          >
            <circle cx={0} cy={0} r={1} className="fill-muted/40" />
            {segments.map((segment, index) => (
              <path
                key={`${chartId}-${index}`}
                d={segment.path}
                fill={segment.color}
                stroke="white"
                strokeWidth={0.01}
              >
                <title>{`${segment.label}: ${segment.value} (${segment.percent.toFixed(1)}%)`}</title>
              </path>
            ))}
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {totalLabel ?? "Total"}
            </span>
            <span className="text-2xl font-semibold text-foreground">
              {totalValue.toLocaleString()}
            </span>
          </div>
        </figure>
        <div className="flex-1">
          <h3
            id={`${chartId}-title`}
            className="text-lg font-semibold text-foreground"
          >
            {title ?? "Pie chart"}
          </h3>
          {description ? (
            <p
              id={`${chartId}-description`}
              className="mt-1 text-sm text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
          <ul className="mt-4 space-y-2">
            {segments.map((segment, index) => (
              <li key={`${chartId}-legend-${index}`} className={LEGEND_ITEM_CLASSES}>
                <div className="flex items-center gap-2" style={{ columnGap: 8 }}>
                  <span
                    className="rounded-full"
                    style={{
                      backgroundColor: segment.color,
                      width: 12,
                      height: 12,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-foreground">
                    {segment.label}
                  </span>
                </div>
                <div
                  className="flex items-baseline gap-2 text-sm"
                  style={{ columnGap: 8 }}
                >
                  <span className="font-semibold text-foreground">
                    {segment.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {segment.percent.toFixed(1)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {segments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No data available to render the pie chart.
        </p>
      ) : null}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return <WidgetCard>{content}</WidgetCard>;
}
