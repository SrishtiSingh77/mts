"use client";

import { HelpCircle, Link2, PanelsTopLeft, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Form } from "@/types";

/** Tabs shown in the strip. Settings is reachable from the toolbar gear, as in Typeform. */
export const BUILDER_TABS = ["Content", "Workflow", "Connect", "Share", "Results"] as const;

export type BuilderTab = (typeof BUILDER_TABS)[number] | "Settings";

interface BuilderHeaderProps {
  form: Form;
  activeTab: BuilderTab;
  setActiveTab: (tab: BuilderTab) => void;
  onTitleChange: (newTitle: string) => void;
}

export default function BuilderHeader({
  form,
  activeTab,
  setActiveTab,
  onTitleChange,
}: BuilderHeaderProps) {
  const [draftTitle, setDraftTitle] = useState(form.title);

  return (
    <header className="relative z-20 flex h-[68px] shrink-0 select-none items-center justify-between bg-white px-6">
      {/* Breadcrumb — the title is edited inline here */}
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-medium text-ink transition-opacity hover:opacity-70"
        >
          <PanelsTopLeft className="h-[18px] w-[18px]" />
          <span>Forms</span>
        </Link>
        <span className="text-muted">›</span>
        <input
          type="text"
          value={draftTitle}
          onChange={(event) => {
            setDraftTitle(event.target.value);
            onTitleChange(event.target.value);
          }}
          className="min-w-0 max-w-[280px] truncate rounded-md border border-transparent px-1.5 py-1 text-[15px] font-medium text-ink transition-colors hover:border-[#c9c9cf] focus:border-ink focus:outline-none"
        />
      </div>

      {/* Centre tab strip — active tab gets a pill plus a bar on the very top edge */}
      <nav className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-1 pt-[18px]">
        {BUILDER_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-1"
            >
              {isActive && (
                <span className="absolute -top-[18px] left-1/2 h-[3px] w-12 -translate-x-1/2 rounded-full bg-ink" />
              )}
              <span
                className={`block rounded-lg px-3.5 py-1.5 text-[15px] transition-colors ${
                  isActive ? "bg-black/[0.05] text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {tab}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        {activeTab === "Share" ? (
          <button
            aria-label="Copy public link"
            className="rounded-lg border border-hair p-2 text-ink transition-colors hover:bg-panel"
          >
            <Link2 className="h-[18px] w-[18px]" />
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("Share")}
            className="flex items-center gap-2 rounded-lg border border-hair px-3.5 py-2 text-[15px] text-ink transition-colors hover:bg-panel"
          >
            <Play className="h-[16px] w-[16px]" />
            <span>Share</span>
          </button>
        )}

        <span className="h-6 w-px bg-hair" />

        <button className="rounded-lg bg-brand-green px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-green-hover active:bg-[#178770] active:scale-[0.99]">
          View plans
        </button>

        <button className="text-muted transition-colors hover:text-ink" aria-label="Help">
          <HelpCircle className="h-[22px] w-[22px]" />
        </button>

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0d9a8] text-[13px] font-medium text-[#7a5c1e]">
          SS
        </span>
      </div>
    </header>
  );
}
