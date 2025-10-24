"use client";

import { PieChartPayload } from "@repo/types";
import { WidgetCard } from "./WidgetCard";

const DEFAULT_COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
  "#EC4899",
  "#0EA5E9",
];

interface PieChartWidgetProps {
  data: PieChartPayload;
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return "0%";
  }
  return `${(value * 100).toFixed(value * 100 >= 1 ? 1 : 2)}%`;
}

export function PieChartWidget({ data }: PieChartWidgetProps) {
  const entries = data.data ?? [];
  const total = entries.reduce((sum, entry) => sum + (entry.value ?? 0), 0);

  return (
    <WidgetCard title={data.title} className="w-full max-w-3xl">
      {entries.length === 0 || total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <span>No data available for pie chart.</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-8">
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 220 220" className="h-64 w-64">
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="transparent"
                stroke="#E5E7EB"
                strokeWidth="32"
              />
              {(() => {
                let cumulative = 0;
                const radius = 90;
                const circumference = 2 * Math.PI * radius;
                return entries.map((entry, index) => {
                  const value = entry.value ?? 0;
                  const percentage = total === 0 ? 0 : value / total;
                  const dash = percentage * circumference;
                  const startFraction = total === 0 ? 0 : cumulative / total;
                  cumulative += value;

                  return (
                    <circle
                      key={`${entry.label}-${index}`}
                      cx="110"
                      cy="110"
                      r={radius}
                      fill="transparent"
                      stroke={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                      strokeWidth="32"
                      strokeDasharray={`${dash} ${circumference}`}
                      strokeDashoffset={circumference * (1 - startFraction)}
                      transform="rotate(-90 110 110)"
                      strokeLinecap="butt"
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {data.totalLabel ?? "Total"}
              </span>
              <span className="text-2xl font-semibold text-foreground">
                {total.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {entries.map((entry, index) => {
              const value = entry.value ?? 0;
              const percentage = total === 0 ? 0 : value / total;
              const color = entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              return (
                <div key={`${entry.label}-${index}`} className="flex items-center gap-3">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {entry.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {value.toLocaleString()} · {formatPercentage(percentage)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}