"use client";

import { useState } from "react";
import { Monitor, Smartphone, Play, Plus, Mic, Send, Star, ChevronDown, CheckCircle2 } from "lucide-react";
import { Question } from "@/types";

interface BuilderCanvasProps {
  question: Question | null;
  questionNumber: number;
  onUpdateQuestion: (updated: Partial<Question>) => void;
  onAddQuestion: () => void;
}

export default function BuilderCanvas({
  question,
  questionNumber,
  onUpdateQuestion,
  onAddQuestion,
}: BuilderCanvasProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  if (!question) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8">
        <p className="text-gray-400 text-sm">No question selected.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#fbfbfb] flex flex-col justify-between overflow-hidden relative select-none">
      {/* Top Toolbar */}
      <div className="h-12 border-b border-gray-200/80 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onAddQuestion}
            className="bg-[#262627] hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add content</span>
          </button>
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center space-x-1 border border-gray-200 bg-gray-50 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("desktop")}
            className={`p-1 rounded text-xs transition-colors ${
              viewMode === "desktop" ? "bg-white text-gray-900 shadow-2xs font-semibold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={`p-1 rounded text-xs transition-colors ${
              viewMode === "mobile" ? "bg-white text-gray-900 shadow-2xs font-semibold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Live Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div
          className={`transition-all duration-300 ${
            viewMode === "mobile"
              ? "w-[360px] h-[640px] bg-white rounded-[32px] border-[8px] border-gray-900 shadow-2xl p-6 flex flex-col justify-center"
              : "w-full max-w-2xl bg-white rounded-2xl border border-gray-200/90 shadow-lg p-10 space-y-6"
          }`}
        >
          {/* Question Title & Number */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-purple-600 font-bold text-lg leading-tight">
                {questionNumber} →
              </span>
              <input
                type="text"
                value={question.title}
                onChange={(e) => onUpdateQuestion({ title: e.target.value })}
                placeholder="Write your question here..."
                className="w-full text-xl font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-purple-500 focus:outline-none py-0.5 transition-all"
              />
              {question.is_required && (
                <span className="text-red-500 font-bold text-lg">*</span>
              )}
            </div>

            {/* Description / Help text */}
            <input
              type="text"
              value={question.description || ""}
              onChange={(e) => onUpdateQuestion({ description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full text-sm text-gray-500 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-purple-500 focus:outline-none py-0.5 transition-all pl-7"
            />
          </div>

          {/* Interactive Question Input Previews */}
          <div className="pl-7 pt-2">
            {question.type === "short_text" && (
              <input
                type="text"
                disabled
                placeholder="Type your answer here..."
                className="w-full border-b-2 border-gray-300 bg-transparent py-2 text-gray-400 placeholder-gray-300 text-lg focus:outline-none cursor-not-allowed"
              />
            )}

            {question.type === "long_text" && (
              <textarea
                disabled
                placeholder="Type your answer here..."
                rows={3}
                className="w-full border-b-2 border-gray-300 bg-transparent py-2 text-gray-400 placeholder-gray-300 text-lg focus:outline-none resize-none cursor-not-allowed"
              />
            )}

            {question.type === "email" && (
              <input
                type="email"
                disabled
                placeholder="name@example.com"
                className="w-full border-b-2 border-gray-300 bg-transparent py-2 text-gray-400 placeholder-gray-300 text-lg focus:outline-none cursor-not-allowed"
              />
            )}

            {question.type === "number" && (
              <input
                type="number"
                disabled
                placeholder="0"
                className="w-full border-b-2 border-gray-300 bg-transparent py-2 text-gray-400 placeholder-gray-300 text-lg focus:outline-none cursor-not-allowed"
              />
            )}

            {question.type === "multiple_choice" && (
              <div className="space-y-2 max-w-md">
                {question.options && question.options.length > 0 ? (
                  question.options.map((opt, idx) => (
                    <div
                      key={opt.id || idx}
                      className="flex items-center justify-between border border-purple-200 bg-purple-50/40 rounded-xl px-4 py-3 text-sm font-medium text-purple-950 shadow-2xs hover:border-purple-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-md bg-purple-200 text-purple-800 font-bold text-xs flex items-center justify-center">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Add options in the right settings panel</p>
                )}
              </div>
            )}

            {question.type === "dropdown" && (
              <div className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between text-gray-500 bg-white shadow-2xs cursor-not-allowed">
                <span>Select an option...</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            )}

            {question.type === "yes_no" && (
              <div className="flex items-center space-x-4 max-w-xs">
                <button
                  disabled
                  className="flex-1 border border-purple-200 bg-purple-50/40 hover:bg-purple-100 text-purple-900 font-bold text-sm py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
                >
                  <span className="w-5 h-5 rounded bg-purple-200 text-purple-800 font-bold text-xs flex items-center justify-center">Y</span>
                  <span>Yes</span>
                </button>
                <button
                  disabled
                  className="flex-1 border border-purple-200 bg-purple-50/40 hover:bg-purple-100 text-purple-900 font-bold text-sm py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
                >
                  <span className="w-5 h-5 rounded bg-purple-200 text-purple-800 font-bold text-xs flex items-center justify-center">N</span>
                  <span>No</span>
                </button>
              </div>
            )}

            {question.type === "rating" && (
              <div className="flex items-center space-x-2 pt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    disabled
                    className="w-12 h-12 rounded-xl border border-gray-200 hover:border-amber-400 bg-white hover:bg-amber-50 flex items-center justify-center text-amber-500 transition-all shadow-2xs"
                  >
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom AI bar */}
      <div className="p-4 flex justify-center">
        <div className="w-full max-w-md border border-purple-200 bg-white rounded-full shadow-lg p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500 pl-3">
            <Mic className="w-4 h-4 text-purple-600" />
            <input
              type="text"
              placeholder="Chat to create..."
              className="bg-transparent border-none outline-none text-xs text-gray-700 placeholder-gray-400 w-64"
            />
          </div>
          <button className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
