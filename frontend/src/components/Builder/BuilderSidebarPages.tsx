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
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Lightbulb,
  MoreVertical,
  Plus,
  Rows3,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

import DropdownMenu, { MenuItem } from "@/components/ui/DropdownMenu";
import { endingLabel } from "@/lib/labels";
import { questionTypeMeta } from "@/lib/questionTypes";
import { Question } from "@/types";

interface BuilderSidebarPagesProps {
  questions: Question[];
  activeQuestionId: string | null;
  welcomeEnabled: boolean;
  isWelcomeActive: boolean;
  isEndingActive: boolean;
  endingTitle: string;
  onSelectWelcome: () => void;
  onSelectEnding: () => void;
  onEnableWelcome: () => void;
  onSelectQuestion: (id: string) => void;
  onAddQuestion: () => void;
  onDuplicateQuestion: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onReorder: (questions: Question[]) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function BuilderSidebarPages({
  questions,
  activeQuestionId,
  welcomeEnabled,
  isWelcomeActive,
  isEndingActive,
  endingTitle,
  onSelectWelcome,
  onSelectEnding,
  onEnableWelcome,
  onSelectQuestion,
  onAddQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onReorder,
  collapsed,
  onToggleCollapsed,
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

  if (collapsed) {
    return (
      <aside className="relative w-3 shrink-0 select-none">
        <button
          onClick={onToggleCollapsed}
          aria-label="Expand pages panel"
          title="Expand pages panel"
          className="absolute -right-3 top-[86px] z-20 flex h-6 w-6 items-center justify-center rounded-full bg-inverse text-on-inverse shadow-md transition-transform hover:scale-110"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="group/rail relative flex w-[320px] shrink-0 select-none flex-col gap-2 px-4 pb-4 pt-1">
      {/* Collapse handle sits on the Pages panel's left edge, shown on hover */}
      <button
        onClick={onToggleCollapsed}
        aria-label="Collapse pages panel"
        title="Collapse pages panel"
        className="absolute left-4 top-[124px] z-20 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-[#6e6e73] text-white opacity-0 shadow-md transition-all hover:bg-inverse hover:text-on-inverse group-hover/rail:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Mode selector — height matches the toolbar row so the two align */}
      <button className="flex h-[52px] shrink-0 items-center justify-between rounded-xl bg-panel px-4 text-[15px] text-ink transition-colors hover:bg-hair">
        <span className="flex items-center gap-2.5">
          <Rows3 className="h-[18px] w-[18px] text-ink" />
          <span>Universal mode</span>
        </span>
        <ChevronDown className="h-[18px] w-[18px] text-muted" />
      </button>

      {/* Pages panel */}
      <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-panel p-4">
        <span className="mb-3 px-1 text-[15px] font-medium text-ink">Pages</span>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="rounded-lg bg-surface/70 p-1.5">
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
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[15px] text-ink transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.07]"
            >
              <Plus className="h-[18px] w-[18px]" />
              <span>Add content</span>
            </button>
          </div>

          {/* Welcome screen: a real page once enabled, an add affordance until then */}
          <button
            onClick={welcomeEnabled ? onSelectWelcome : onEnableWelcome}
            className={`mt-3 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors ${
              welcomeEnabled
                ? isWelcomeActive
                  ? "bg-panel text-ink"
                  : "bg-surface text-ink hover:bg-surface/70"
                : "border border-dashed border-[#d4d4d8] text-muted hover:border-[#b8b8bf]"
            }`}
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>{welcomeEnabled ? "Welcome Screen" : "Add Welcome Screen"}</span>
            </span>
            {!welcomeEnabled && <Plus className="h-4 w-4 text-muted" />}
          </button>
        </div>
      </div>

      {/* Endings panel */}
      <div className="rounded-xl bg-panel p-4">
        <div className="flex items-center justify-between">
          <span className="px-1 text-[15px] font-medium text-ink">Endings</span>
          <button
            onClick={onSelectEnding}
            aria-label="Edit ending"
            title="Edit the thank-you screen"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-surface text-muted transition-colors hover:text-ink"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={onSelectEnding}
          title={endingLabel(endingTitle)}
          className={`mt-2.5 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
            isEndingActive ? "bg-surface" : "hover:bg-surface/70"
          }`}
        >
          <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-md bg-chip text-[11px] font-bold text-chip-ink">
            ◐
          </span>
          <span className="truncate text-[14px] text-ink">A</span>
        </button>
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });
  const { icon: TypeIcon } = questionTypeMeta(question.type);

  const run = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
      }}
      onClick={onSelect}
      title={question.title}
      className={`group relative flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors ${
        isActive ? "bg-panel" : "hover:bg-panel/70"
      } ${isDragging ? "bg-surface opacity-90 shadow-md" : ""}`}
    >
      {/* Drag from the chip; the options button stays clickable. */}
      <span
        className="flex cursor-grab items-center gap-2 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <span className="flex h-7 w-9 items-center justify-center rounded-md bg-chip text-chip-ink">
          <TypeIcon className="h-4 w-4" />
        </span>
        <span className="text-[14px] text-ink">{index + 1}</span>
      </span>

      <button
        ref={menuButtonRef}
        onClick={(event) => {
          event.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        aria-label="Page options"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className={`rounded p-0.5 text-muted transition-opacity hover:text-ink ${
          menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <DropdownMenu
        anchorRef={menuButtonRef}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        placement="right-start"
        width={180}
      >
        {/* Reordering and deleting only make sense once a second page exists */}
        {total >= 2 && (
          <>
            <MenuItem icon={ChevronUp} disabled={index === 0} onClick={run(onMoveUp)}>
              Move up
            </MenuItem>
            <MenuItem icon={ChevronDown} disabled={index === total - 1} onClick={run(onMoveDown)}>
              Move down
            </MenuItem>
          </>
        )}

        <MenuItem icon={Copy} onClick={run(onDuplicate)}>
          Duplicate
        </MenuItem>

        {total >= 2 && (
          <MenuItem icon={Trash2} danger onClick={run(onDelete)}>
            Delete
          </MenuItem>
        )}
      </DropdownMenu>
    </div>
  );
}
