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
    <aside className="animate-fade-in z-30 flex h-full w-96 select-none flex-col border-l border-gray-300 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/60 p-4">
        <div className="flex items-center space-x-2">
          <button
            disabled={index === 0}
            onClick={() => onNavigate(index - 1)}
            aria-label="Previous response"
            className="rounded p-1 text-gray-600 hover:bg-gray-200 disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            disabled={index >= total - 1}
            onClick={() => onNavigate(index + 1)}
            aria-label="Next response"
            className="rounded p-1 text-gray-600 hover:bg-gray-200 disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-gray-600">
            {new Date(response.submitted_at).toLocaleDateString("en-GB", DATE_FORMAT)}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/40 p-5">
        <div className="shadow-2xs space-y-2 rounded-2xl border border-gray-200/90 bg-white p-4">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600">
            <Tag className="h-3.5 w-3.5 text-gray-500" />
            <span>Tags</span>
          </div>
          <span className="inline-block rounded-lg border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-400">
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
              className="shadow-2xs space-y-1.5 rounded-2xl border border-gray-200/90 bg-white p-4"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-800">
                <TypeIcon className={`h-3.5 w-3.5 flex-shrink-0 ${iconClass}`} />
                <span>{answer.question_title || `Question ${position + 1}`}</span>
              </div>
              <p className="whitespace-pre-wrap pl-5 pt-1 text-sm font-semibold text-gray-900">
                {answer.value || <span className="italic font-normal text-gray-400">Skipped</span>}
              </p>
            </div>
          );
        })}

        <div className="shadow-2xs space-y-2 rounded-2xl border border-gray-200/90 bg-white p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-800">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>Ending</span>
          </div>
          <span className="inline-block max-w-full truncate rounded-lg border bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {form.ending.title}
          </span>
        </div>

        <div className="shadow-2xs space-y-1.5 rounded-2xl border border-gray-200/90 bg-white p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
            <Hash className="h-3.5 w-3.5 text-gray-400" />
            <span>Response ID</span>
          </div>
          <p className="break-all pl-5 font-mono text-xs text-gray-700">{response.id}</p>
        </div>
      </div>
    </aside>
  );
}
