"use client";

import React from "react";
import { Search, Sparkles, Folder, Trash2, Plus, Users } from "lucide-react";
import TypeformLogo from "./TypeformLogo";

interface DashboardSidebarProps {
  searchQuery: string;
  setSearchQuery?: (query: string) => void;
  onSearchChange?: (query: string) => void;
  onCreateForm: () => void;
  formCount?: number;
}

export default function DashboardSidebar({
  searchQuery,
  setSearchQuery,
  onSearchChange,
  onCreateForm,
  formCount = 0,
}: DashboardSidebarProps) {
  const handleSearch = (val: string) => {
    if (setSearchQuery) setSearchQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-[#fcfcfc] h-[calc(100vh-3.5rem)] flex flex-col justify-between p-4 font-sans select-none">
      {/* Top Section */}
      <div className="space-y-5">
        {/* Create Form Button */}
        <button
          onClick={onCreateForm}
          className="w-full bg-[#262627] hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-between transition-all shadow-sm active:scale-98 cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create typeform</span>
          </div>
          <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded font-mono text-gray-300">
            N
          </span>
        </button>

        {/* Ask Typeform AI Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Ask Typeform AI..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors shadow-2xs"
          />
          <Sparkles className="w-3.5 h-3.5 text-purple-600 absolute right-3 top-2.5" />
        </div>

        {/* Workspace Navigation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-2 py-1">
            <span>Workspaces</span>
            <Plus className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700 cursor-pointer" />
          </div>

          <div className="space-y-0.5 text-xs font-medium">
            <button className="w-full text-left px-2.5 py-2 rounded-lg bg-gray-200/70 text-gray-900 font-semibold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-gray-600" />
                <span>My workspace</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">{formCount}</span>
            </button>

            <button className="w-full text-left px-2.5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>Shared with me</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-gray-200 space-y-3">
        <button className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center space-x-2 rounded-lg hover:bg-gray-100">
          <Trash2 className="w-4 h-4 text-gray-400" />
          <span>Trash</span>
        </button>

        <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3 text-xs space-y-1">
          <div className="flex items-center space-x-1.5">
            <TypeformLogo className="w-3.5 h-3 text-purple-700" />
            <span className="font-bold text-purple-950">Typeform Free Plan</span>
          </div>
          <p className="text-[11px] text-purple-800">
            You've collected 4 / 100 responses this month.
          </p>
        </div>
      </div>
    </aside>
  );
}
