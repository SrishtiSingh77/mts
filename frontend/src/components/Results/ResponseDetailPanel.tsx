"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Hash, MoreVertical, Sparkles, Tag, X } from "lucide-react";

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
    <motion.aside
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 32, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="z-30 flex h-full w-[420px] shrink-0 select-none flex-col border-l border-hair bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.06)]"
    >
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

        <span className="ml-auto mr-2 inline-flex items-center rounded-full border border-[#a7d4c6] bg-[#e6f4ef] px-2.5 py-0.5 text-[12px] text-brand-green">
          Completed
        </span>

        <button
          disabled
          aria-label="More actions"
          title="Coming soon"
          className="rounded p-1 text-faint"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

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
          <p className="break-all pl-5 text-[13px] text-ink">{response.id}</p>
        </div>
      </div>
    </motion.aside>
  );
}
