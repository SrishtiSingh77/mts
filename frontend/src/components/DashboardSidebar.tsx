"use client";

import { ChevronUp, LayoutGrid, Mic, Plus, Search, SendHorizontal } from "lucide-react";

interface DashboardSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateForm: () => void;
  formCount: number;
  responseCount: number;
}

const RESPONSE_QUOTA = 10;

export default function DashboardSidebar({
  searchQuery,
  onSearchChange,
  onCreateForm,
  formCount,
  responseCount,
}: DashboardSidebarProps) {
  const usage = Math.min(100, (responseCount / RESPONSE_QUOTA) * 100);

  return (
    <aside className="flex w-[320px] shrink-0 select-none flex-col border-r border-hair bg-surface">
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-5 pt-5">
          <button
            onClick={onCreateForm}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-chrome py-3 text-[15px] font-medium text-on-chrome transition-colors hover:bg-chrome-hover active:bg-chrome-pressed active:scale-[0.99]"
          >
            <Plus className="h-[18px] w-[18px]" />
            <span>Create form</span>
          </button>
        </div>

        {/* Search is a bare row in Typeform, not a boxed input */}
        <div className="border-b border-hair px-6 pb-5">
          <div className="flex items-center gap-3">
            <Search className="h-[18px] w-[18px] shrink-0 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
        </div>

        <div className="border-b border-hair px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-[15px] text-ink">
              <LayoutGrid className="h-[18px] w-[18px]" />
              <span>Workspaces</span>
            </span>
            <button
              aria-label="Create workspace"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-hair text-muted transition-colors hover:bg-panel"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button className="mb-1 flex w-full items-center justify-between px-1 text-[15px] text-muted">
            <span>Private</span>
            <ChevronUp className="h-4 w-4" />
          </button>

          <button className="flex w-full items-center justify-between rounded-lg bg-panel px-3 py-2.5 text-left text-[15px] text-ink">
            <span>My workspace</span>
            <span className="text-[14px] text-muted">{formCount}</span>
          </button>
        </div>
      </div>

      {/* Quota block, then the AI composer pinned to the bottom */}
      <div className="border-t border-hair px-6 py-5">
        <span className="block text-[15px] text-ink">Responses collected</span>
        <div className="mt-2.5 h-[3px] w-full rounded-full bg-hair">
          <div className="h-full rounded-full bg-chrome" style={{ width: `${usage}%` }} />
        </div>
        <p className="mt-2.5 text-[14px] text-muted">
          <span className="font-medium text-ink">{responseCount}</span> / {RESPONSE_QUOTA}
        </p>
        <button className="mt-4 rounded-lg border border-hair px-3 py-2 text-[14px] text-ink transition-colors hover:bg-panel">
          Increase response limit
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-xl border border-[#e0d7f5] px-3 py-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <Mic className="h-[18px] w-[18px] shrink-0 text-ink" />
          <input
            type="text"
            placeholder="Ask Typeform AI"
            disabled
            className="w-full bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
          />
          <SendHorizontal className="h-[18px] w-[18px] shrink-0 text-faint" />
        </div>
      </div>
    </aside>
  );
}
