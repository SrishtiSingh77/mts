"use client";

import { Check, HelpCircle, Link2, PanelsTopLeft, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/components/ToastProvider";
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
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${form.share_id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (form.status === "published") {
      toast.success("Shareable link copied to clipboard");
    } else {
      toast.info("Link copied — publish the form before sharing it.");
    }
  };

  return (
    <header className="relative z-20 flex h-[68px] shrink-0 select-none items-center gap-3 bg-surface px-4 sm:px-6">
      {/* Breadcrumb — the title is edited inline here */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-medium text-ink transition-opacity hover:opacity-70"
        >
          <PanelsTopLeft className="h-[18px] w-[18px] shrink-0" />
          <span className="hidden sm:inline">Forms</span>
        </Link>
        <span className="hidden text-muted sm:inline">›</span>
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

      {/* Centre tab strip. A flex child rather than absolutely centred, so it can
          never overlap the actions; it scrolls instead when space runs out. */}
      <nav className="flex min-w-0 shrink items-center gap-1 no-scrollbar overflow-x-auto">
        {BUILDER_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative shrink-0 px-1"
            >
              {isActive && (
                <span className="absolute -top-[18px] left-1/2 h-[3px] w-12 -translate-x-1/2 rounded-full bg-inverse" />
              )}
              <span
                className={`block whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[15px] transition-colors lg:px-3.5 ${
                  isActive ? "bg-black/[0.05] dark:bg-white/[0.08] text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {tab}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex flex-1 shrink-0 items-center justify-end gap-2 sm:gap-3">
        {activeTab === "Share" ? (
          <button
            onClick={handleCopyLink}
            aria-label="Copy public link"
            title="Copy the public link"
            className="rounded-lg border border-hair p-2 text-ink transition-colors hover:bg-panel active:scale-95"
          >
            {copied ? (
              <Check className="h-[18px] w-[18px] text-brand-green" />
            ) : (
              <Link2 className="h-[18px] w-[18px]" />
            )}
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("Share")}
            className="flex items-center gap-2 rounded-lg border border-hair px-3.5 py-2 text-[15px] text-ink transition-colors hover:bg-panel"
          >
            <Play className="h-[16px] w-[16px] shrink-0" />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}

        <span className="hidden h-6 w-px bg-hair sm:block" />

        <button className="hidden whitespace-nowrap rounded-lg bg-brand-green px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-green-hover active:scale-[0.99] active:bg-[#178770] lg:block">
          View plans
        </button>

        <ThemeToggle />

        <button className="hidden text-muted transition-colors hover:text-ink md:block" aria-label="Help">
          <HelpCircle className="h-[22px] w-[22px]" />
        </button>

        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0d9a8] text-[13px] font-medium text-[#7a5c1e] sm:flex">
          SS
        </span>
      </div>
    </header>
  );
}
