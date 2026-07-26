"use client";

import { Calendar, ChevronDown, Gem, Monitor } from "lucide-react";

import { FormSummary } from "@/types";

interface InsightsPanelProps {
  summary: FormSummary | null;
  questionCount: number;
}

export default function InsightsPanel({ summary, questionCount }: InsightsPanelProps) {
  const submissions = summary?.total_responses ?? 0;

  // Only metrics backed by stored data get a number; the rest show an em dash.
  const metrics = [
    { label: "Views", value: "—" },
    { label: "Starts", value: "—" },
    { label: "Submissions", value: String(submissions) },
    { label: "Questions", value: String(questionCount) },
    {
      label: "Answer coverage",
      value: submissions ? `${summary?.completion_rate ?? 0}%` : "—",
    },
    { label: "Time to complete", value: "—" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-hair bg-white px-3.5 py-2 text-[15px] text-ink">
          <span>All time</span>
          <Calendar className="h-4 w-4 text-muted" />
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-hair bg-white px-3.5 py-2 text-[15px] text-ink">
          <Monitor className="h-4 w-4 text-muted" />
          <span>All devices</span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      </div>

      <h2 className="mt-9 text-[28px] text-ink">Big picture</h2>

      {/* Plain columns, no cards — Typeform relies on scale for hierarchy here */}
      <div className="mt-5 flex flex-wrap gap-x-14 gap-y-7">
        {metrics.map(({ label, value }) => (
          <div key={label}>
            <span className="block text-[15px] text-muted">{label}</span>
            <p className="mt-1 text-[40px] leading-none text-ink">{value}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 max-w-xl text-[13px] text-faint">
        Views, starts and timing need partial-response capture, which this build does not record.
      </p>

      <div className="mt-10 rounded-2xl border border-hair bg-white p-2">
        <div className="rounded-xl bg-gradient-to-br from-[#eef8f4] to-[#d8efdf] p-9">
          <div className="max-w-lg">
            <h3 className="text-[24px] text-ink">Question-by-question insights</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-[#2c5d4a]">
              See where people abandon your form — the first step to improving your questions so you
              get more responses.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                disabled
                className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-[15px] font-medium text-white opacity-80"
              >
                <Gem className="h-4 w-4" />
                <span>Upgrade plan</span>
              </button>
              <button
                disabled
                className="rounded-lg border border-[#a7d4c6] bg-white px-4 py-2.5 text-[15px] text-ink opacity-80"
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
