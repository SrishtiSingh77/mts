"use client";

import { Quote, Star } from "lucide-react";

import { QuestionSummary } from "@/types";

interface SummaryCardProps {
  summary: QuestionSummary;
  index: number;
  totalSubmissions: number;
}

/** Stats are keyed off the question type, not off which fields happen to be non-null. */
export default function SummaryCard({ summary, index, totalSubmissions }: SummaryCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
      <header className="flex items-start justify-between border-b border-gray-100 pb-3">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Question {index + 1} • {summary.question_type.replace(/_/g, " ")}
          </span>
          <h3 className="text-base font-bold text-gray-900">{summary.question_title}</h3>
        </div>
        <span className="rounded-full border bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400">
          {summary.total_answers} of {totalSubmissions} answered
        </span>
      </header>

      <StatBody summary={summary} />
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
    <div className="space-y-3 pt-1">
      {options.map((option) => (
        <div key={option.label} className="space-y-1">
          <div className="flex justify-between text-xs font-medium text-gray-700">
            <span>{option.label}</span>
            <span>
              {option.count} ({option.percentage}%)
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-2.5 rounded-full bg-purple-600 transition-all duration-500"
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
    <div className="grid grid-cols-2 gap-4 pt-1">
      <div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-center">
        <span className="text-xs font-bold uppercase text-emerald-800">Yes</span>
        <p className="text-2xl font-extrabold text-emerald-700">{summary.yes_count ?? 0}</p>
      </div>
      <div className="space-y-1 rounded-xl border border-red-200 bg-red-50/40 p-4 text-center">
        <span className="text-xs font-bold uppercase text-red-800">No</span>
        <p className="text-2xl font-extrabold text-red-700">{summary.no_count ?? 0}</p>
      </div>
    </div>
  );
}

function RatingStats({ summary }: { summary: QuestionSummary }) {
  const max = summary.rating_max ?? 5;
  const distribution = summary.rating_distribution ?? {};
  const peak = Math.max(1, ...Object.values(distribution));

  return (
    <div className="space-y-4 pt-1">
      <div className="flex items-center space-x-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
        <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
        <span className="text-2xl font-extrabold text-gray-900">{summary.avg_rating ?? 0}</span>
        <span className="text-xs text-gray-500">/ {max} average rating</span>
      </div>

      <div className="flex items-end space-x-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((step) => {
          const count = distribution[step] ?? 0;
          return (
            <div key={step} className="flex flex-1 flex-col items-center space-y-1">
              <span className="text-[10px] font-semibold text-gray-500">{count}</span>
              <div
                className="w-full rounded-t bg-amber-400/80"
                style={{ height: `${Math.max(4, (count / peak) * 64)}px` }}
              />
              <span className="text-[10px] font-bold text-gray-400">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NumberStats({ summary }: { summary: QuestionSummary }) {
  const cells = [
    { label: "Average", value: summary.avg_number ?? 0 },
    { label: "Minimum", value: summary.min_number ?? 0 },
    { label: "Maximum", value: summary.max_number ?? 0 },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 pt-1">
      {cells.map(({ label, value }) => (
        <div key={label} className="space-y-1 rounded-xl border border-gray-200 bg-gray-50/60 p-4 text-center">
          <span className="text-xs font-medium text-gray-400">{label}</span>
          <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

function TextStats({ summary }: { summary: QuestionSummary }) {
  const responses = summary.text_responses ?? [];
  if (!responses.length) return <EmptyStat label="No responses recorded yet." />;

  return (
    <div className="max-h-72 space-y-2 overflow-y-auto pt-1">
      {responses.map((answer, index) => (
        <div
          key={`${index}-${answer.slice(0, 12)}`}
          className="shadow-2xs max-w-md space-y-1.5 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-800"
        >
          <Quote className="h-4 w-4 rotate-180 text-gray-400" />
          <p className="text-sm font-semibold text-gray-900">{answer}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyStat({ label }: { label: string }) {
  return <p className="py-4 text-center text-xs text-gray-400">{label}</p>;
}
