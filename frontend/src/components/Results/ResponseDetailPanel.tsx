"use client";

import { ChevronDown, ChevronUp, Hash, Sparkles, Tag, X } from "lucide-react";

import { questionTypeMeta } from "@/lib/questionTypes";
import { Form, FormResponseData } from "@/types";

interface ResponseDetailPanelProps {
  response: FormResponseData;
  form: Form;
  index: number;
  total: number;
  onNavigate: (nextIndex: number) => void;
  onClose: () => void;
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export default function ResponseDetailPanel({
  response,
  form,
  index,
  total,
  onNavigate,
  onClose,
}: ResponseDetailPanelProps) {
  return (
    <aside className="animate-fade-in z-30 flex h-full w-96 select-none flex-col border-l border-hair bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-hair bg-panel p-4">
        <div className="flex items-center space-x-2">
          <button
            disabled={index === 0}
            onClick={() => onNavigate(index - 1)}
            aria-label="Previous response"
            className="rounded p-1 text-muted hover:bg-panel disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            disabled={index >= total - 1}
            onClick={() => onNavigate(index + 1)}
            aria-label="Next response"
            className="rounded p-1 text-muted hover:bg-panel disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-muted">
            {new Date(response.submitted_at).toLocaleDateString("en-GB", DATE_FORMAT)}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className="rounded p-1 text-faint hover:bg-panel hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-stage p-5">
        <div className="shadow-2xs space-y-2 rounded-2xl border border-hair/90 bg-white p-4">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-muted">
            <Tag className="h-3.5 w-3.5 text-muted" />
            <span>Tags</span>
          </div>
          <span className="inline-block rounded-lg border border-dashed border-hair px-2.5 py-1 text-xs text-faint">
            Coming soon
          </span>
        </div>

        {response.answers.map((answer, position) => {
          const { icon: TypeIcon, iconClass } = questionTypeMeta(
            answer.question_type ?? "short_text"
          );
          return (
            <div
              key={answer.id || position}
              className="shadow-2xs space-y-1.5 rounded-2xl border border-hair/90 bg-white p-4"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-ink">
                <TypeIcon className={`h-3.5 w-3.5 flex-shrink-0 ${iconClass}`} />
                <span>{answer.question_title || `Question ${position + 1}`}</span>
              </div>
              <p className="whitespace-pre-wrap pl-5 pt-1 text-sm font-semibold text-ink">
                {answer.value || <span className="italic font-normal text-faint">Skipped</span>}
              </p>
            </div>
          );
        })}

        <div className="shadow-2xs space-y-2 rounded-2xl border border-hair/90 bg-white p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-ink">
            <Sparkles className="h-3.5 w-3.5 text-ink" />
            <span>Ending</span>
          </div>
          <span className="inline-block max-w-full truncate rounded-lg border bg-panel px-2.5 py-1 text-xs font-medium text-ink">
            {form.ending.title}
          </span>
        </div>

        <div className="shadow-2xs space-y-1.5 rounded-2xl border border-hair/90 bg-white p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-muted">
            <Hash className="h-3.5 w-3.5 text-faint" />
            <span>Response ID</span>
          </div>
          <p className="break-all pl-5 font-mono text-xs text-ink">{response.id}</p>
        </div>
      </div>
    </aside>
  );
}
