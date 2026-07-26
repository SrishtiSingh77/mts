"use client";

import { AlertCircle, Plus, Settings, X } from "lucide-react";
import { useState } from "react";

import { QUESTION_TYPES } from "@/lib/questionTypes";
import { MAX_RATING_MAX, MIN_RATING_MAX, ratingMax } from "@/lib/validation";
import { Question, QuestionOption } from "@/types";

interface BuilderRightPanelProps {
  question: Question | null;
  onUpdateQuestion: (data: Partial<Question>) => void;
}

export default function BuilderRightPanel({
  question,
  onUpdateQuestion,
}: BuilderRightPanelProps) {
  const [newOptionText, setNewOptionText] = useState("");

  if (!question) {
    return (
      <aside className="w-72 border-l border-gray-200 bg-white p-4 text-xs text-gray-400">
        No question selected
      </aside>
    );
  }

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    const currentOptions = question.options || [];
    const newOptions: QuestionOption[] = [
      ...currentOptions,
      { label: newOptionText.trim(), position: currentOptions.length },
    ];
    onUpdateQuestion({ options: newOptions });
    setNewOptionText("");
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = question.options || [];
    const newOptions = currentOptions.filter((_, idx) => idx !== index);
    onUpdateQuestion({ options: newOptions });
  };

  const handleOptionLabelChange = (index: number, newLabel: string) => {
    const currentOptions = [...(question.options || [])];
    currentOptions[index] = { ...currentOptions[index], label: newLabel };
    onUpdateQuestion({ options: currentOptions });
  };

  return (
    <aside className="w-72 border-l border-gray-200 bg-white p-4 space-y-6 flex flex-col justify-between h-[calc(100vh-3.5rem)] overflow-y-auto select-none">
      <div className="space-y-5">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-900 border-b border-gray-100 pb-3">
          <Settings className="w-4 h-4 text-purple-600" />
          <span>Question Settings</span>
        </div>

        {/* Question Type Selector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Question Type
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {QUESTION_TYPES.map(({ type, label, icon: Icon, iconClass }) => (
              <button
                key={type}
                onClick={() => onUpdateQuestion({ type })}
                className={`p-2 rounded-lg border text-left flex items-center space-x-1.5 transition-all text-xs ${
                  question.type === type
                    ? "border-purple-600 bg-purple-50 text-purple-950 font-semibold shadow-2xs"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${iconClass}`} />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-between py-2 border-y border-gray-100">
          <div>
            <span className="block text-xs font-semibold text-gray-800">Required</span>
            <span className="block text-[10px] text-gray-400">Respondent must answer</span>
          </div>
          <button
            onClick={() => onUpdateQuestion({ is_required: !question.is_required })}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              question.is_required ? "bg-purple-600 justify-end" : "bg-gray-300 justify-start"
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Question Title Setting */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700">Question Title</label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => onUpdateQuestion({ title: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Description / Help Text Setting */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700">Description / Help Text</label>
          <input
            type="text"
            value={question.description || ""}
            onChange={(e) => onUpdateQuestion({ description: e.target.value })}
            placeholder="Add subtext or guidance..."
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Rating scale length */}
        {question.type === "rating" && (
          <div className="space-y-1.5 border-t border-gray-100 pt-2">
            <label className="block text-xs font-semibold text-gray-700">
              Scale: 1 to {ratingMax(question)}
            </label>
            <input
              type="range"
              min={MIN_RATING_MAX}
              max={MAX_RATING_MAX}
              value={ratingMax(question)}
              onChange={(e) =>
                onUpdateQuestion({
                  settings: { ...question.settings, rating_max: Number(e.target.value) },
                })
              }
              className="w-full accent-purple-600"
            />
            <span className="block text-[10px] text-gray-400">
              Server rejects ratings outside this range.
            </span>
          </div>
        )}

        {/* Choice / Option Manager */}
        {(question.type === "multiple_choice" || question.type === "dropdown") && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-700">Options</label>
            <div className="space-y-1.5">
              {question.options?.map((opt, idx) => (
                <div key={opt.id || idx} className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold text-gray-400 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleOptionLabelChange(idx, e.target.value)}
                    className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-800 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleRemoveOption(idx)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-1.5 pt-1">
              <input
                type="text"
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
                placeholder="New option..."
                className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-800 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onClick={handleAddOption}
                className="bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Logic Jump Placeholder */}
      <div className="pt-4 border-t border-gray-100">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Logic Jumps</span>
          </div>
          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">Coming Soon</span>
        </div>
      </div>
    </aside>
  );
}
