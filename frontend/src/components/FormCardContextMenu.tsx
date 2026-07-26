"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

import { Form } from "@/types";

interface FormCardContextMenuProps {
  form: Form;
  isOpen: boolean;
  onClose: () => void;
  onRename: (form: Form) => void;
  onDuplicate: (formId: string) => void;
  onDelete: (formId: string) => void;
  onCopyLink: (shareId: string) => void;
  onOpenTab: (formId: string, tab: "Content" | "Workflow" | "Connect") => void;
}

export default function FormCardContextMenu({
  form,
  isOpen,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
  onCopyLink,
  onOpenTab,
}: FormCardContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose();
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <div
      ref={ref}
      role="menu"
      className="animate-fade-in absolute right-0 top-full z-40 mt-1 w-[240px] overflow-hidden rounded-xl border border-hair bg-white py-2 shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
    >
      <MenuItem onClick={run(() => onCopyLink(form.share_id))}>Copy link</MenuItem>

      <Divider />
      <MenuItem onClick={run(() => onOpenTab(form.id, "Content"))}>Content</MenuItem>
      <MenuItem onClick={run(() => onOpenTab(form.id, "Workflow"))}>Workflow</MenuItem>
      <MenuItem onClick={run(() => onOpenTab(form.id, "Connect"))}>Connect</MenuItem>

      <Divider />
      <MenuItem onClick={run(() => onRename(form))}>Rename</MenuItem>
      <MenuItem onClick={run(() => onDuplicate(form.id))}>Duplicate</MenuItem>
      <MenuItem disabled trailing={<ChevronRight className="h-4 w-4 text-faint" />}>
        Copy to
      </MenuItem>
      <MenuItem disabled trailing={<ChevronRight className="h-4 w-4 text-faint" />}>
        Move to
      </MenuItem>

      <Divider />
      <MenuItem danger onClick={run(() => onDelete(form.id))}>
        Delete
      </MenuItem>
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
  disabled,
  trailing,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between px-5 py-2 text-left text-[15px] transition-colors ${
        danger ? "text-[#c0392b] hover:bg-[#fdf2f1]" : "text-ink hover:bg-panel"
      } disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent`}
    >
      <span>{children}</span>
      {trailing}
    </button>
  );
}

function Divider() {
  return <div className="my-2 h-px bg-hair" />;
}
