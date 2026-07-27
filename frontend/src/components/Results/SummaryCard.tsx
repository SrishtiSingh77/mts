"use client";

import { Star } from "lucide-react";

import { FALLBACK_QUESTION_TITLE } from "@/lib/labels";
import { QuestionSummary } from "@/types";

interface SummaryCardProps {
  summary: QuestionSummary;
  index: number;
  totalSubmissions: number;
}

/** Stats are keyed off the question type, not off which fields happen to be non-null. */
export default function SummaryCard({ summary, index, totalSubmissions }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-hair bg-surface p-6">
      <header className="flex items-start justify-between gap-4 border-b border-hair pb-4">
        <div>
          <span className="text-[13px] uppercase tracking-wide text-muted">
            Question {index + 1} · {summary.question_type.replace(/_/g, " ")}
          </span>
          <h3 className="mt-1 text-[19px] text-ink">
            {summary.question_title.trim() || FALLBACK_QUESTION_TITLE}
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-panel px-3 py-1 text-[13px] text-muted">
          {summary.total_answers} of {totalSubmissions} answered
        </span>
      </header>

      <div className="pt-5">
        <StatBody summary={summary} />
      </div>
    </div>
  );
}

function StatBody({ summary }: { summary: QuestionSummary }) {
  switch (summary.question_type) {
    case "multiple_choice":
    case "dropdown":
      return <ChoiceStats summary={summary} />;
    case "yes_no":
      return <YesNoStats summary={summary} />;
    case "rating":
      return <RatingStats summary={summary} />;
    case "number":
      return <NumberStats summary={summary} />;
    default:
      return <TextStats summary={summary} />;
  }
}

function ChoiceStats({ summary }: { summary: QuestionSummary }) {
  const options = summary.options_stat ?? [];
  if (!options.length) return <EmptyStat label="No options configured." />;

  return (
    <div className="space-y-3.5">
      {options.map((option) => (
        <div key={option.label}>
          <div className="flex justify-between text-[15px] text-ink">
            <span>{option.label}</span>
            <span className="text-muted">
              {option.count} ({option.percentage}%)
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-panel">
            <div
              className="h-full rounded-full bg-inverse transition-all duration-500"
              style={{ width: `${option.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function YesNoStats({ summary }: { summary: QuestionSummary }) {
  return (
    <div className="flex gap-14">
      <Metric label="Yes" value={summary.yes_count ?? 0} />
      <Metric label="No" value={summary.no_count ?? 0} />
    </div>
  );
}

function RatingStats({ summary }: { summary: QuestionSummary }) {
  const max = summary.rating_max ?? 5;
  const distribution = summary.rating_distribution ?? {};
  const peak = Math.max(1, ...Object.values(distribution));

  return (
    <div>
      <div className="flex items-end gap-2">
        <Star className="mb-1.5 h-6 w-6 fill-ink text-ink" />
        <span className="text-[40px] leading-none text-ink">{summary.avg_rating ?? 0}</span>
        <span className="mb-1.5 text-[15px] text-muted">/ {max} average</span>
      </div>

      <div className="mt-6 flex max-w-md items-end gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((step) => {
          const count = distribution[step] ?? 0;
          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[12px] text-muted">{count}</span>
              <div
                className="w-full rounded-t bg-[#c9c9cf]"
                style={{ height: `${Math.max(4, (count / peak) * 64)}px` }}
              />
              <span className="text-[12px] text-faint">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NumberStats({ summary }: { summary: QuestionSummary }) {
  return (
    <div className="flex gap-14">
      <Metric label="Average" value={summary.avg_number ?? 0} />
      <Metric label="Minimum" value={summary.min_number ?? 0} />
      <Metric label="Maximum" value={summary.max_number ?? 0} />
    </div>
  );
}

function TextStats({ summary }: { summary: QuestionSummary }) {
  const responses = summary.text_responses ?? [];
  if (!responses.length) return <EmptyStat label="No responses recorded yet." />;

  return (
    <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
      {responses.map((answer, index) => (
        <p
          key={`${index}-${answer.slice(0, 12)}`}
          className="max-w-2xl rounded-lg bg-panel px-4 py-3 text-[15px] text-ink"
        >
          {answer}
        </p>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="block text-[15px] text-muted">{label}</span>
      <p className="mt-1 text-[34px] leading-none text-ink">{value}</p>
    </div>
  );
}

function EmptyStat({ label }: { label: string }) {
  return <p className="py-3 text-[15px] text-faint">{label}</p>;
}
