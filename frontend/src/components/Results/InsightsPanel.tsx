"use client";

import { Calendar, ChevronDown, Monitor } from "lucide-react";

import { FALLBACK_QUESTION_TITLE } from "@/lib/labels";
import { FormSummary } from "@/types";

interface InsightsPanelProps {
  summary: FormSummary | null;
  questionCount: number;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${String(Math.round(seconds % 60)).padStart(2, "0")}s`;
}

export default function InsightsPanel({ summary, questionCount }: InsightsPanelProps) {
  const views = summary?.views ?? 0;
  const starts = summary?.starts ?? 0;
  const submissions = summary?.submissions ?? 0;

  const metrics = [
    { label: "Views", value: String(views) },
    { label: "Starts", value: String(starts) },
    { label: "Submissions", value: String(submissions), accent: true },
    { label: "Completion rate", value: starts ? `${summary?.completion_rate ?? 0}%` : "—" },
    {
      label: "Time to complete",
      value: formatDuration(summary?.avg_completion_seconds ?? null),
    },
  ];

  const dropOff = summary?.drop_off ?? [];
  const worst = Math.max(1, ...dropOff.map((row) => row.reached));

  return (
    <div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-hair bg-surface px-3.5 py-2 text-[15px] text-ink">
          <span>All time</span>
          <Calendar className="h-4 w-4 text-muted" />
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-hair bg-surface px-3.5 py-2 text-[15px] text-ink">
          <Monitor className="h-4 w-4 text-muted" />
          <span>All devices</span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      </div>

      <h2 className="mt-9 text-[28px] text-ink">Big picture</h2>

      {/* Plain columns, no cards — Typeform relies on scale for hierarchy here */}
      <div className="mt-5 flex flex-wrap gap-x-14 gap-y-7">
        {metrics.map(({ label, value, accent }) => (
          <div key={label}>
            <span className="block text-[15px] text-muted">{label}</span>
            <p className={`mt-1 text-[40px] leading-none ${accent ? "text-brand-green" : "text-ink"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {summary && summary.partials > 0 && (
        <p className="mt-4 text-[14px] text-muted">
          {summary.partials} {summary.partials === 1 ? "person" : "people"} started but did not
          finish.
        </p>
      )}

      {/* Question-by-question funnel, derived from where each partial stopped */}
      <section className="mt-11">
        <h2 className="text-[28px] text-ink">Question by question</h2>
        <p className="mt-1.5 text-[15px] text-muted">
          How many people reached each question, and how many left there.
        </p>

        {dropOff.length === 0 ? (
          <p className="mt-6 text-[15px] text-faint">
            No responses yet — {questionCount} question{questionCount === 1 ? "" : "s"} waiting.
          </p>
        ) : (
          <ol className="mt-6 space-y-2.5">
            {dropOff.map((row, index) => (
              <li
                key={row.question_id}
                className="flex items-center gap-4 rounded-xl border border-hair bg-surface px-4 py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-inverse text-[12px] font-medium text-on-inverse">
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-ink">
                    {row.question_title.trim() || FALLBACK_QUESTION_TITLE}
                  </span>
                  <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-panel">
                    <span
                      className="block h-full rounded-full bg-brand-green"
                      style={{ width: `${(row.reached / worst) * 100}%` }}
                    />
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-[15px] text-ink">{row.reached} reached</span>
                  <span
                    className={`block text-[13px] ${
                      row.dropped > 0 ? "text-[#c0392b]" : "text-muted"
                    }`}
                  >
                    {row.dropped > 0 ? `−${row.dropped} left (${row.drop_rate}%)` : "no drop-off"}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
