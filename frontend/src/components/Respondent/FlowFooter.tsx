"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import PoweredByFooter from "./PoweredByFooter";

interface FlowFooterProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function FlowFooter({ index, total, onPrev, onNext }: FlowFooterProps) {
  return (
    <footer className="mx-auto flex w-full max-w-4xl items-center justify-between border-t border-gray-100 pt-6">
      <PoweredByFooter />

      <div className="flex items-center space-x-4">
        <span className="text-xs font-medium text-gray-500">
          {index + 1} of {total}
        </span>

        <div className="shadow-2xs flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            onClick={onPrev}
            disabled={index === 0}
            aria-label="Previous question"
            className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <button
            onClick={onNext}
            disabled={index === total - 1}
            aria-label="Next question"
            className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
