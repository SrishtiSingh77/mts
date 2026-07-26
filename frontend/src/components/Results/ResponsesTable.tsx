"use client";

import { Download, Inbox, Maximize2 } from "lucide-react";

import { FormResponseData } from "@/types";

interface ResponsesTableProps {
  responses: FormResponseData[];
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
  hour: "2-digit",
  minute: "2-digit",
};

export default function ResponsesTable({
  responses,
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 p-4 text-xs">
        <div className="flex items-center space-x-3">
          <span className="shadow-2xs flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-800">
            <Inbox className="h-3.5 w-3.5 text-gray-600" />
            <span>Responses</span>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search responses"
            className="w-44 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={csvUrl}
            className="shadow-2xs flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-900 transition-all hover:border-gray-300"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={onGenerateTestResponse}
            disabled={isGenerating}
            className="shadow-2xs cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-900 transition-all hover:border-gray-300 disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate test response"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  aria-label="Select all responses"
                  className="cursor-pointer rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-6 py-3">Answers</th>
              <th className="px-4 py-3 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {responses.map((response, index) => {
              const isSelected = selectedIds.includes(response.id);
              const answered = response.answers.filter((answer) => answer.value).length;
              return (
                <tr
                  key={response.id}
                  onClick={() => onOpenDetail(index)}
                  className={`group cursor-pointer transition-colors hover:bg-purple-50/40 ${
                    isSelected ? "bg-purple-50/60" : ""
                  }`}
                >
                  <td className="px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(response.id)}
                      aria-label={`Select response ${response.id}`}
                      className="cursor-pointer rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-800">
                    {new Date(response.submitted_at).toLocaleDateString("en-GB", DATE_FORMAT)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      {answered} answered
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-6 py-3.5 font-medium text-gray-800">
                    {response.answers.map((answer) => answer.value).filter(Boolean).join(" • ") || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-block rounded bg-gray-100 p-1 text-gray-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {responses.length === 0 && (
          <p className="py-10 text-center text-xs text-gray-400">No responses match that search.</p>
        )}
      </div>
    </div>
  );
}
