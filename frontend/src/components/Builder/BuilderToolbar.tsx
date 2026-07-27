"use client";

import {
  Accessibility,
  Languages,
  Palette,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Smartphone,
} from "lucide-react";

interface BuilderToolbarProps {
  viewMode: "desktop" | "mobile";
  onViewModeChange: (mode: "desktop" | "mobile") => void;
  onAddContent: () => void;
  onOpenSettings: () => void;
  onPreview: () => void;
}

export default function BuilderToolbar({
  viewMode,
  onViewModeChange,
  onAddContent,
  onOpenSettings,
  onPreview,
}: BuilderToolbarProps) {
  return (
    <div className="ml-2 mr-4 mt-1 flex h-[52px] shrink-0 items-center gap-1 rounded-xl bg-panel px-2.5">
      <button
        onClick={onAddContent}
        className="flex items-center gap-2 rounded-lg bg-chrome px-4 py-2.5 text-[15px] font-medium text-on-chrome transition-colors hover:bg-chrome-hover active:bg-chrome-pressed active:scale-[0.99]"
      >
        <Plus className="h-[18px] w-[18px]" />
        <span>Add content</span>
      </button>

      <button className="ml-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] text-ink transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08]">
        <Palette className="h-[18px] w-[18px]" />
        <span>Design</span>
      </button>

      <Separator />

      <IconButton
        label="Mobile preview"
        active={viewMode === "mobile"}
        onClick={() => onViewModeChange(viewMode === "mobile" ? "desktop" : "mobile")}
      >
        <Smartphone className="h-[18px] w-[18px]" />
      </IconButton>

      <IconButton label="Preview form" onClick={onPreview}>
        <Play className="h-[18px] w-[18px]" />
      </IconButton>

      <Separator />

      <IconButton label="Accessibility" disabled>
        <Accessibility className="h-[18px] w-[18px]" />
      </IconButton>
      <IconButton label="Undo" disabled>
        <RotateCcw className="h-[18px] w-[18px]" />
      </IconButton>
      <IconButton label="Translate" disabled>
        <Languages className="h-[18px] w-[18px]" />
      </IconButton>

      <IconButton label="Form settings" onClick={onOpenSettings}>
        <Settings className="h-[18px] w-[18px]" />
      </IconButton>
    </div>
  );
}

function Separator() {
  return <span className="mx-1.5 h-6 w-px bg-[#dcdcdf]" />;
}

function IconButton({
  children,
  label,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={disabled ? `${label} — coming soon` : label}
      className={`rounded-lg p-2 transition-colors ${
        active ? "bg-surface text-ink shadow-sm" : "text-ink hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
      } disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent`}
    >
      {children}
    </button>
  );
}
