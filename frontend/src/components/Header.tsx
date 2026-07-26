"use client";

import Link from "next/link";
import { ChevronDown, Sparkles, HelpCircle, Layers, Users, Zap } from "lucide-react";
import TypeformLogo from "./TypeformLogo";

interface HeaderProps {
  activeTab?: string;
}

export default function Header({ activeTab = "Forms" }: HeaderProps) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 select-none">
      {/* Left side: Workspace & Main Nav */}
      <div className="flex items-center space-x-6">
        {/* Workspace Dropdown with Typeform Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors">
          <TypeformLogo className="w-5 h-4 text-gray-900" />
          <span className="font-semibold text-sm text-gray-800">ilobotters</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 text-sm font-medium">
          <Link
            href="/"
            className={`px-3 py-4 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === "Forms"
                ? "border-black text-gray-900 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Forms</span>
          </Link>
          <button className="px-3 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 flex items-center space-x-1.5">
            <Users className="w-4 h-4" />
            <span>Contacts</span>
          </button>
          <button className="px-3 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 flex items-center space-x-1.5">
            <Zap className="w-4 h-4" />
            <span>Automations</span>
          </button>
          <button className="px-3 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Research Flow</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">Demo</span>
          </button>
        </nav>
      </div>

      {/* Right side action buttons */}
      <div className="flex items-center space-x-3">
        <button className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center space-x-1 px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <Layers className="w-3.5 h-3.5" />
          <span>Integrations</span>
        </button>
        <button className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center space-x-1 px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <span>Brand kit</span>
        </button>
        <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors shadow-sm">
          View plans
        </button>
        <button className="text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100">
          <HelpCircle className="w-4 h-4" />
        </button>
        {/* User avatar */}
        <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-semibold text-xs flex items-center justify-center border border-amber-300">
          SS
        </div>
      </div>
    </header>
  );
}
