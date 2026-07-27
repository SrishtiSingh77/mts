"use client";

import {
  ArrowDownUp,
  Calendar,
  Download,
  Filter,
  Inbox,
  Maximize2,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

import { endingLabel, questionLabel } from "@/lib/labels";
import { questionTypeMeta } from "@/lib/questionTypes";
import { FormResponseData, Question } from "@/types";

interface ResponsesTableProps {
  responses: FormResponseData[];
  questions: Question[];
  endingTitle: string;
  selectedIds: string[];
  searchQuery: string;
  isGenerating: boolean;
  csvUrl: string;
  onSearchChange: (query: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onOpenDetail: (index: number) => void;
  onGenerateTestResponse: () => void;
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

export default function ResponsesTable({
  responses,
  questions,
  endingTitle,
  selectedIds,
  searchQuery,
  isGenerating,
  csvUrl,
  onSearchChange,
  onToggleSelect,
  onToggleSelectAll,
  onOpenDetail,
  onGenerateTestResponse,
}: ResponsesTableProps) {
  const allSelected = responses.length > 0 && selectedIds.length === responses.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-hair bg-surface">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-hair px-3 py-2.5">
        <span className="flex items-center gap-2 rounded-lg bg-panel px-3 py-1.5 text-[14px] text-ink">
          <Inbox className="h-4 w-4" />
          <span>Responses</span>
        </span>

        <span
          className="flex items-center gap-2 px-2 py-1.5 text-[14px] text-faint"
          title="Spam filtering — coming soon"
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Spam [0]</span>
        </span>

        <label className="flex items-center gap-2 rounded-lg border border-hair px-3 py-1.5">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search responses"
            className="w-40 bg-transparent text-[14px] text-ink placeholder:text-muted focus:outline-none"
          />
        </label>

        <span className="flex items-center gap-2 rounded-lg border border-hair px-3 py-1.5 text-[14px] text-ink">
          <Calendar className="h-4 w-4" />
          <span>All time</span>
        </span>

        {[
          { icon: Filter, label: "Filters" },
          { icon: ArrowDownUp, label: "Sort" },
          { icon: SlidersHorizontal, label: "Columns" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            disabled
            title={`${label} — coming soon`}
            aria-label={label}
            className="rounded-lg p-1.5 text-faint"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        <a
          href={csvUrl}
          aria-label="Export CSV"
          title="Export all responses as CSV"
          className="rounded-lg p-1.5 text-ink transition-colors hover:bg-panel"
        >
          <Download className="h-4 w-4" />
        </a>

        <button
          onClick={onGenerateTestResponse}
          disabled={isGenerating}
          className="ml-auto rounded-lg border border-hair px-3 py-1.5 text-[14px] text-ink transition-colors hover:bg-panel disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate test response"}
        </button>
      </div>

      {/* One column per question, scrolling horizontally like the original */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-10">
            <tr>
              <Th className="w-10 pl-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  aria-label="Select all responses"
                  className="rounded border-hair"
                />
              </Th>
              <Th className="min-w-[150px]">Submitted</Th>
              <Th className="min-w-[130px]">Response type</Th>
              {questions.map((question) => {
                const { icon: Icon } = questionTypeMeta(question.type);
                return (
                  <Th key={question.id} className="min-w-[180px]">
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded bg-chip text-chip-ink">
                        <Icon className="h-3 w-3" />
                      </span>
                      <span className="truncate">{questionLabel(question)}</span>
                    </span>
                  </Th>
                );
              })}
              <Th className="min-w-[170px]">Ending</Th>
              <Th className="w-14" />
            </tr>
          </thead>

          <tbody>
            {responses.map((response, index) => {
              const isSelected = selectedIds.includes(response.id);
              const byQuestion = new Map(
                response.answers.map((answer) => [answer.question_id, answer.value])
              );
              const submitted = new Date(response.submitted_at);

              return (
                <tr
                  key={response.id}
                  onClick={() => onOpenDetail(index)}
                  className={`group cursor-pointer ${isSelected ? "bg-panel/70" : "hover:bg-panel/40"}`}
                >
                  <Td className="pl-4" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(response.id)}
                      aria-label={`Select response ${response.id}`}
                      className="rounded border-hair"
                    />
                  </Td>

                  <Td>
                    <span className="block text-ink">
                      {submitted.toLocaleDateString("en-GB", DATE_FORMAT)}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {submitted.toLocaleTimeString("en-GB", TIME_FORMAT)}
                    </span>
                  </Td>

                  <Td>
                    <span className="inline-flex items-center rounded-full border border-[#a7d4c6] bg-[#e6f4ef] px-2.5 py-0.5 text-[12px] text-brand-green">
                      Completed
                    </span>
                  </Td>

                  {questions.map((question) => {
                    const value = byQuestion.get(question.id);
                    return (
                      <Td key={question.id}>
                        {value ? (
                          <span className="block max-w-[220px] truncate text-ink">{value}</span>
                        ) : (
                          <span className="text-faint">–</span>
                        )}
                      </Td>
                    );
                  })}

                  <Td>
                    <span className="inline-block max-w-[150px] truncate rounded border border-hair bg-panel px-2 py-0.5 text-[13px] text-muted">
                      A. {endingLabel(endingTitle)}
                    </span>
                  </Td>

                  <Td>
                    <span className="inline-block rounded bg-panel p-1.5 text-muted transition-colors group-hover:bg-chrome group-hover:text-on-chrome">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {responses.length === 0 && (
          <p className="py-10 text-center text-[14px] text-faint">No responses match that search.</p>
        )}
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`border-b border-hair bg-panel px-3 py-2.5 text-[13px] font-medium text-muted ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}) {
  return (
    <td
      onClick={onClick}
      className={`border-b border-hair px-3 py-3 align-top text-[14px] ${className}`}
    >
      {children}
    </td>
  );
}
