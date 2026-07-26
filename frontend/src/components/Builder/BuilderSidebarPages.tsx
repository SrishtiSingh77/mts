"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, MoreHorizontal, Copy, Trash2, AlignLeft, Hash, CheckSquare, List, Mail, Star, ToggleLeft, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { Question } from "@/types";

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  totalQuestions: number;
}

function SortableQuestionItem({
  question,
  index,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  totalQuestions,
}: SortableQuestionItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "short_text":
      case "long_text":
        return <AlignLeft className="w-3.5 h-3.5 text-gray-500" />;
      case "multiple_choice":
        return <CheckSquare className="w-3.5 h-3.5 text-purple-600" />;
      case "dropdown":
        return <List className="w-3.5 h-3.5 text-blue-600" />;
      case "email":
        return <Mail className="w-3.5 h-3.5 text-emerald-600" />;
      case "number":
        return <Hash className="w-3.5 h-3.5 text-amber-600" />;
      case "rating":
        return <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />;
      case "yes_no":
        return <ToggleLeft className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <AlignLeft className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
        isActive
          ? "bg-white border-purple-500 shadow-2xs font-medium text-gray-900"
          : "bg-gray-100/60 border-transparent hover:bg-gray-200/60 text-gray-700"
      }`}
    >
      <div className="flex items-center space-x-2 truncate pr-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <span className="w-4 text-center font-semibold text-gray-400 text-[11px]">
          {index + 1}
        </span>

        {getTypeIcon(question.type)}

        <span className="truncate max-w-[100px]">
          {question.title || "Untitled Question"}
        </span>
      </div>

      {/* Action Menu Button */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-full top-0 ml-1 w-36 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 text-xs animate-fade-in"
          >
            {/* Context menu items matching Screenshot 5 */}
            {totalQuestions >= 2 && (
              <>
                <button
                  disabled={index === 0}
                  onClick={() => {
                    setShowMenu(false);
                    onMoveUp();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-2 text-gray-700 disabled:opacity-40"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                  <span>Move up</span>
                </button>

                <button
                  disabled={index === totalQuestions - 1}
                  onClick={() => {
                    setShowMenu(false);
                    onMoveDown();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-2 text-gray-700 disabled:opacity-40"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  <span>Move down</span>
                </button>

                <div className="h-px bg-gray-100 my-1" />
              </>
            )}

            <button
              onClick={() => {
                setShowMenu(false);
                onDuplicate();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-2 text-gray-700"
            >
              <Copy className="w-3.5 h-3.5 text-gray-500" />
              <span>Duplicate</span>
            </button>

            {/* SIDEBAR BEHAVIOR RULE: Show Delete ONLY IF totalQuestions >= 2 */}
            {totalQuestions >= 2 && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center space-x-2 text-red-600 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface BuilderSidebarPagesProps {
  questions: Question[];
  activeQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onAddQuestion: () => void;
  onDuplicateQuestion: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onReorder: (newQuestions: Question[]) => void;
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      const reordered = [...questions];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      onReorder(reordered);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const reordered = [...questions];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    onReorder(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index >= questions.length - 1) return;
    const reordered = [...questions];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    onReorder(reordered);
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50/70 p-3 flex flex-col justify-between h-[calc(100vh-3.5rem)] select-none">
      {/* Top Pages List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pages</span>
          <button
            onClick={onAddQuestion}
            className="bg-[#262627] hover:bg-black text-white p-1 rounded-md transition-colors"
            title="Add question"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drag and Drop Container */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {questions.map((q, idx) => (
                <SortableQuestionItem
                  key={q.id}
                  question={q}
                  index={idx}
                  isActive={activeQuestionId === q.id}
                  onSelect={() => onSelectQuestion(q.id)}
                  onDuplicate={() => onDuplicateQuestion(q.id)}
                  onDelete={() => onDeleteQuestion(q.id)}
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                  totalQuestions={questions.length}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Inline "+ Add content" button matching Screenshot 1 & 5 */}
        <button
          onClick={onAddQuestion}
          className="w-full mt-2 py-2 px-3 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 flex items-center justify-center space-x-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-gray-500" />
          <span>Add content</span>
        </button>

        {/* Add Welcome Screen Card matching Screenshot 5 */}
        <div className="border border-dashed border-gray-200 bg-white/60 rounded-lg p-2 flex items-center justify-between text-xs text-gray-500 hover:border-gray-300 cursor-pointer">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[11px] font-medium">Add Welcome Screen</span>
          </div>
          <Plus className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Bottom Endings Card */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2 px-1">
          <span>Endings</span>
          <button className="p-0.5 hover:bg-gray-200 rounded text-gray-500">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="bg-gray-100/60 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700 font-medium flex items-center justify-between">
          <span>Thank You Screen</span>
          <span className="text-[10px] text-gray-400">Default</span>
        </div>
      </div>
    </aside>
  );
}
