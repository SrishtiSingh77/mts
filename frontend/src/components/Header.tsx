"use client";

import Link from "next/link";
import { ChevronDown, Grid2x2, HelpCircle, Palette, PanelsTopLeft, Users, Workflow } from "lucide-react";

import TypeformLogo from "./TypeformLogo";

interface HeaderProps {
  activeTab?: "Forms" | "Contacts" | "Automations";
}

const NAV_TABS = [
  { label: "Forms", icon: PanelsTopLeft, href: "/" },
  { label: "Contacts", icon: Users, href: null },
  { label: "Automations", icon: Workflow, href: null },
] as const;

export default function Header({ activeTab = "Forms" }: HeaderProps) {
  return (
    <header className="select-none bg-white">
      {/* Row 1 — organisation bar */}
      <div className="flex h-[72px] items-center justify-between px-6">
        <button className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 transition-colors hover:bg-black/[0.03]">
          <span className="flex items-center">
            <TypeformLogo className="h-6 w-4 text-ink" />
            <span className="ml-1 h-8 w-8 rounded-lg bg-gradient-to-br from-[#b57bdc] to-[#9333ea]" />
          </span>
          <span className="text-[17px] text-ink">Srishti Singh</span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-[15px] text-ink transition-opacity hover:opacity-70">
            <Grid2x2 className="h-[18px] w-[18px]" />
            <span>Integrations</span>
          </button>
          <button className="flex items-center gap-2 text-[15px] text-ink transition-opacity hover:opacity-70">
            <Palette className="h-[18px] w-[18px]" />
            <span>Brand kit</span>
          </button>
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
      </div>

      {/* Row 2 — section tabs, active one carries a thick dark underline */}
      <div className="flex items-end gap-1 border-b border-hair px-6">
        {NAV_TABS.map(({ label, icon: Icon, href }) => {
          const isActive = activeTab === label;
          const inner = (
            <span
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] transition-colors ${
                isActive ? "bg-black/[0.04] text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{label}</span>
            </span>
          );

          return (
            <div
              key={label}
              className={`pb-0 ${isActive ? "border-b-[3px] border-ink" : "border-b-[3px] border-transparent"}`}
            >
              {href ? (
                <Link href={href} className="block pb-2 pt-1">
                  {inner}
                </Link>
              ) : (
                <button className="block pb-2 pt-1">{inner}</button>
              )}
            </div>
          );
        })}

        <span className="mx-3 mb-3 h-6 w-px bg-hair" />

        <div className="border-b-[3px] border-transparent">
          <button className="flex items-center gap-2 pb-2 pt-1">
            <span className="flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] text-muted transition-colors hover:text-ink">
              <PanelsTopLeft className="h-[18px] w-[18px]" />
              <span>Research Flow</span>
              <span className="rounded-full border border-[#bcd7f5] px-2 py-0.5 text-[12px] text-[#2563a8]">
                Demo
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
