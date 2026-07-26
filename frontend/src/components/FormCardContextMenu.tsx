"use client";

import { ChevronRight } from "lucide-react";

import DropdownMenu, { MenuDivider, MenuItem } from "@/components/ui/DropdownMenu";
import { Form } from "@/types";

interface FormCardContextMenuProps {
  form: Form;
  anchorRef: React.RefObject<HTMLElement | null>;
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
  anchorRef,
  isOpen,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
  onCopyLink,
  onOpenTab,
}: FormCardContextMenuProps) {
  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <DropdownMenu anchorRef={anchorRef} open={isOpen} onClose={onClose} width={240}>
      <MenuItem onClick={run(() => onCopyLink(form.share_id))}>Copy link</MenuItem>

      <MenuDivider />
      <MenuItem onClick={run(() => onOpenTab(form.id, "Content"))}>Content</MenuItem>
      <MenuItem onClick={run(() => onOpenTab(form.id, "Workflow"))}>Workflow</MenuItem>
      <MenuItem onClick={run(() => onOpenTab(form.id, "Connect"))}>Connect</MenuItem>

      <MenuDivider />
      <MenuItem onClick={run(() => onRename(form))}>Rename</MenuItem>
      <MenuItem onClick={run(() => onDuplicate(form.id))}>Duplicate</MenuItem>
      <MenuItem disabled trailing={<ChevronRight className="h-4 w-4 text-faint" />}>
        Copy to
      </MenuItem>
      <MenuItem disabled trailing={<ChevronRight className="h-4 w-4 text-faint" />}>
        Move to
      </MenuItem>

      <MenuDivider />
      <MenuItem danger onClick={run(() => onDelete(form.id))}>
        Delete
      </MenuItem>
    </DropdownMenu>
  );
}
