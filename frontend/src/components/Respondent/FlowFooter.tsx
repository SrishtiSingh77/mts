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
    <footer className="flex items-center justify-end gap-3 px-6 pb-6 sm:px-12">
      <span className="mr-1 text-[13px] text-muted">
        {index + 1} of {total}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={index === 0}
          aria-label="Previous question"
          className="flex h-9 w-9 items-center justify-center rounded-md bg-[#d9d9dd] text-white transition-colors hover:bg-[#c2c2c8] disabled:opacity-45"
        >
          <ChevronUp className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={onNext}
          disabled={index === total - 1}
          aria-label="Next question"
          className="flex h-9 w-9 items-center justify-center rounded-md bg-[#d9d9dd] text-white transition-colors hover:bg-[#c2c2c8] disabled:opacity-45"
        >
          <ChevronDown className="h-[18px] w-[18px]" />
        </button>
      </div>

      <PoweredByFooter />
    </footer>
  );
}
