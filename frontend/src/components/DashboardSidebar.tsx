"use client";

import { Plus, Search, Folder, ChevronDown, Mic, Send, Sparkles } from "lucide-react";

interface DashboardSidebarProps {
  onCreateForm: () => void;
  formCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function DashboardSidebar({
  onCreateForm,
  formCount,
  searchQuery,
  onSearchChange,
}: DashboardSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50/50 p-4 flex flex-col justify-between h-[calc(100vh-3.5rem)] select-none">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Create Form Button */}
        <button
          onClick={onCreateForm}
          className="w-full bg-[#262627] hover:bg-black text-white font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create form</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
        </div>

        {/* Workspaces List */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2 px-1">
            <div className="flex items-center space-x-1.5">
              <Folder className="w-3.5 h-3.5" />
              <span>Workspaces</span>
            </div>
            <button className="p-0.5 hover:bg-gray-200 rounded text-gray-500">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600 px-2 py-1.5 rounded hover:bg-gray-200/60 cursor-pointer">
              <span className="flex items-center space-x-2">
                <ChevronDown className="w-3 h-3 text-gray-400" />
                <span>Private</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-900 bg-gray-200/80 px-2 py-1.5 rounded-md cursor-pointer">
              <span>My workspace</span>
              <span className="text-[11px] text-gray-500 bg-gray-300/60 px-1.5 rounded-full">{formCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200/80">
        {/* Usage status */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-gray-500 font-medium">
            <span>Responses collected</span>
            <span>0 / 10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full w-0"></div>
          </div>
          <button className="text-[11px] font-medium text-gray-600 hover:text-gray-900 border border-gray-200 bg-white rounded px-2 py-1 transition-colors w-fit shadow-2xs">
            Increase response limit
          </button>
        </div>

        {/* AI Chat Bar */}
        <div className="relative border border-purple-200 bg-purple-50/40 rounded-xl p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-600 pl-1">
            <Mic className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" />
            <input
              type="text"
              placeholder="Ask Typeform AI"
              className="bg-transparent border-none outline-none text-xs text-gray-700 placeholder-gray-400 w-28"
            />
          </div>
          <button className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors">
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
