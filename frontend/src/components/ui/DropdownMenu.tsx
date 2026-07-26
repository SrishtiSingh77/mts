"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Placement = "bottom-start" | "bottom-end" | "right-start";

interface DropdownMenuProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  placement?: Placement;
  width?: number;
  children: React.ReactNode;
}

const GAP = 6;
const VIEWPORT_MARGIN = 8;

/**
 * Portal-rendered menu positioned against its anchor.
 *
 * Rendering into document.body matters: several of these menus live inside
 * scroll containers, and an absolutely positioned child would be clipped by the
 * container's overflow.
 */
export default function DropdownMenu({
  anchorRef,
  open,
  onClose,
  placement = "bottom-end",
  width = 240,
  children,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function place() {
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const height = menuRef.current?.offsetHeight ?? 0;
      let top = placement === "right-start" ? anchor.top : anchor.bottom + GAP;
      let left =
        placement === "bottom-start"
          ? anchor.left
          : placement === "right-start"
            ? anchor.right + GAP
            : anchor.right - width;

      // Keep the menu on screen when the anchor sits near an edge.
      left = Math.min(Math.max(VIEWPORT_MARGIN, left), window.innerWidth - width - VIEWPORT_MARGIN);
      if (height && top + height > window.innerHeight - VIEWPORT_MARGIN) {
        top = Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN);
      }

      setPosition({ top, left });
    }

    place();
    window.addEventListener("resize", place);
    // Capture phase so the menu follows any ancestor scroll container.
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef, open, placement, width]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorRef, onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      onClick={(event) => event.stopPropagation()}
      style={{
        position: "fixed",
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        width,
        visibility: position ? "visible" : "hidden",
      }}
      className="animate-fade-in z-[200] overflow-hidden rounded-xl border border-hair bg-white py-2 shadow-[0_8px_28px_rgba(0,0,0,0.14)]"
    >
      {children}
    </div>,
    document.body
  );
}

export function MenuItem({
  children,
  icon: Icon,
  onClick,
  danger,
  disabled,
  trailing,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
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
      className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-[15px] transition-colors ${
        danger ? "text-[#c0392b] hover:bg-[#fdf2f1]" : "text-ink hover:bg-panel"
      } disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent`}
    >
      <span className="flex items-center gap-2.5">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{children}</span>
      </span>
      {trailing}
    </button>
  );
}

export function MenuDivider() {
  return <div className="my-2 h-px bg-hair" />;
}
