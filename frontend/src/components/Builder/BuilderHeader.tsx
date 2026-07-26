"use client";

import Link from "next/link";
import { Play, HelpCircle, ChevronRight, Share2, Layers, BarChart2 } from "lucide-react";
import { Form } from "@/types";

export type BuilderTab = "Content" | "Workflow" | "Connect" | "Share" | "Results";

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
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 select-none z-20">
      {/* Left side: Breadcrumb & Form Title */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center space-x-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Forms</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={form.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-xs font-bold text-gray-900 bg-transparent border border-transparent hover:border-gray-200 focus:border-purple-500 rounded px-1.5 py-1 focus:outline-none transition-all"
        />
      </div>

      {/* Center Tabs: Content / Workflow / Connect / Share / Results */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
        {(["Content", "Workflow", "Connect", "Share", "Results"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right side buttons */}
      <div className="flex items-center space-x-3">
        <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors">
          View plans
        </button>

        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md">
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-semibold text-xs flex items-center justify-center border border-amber-300">
          SS
        </div>
      </div>
    </header>
  );
}
