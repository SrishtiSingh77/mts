"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, Copy, Layers, Lightbulb, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { questionTypeMeta } from "@/lib/questionTypes";
import { Question } from "@/types";

interface BuilderSidebarPagesProps {
  questions: Question[];
  activeQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onAddQuestion: () => void;
  onDuplicateQuestion: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onReorder: (questions: Question[]) => void;
}

export default function BuilderSidebarPages({
  questions,
  activeQuestionId,
  onSelectQuestion,
  onAddQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onReorder,
}: BuilderSidebarPagesProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    const next = [...questions];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    move(
      questions.findIndex((q) => q.id === active.id),
      questions.findIndex((q) => q.id === over.id)
    );
  };

  return (
    <aside className="flex w-[320px] shrink-0 select-none flex-col gap-2 p-4">
      {/* Mode selector */}
      <button className="flex items-center justify-between rounded-xl bg-panel px-4 py-3 text-[15px] text-[#6b5ea8] transition-colors hover:bg-[#ececee]">
        <span className="flex items-center gap-2.5">
          <Layers className="h-[18px] w-[18px]" />
          <span>Universal mode</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>

      {/* Pages panel */}
      <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-panel p-4">
        <span className="mb-3 px-1 text-[15px] font-medium text-ink">Pages</span>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="rounded-lg bg-white/70 p-1.5">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {questions.map((question, index) => (
                    <PageItem
                      key={question.id}
                      question={question}
                      index={index}
                      total={questions.length}
                      isActive={activeQuestionId === question.id}
                      onSelect={() => onSelectQuestion(question.id)}
                      onDuplicate={() => onDuplicateQuestion(question.id)}
                      onDelete={() => onDeleteQuestion(question.id)}
                      onMoveUp={() => move(index, index - 1)}
                      onMoveDown={() => move(index, index + 1)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              onClick={onAddQuestion}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[15px] text-ink transition-colors hover:bg-black/[0.04]"
            >
              <Plus className="h-[18px] w-[18px]" />
              <span>Add content</span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg border border-dashed border-[#d4d4d8] px-3 py-2.5 text-[14px] text-muted">
            <span className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Add Welcome Screen</span>
            </span>
            <span className="rounded bg-white px-1.5 py-0.5 text-[11px]">Soon</span>
          </div>
        </div>
      </div>

      {/* Endings panel */}
      <div className="rounded-xl bg-panel p-4">
        <div className="flex items-center justify-between">
          <span className="px-1 text-[15px] font-medium text-ink">Endings</span>
          <button
            aria-label="Add ending"
            title="Edit the thank-you screen in Settings"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-muted transition-colors hover:text-ink"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2.5 rounded-lg bg-white px-3 py-2.5 text-[14px] text-ink">
          Thank You Screen
        </div>
      </div>
    </aside>
  );
}

interface PageItemProps {
  question: Question;
  index: number;
  total: number;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/** A compact chip: type glyph on a lavender tile, then the page number. */
function PageItem({
  question,
  index,
  total,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: PageItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: question.id,
  });
  const { icon: TypeIcon } = questionTypeMeta(question.type);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  const run = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      title={question.title}
      className={`group relative flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors ${
        isActive ? "bg-panel" : "hover:bg-panel/70"
      }`}
    >
      <span className="flex items-center gap-2" {...attributes} {...listeners}>
        <span className="flex h-7 w-9 items-center justify-center rounded-md bg-chip text-chip-ink">
          <TypeIcon className="h-4 w-4" />
        </span>
        <span className="text-[14px] text-ink">{index + 1}</span>
      </span>

      <div className="relative">
        <button
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          aria-label="Page options"
          className="rounded p-0.5 text-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            onClick={(event) => event.stopPropagation()}
            className="animate-fade-in absolute left-full top-0 z-40 ml-2 w-[172px] overflow-hidden rounded-xl border border-hair bg-white py-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
          >
            {/* Move and Delete only make sense once a second page exists */}
            {total >= 2 && (
              <>
                <PageMenuItem icon={ChevronUp} disabled={index === 0} onClick={run(onMoveUp)}>
                  Move up
                </PageMenuItem>
                <PageMenuItem
                  icon={ChevronDown}
                  disabled={index === total - 1}
                  onClick={run(onMoveDown)}
                >
                  Move down
                </PageMenuItem>
              </>
            )}

            <PageMenuItem icon={Copy} onClick={run(onDuplicate)}>
              Duplicate
            </PageMenuItem>

            {total >= 2 && (
              <PageMenuItem icon={Trash2} danger onClick={run(onDelete)}>
                Delete
              </PageMenuItem>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PageMenuItem({
  children,
  icon: Icon,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  icon: typeof Copy;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-[15px] transition-colors ${
        danger ? "text-[#c0392b] hover:bg-[#fdf2f1]" : "text-ink hover:bg-panel"
      } disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );
}
