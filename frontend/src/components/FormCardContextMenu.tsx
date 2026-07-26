"use client";

import { useEffect, useRef } from "react";
import { Link2, FileText, GitBranch, Share2, Edit2, Copy, ArrowRight, Trash2 } from "lucide-react";
import { Form } from "@/types";

interface FormCardContextMenuProps {
  form: Form;
  isOpen: boolean;
  onClose: () => void;
  onRename: (form: Form) => void;
  onDuplicate: (formId: string) => void;
  onDelete: (formId: string) => void;
  onCopyLink: (shareId: string) => void;
  onOpenContent: (formId: string) => void;
}

export default function FormCardContextMenu({
  form,
  isOpen,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
  onCopyLink,
  onOpenContent,
}: FormCardContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 text-xs animate-fade-in"
    >
      <button
        onClick={() => {
          onCopyLink(form.share_id);
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors"
      >
        <Link2 className="w-3.5 h-3.5 text-gray-500" />
        <span>Copy link</span>
      </button>

      <div className="h-px bg-gray-100 my-1" />

      <button
        onClick={() => {
          onOpenContent(form.id);
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors"
      >
        <FileText className="w-3.5 h-3.5 text-gray-500" />
        <span>Content</span>
      </button>

      <button
        onClick={onClose}
        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors"
      >
        <GitBranch className="w-3.5 h-3.5 text-gray-500" />
        <span>Workflow</span>
      </button>

      <button
        onClick={onClose}
        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors"
      >
        <Share2 className="w-3.5 h-3.5 text-gray-500" />
        <span>Connect</span>
      </button>

      <div className="h-px bg-gray-100 my-1" />

      <button
        onClick={() => {
          onRename(form);
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5 text-gray-500" />
        <span>Rename</span>
      </button>

      <button
        onClick={() => {
          onDuplicate(form.id);
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-gray-500" />
        <span>Duplicate</span>
      </button>

      <button
        onClick={onClose}
        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center space-x-2.5">
          <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
          <span>Copy to</span>
        </span>
        <span className="text-gray-400">›</span>
      </button>

      <button
        onClick={onClose}
        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center space-x-2.5">
          <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
          <span>Move to</span>
        </span>
        <span className="text-gray-400">›</span>
      </button>

      <div className="h-px bg-gray-100 my-1" />

      <button
        onClick={() => {
          onDelete(form.id);
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2.5 transition-colors font-medium"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-600" />
        <span>Delete</span>
      </button>
    </div>
  );
}
