"use client";

import { Calendar, Monitor } from "lucide-react";

import { FormSummary } from "@/types";

interface InsightsPanelProps {
  summary: FormSummary | null;
  questionCount: number;
}

export default function InsightsPanel({ summary, questionCount }: InsightsPanelProps) {
  const submissions = summary?.total_responses ?? 0;

  // Only metrics we actually store are shown as numbers; the rest are labelled placeholders.
  const metrics = [
    { label: "Submissions", value: String(submissions), accent: true },
    { label: "Questions", value: String(questionCount) },
    {
      label: "Answer coverage",
      value: submissions ? `${summary?.completion_rate ?? 0}%` : "—",
      hint: "Share of questions answered per submission",
    },
    { label: "Views", value: "Coming soon", muted: true },
    { label: "Time to complete", value: "Coming soon", muted: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 text-xs">
        <span className="shadow-2xs flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700">
          <Calendar className="h-3.5 w-3.5" />
          <span>All time</span>
        </span>
        <span className="shadow-2xs flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700">
          <Monitor className="h-3.5 w-3.5" />
          <span>All devices</span>
        </span>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Big picture</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {metrics.map(({ label, value, accent, muted, hint }) => (
            <div
              key={label}
              className="shadow-2xs space-y-1 rounded-2xl border border-gray-200 bg-white p-5"
            >
              <span className="text-xs font-medium text-gray-400">{label}</span>
              <p
                className={`font-extrabold ${
                  muted
                    ? "text-xs text-gray-400"
                    : accent
                      ? "text-3xl text-purple-600"
                      : "text-3xl text-gray-900"
                }`}
              >
                {value}
              </p>
              {hint && <span className="block text-[10px] leading-tight text-gray-400">{hint}</span>}
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-8">
        <div className="max-w-lg space-y-2">
          <h3 className="text-lg font-bold text-emerald-950">Question-by-question insights</h3>
          <p className="text-xs leading-relaxed text-emerald-800">
            Drop-off tracking per question needs partial-response capture, which this build does not
            record yet.
          </p>
          <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
