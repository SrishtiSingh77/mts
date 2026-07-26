"use client";

import { useState } from "react";
import { Calendar, Lock, Search, Sparkles, Upload, X } from "lucide-react";
import { QUESTION_TYPES, questionTypesByGroup } from "@/lib/questionTypes";
import { QuestionType } from "@/types";

/** Question types the assignment leaves as placeholders. */
const UNAVAILABLE_TYPES = [
  { label: "File Upload", icon: Upload },
  { label: "Date", icon: Calendar },
  { label: "Payment", icon: Lock },
];

const RECOMMENDED: QuestionType[] = ["short_text", "multiple_choice", "rating"];

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: QuestionType) => void;
  onBulkAdd?: (titles: string[]) => void;
}

export default function AddContentModal({
  isOpen,
  onClose,
  onSelectType,
  onBulkAdd,
}: AddContentModalProps) {
  const [activeTab, setActiveTab] = useState<"elements" | "import" | "ai">("elements");
  const [searchQuery, setSearchQuery] = useState("");
  const [importText, setImportText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const groups = questionTypesByGroup();

  const handleSelect = (type: QuestionType) => {
    onSelectType(type);
    onClose();
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const lines = importText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length > 0 && onBulkAdd) {
      onBulkAdd(lines);
    }
    setImportText("");
    onClose();
  };

  const handleAiSubmit = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      // Generate sample questions based on prompt
      const generated = [
        `What is your feedback regarding ${aiPrompt}?`,
        "How satisfied are you with our service overall?",
        "What feature should we focus on next?",
      ];
      if (onBulkAdd) {
        onBulkAdd(generated);
      }
      setIsGenerating(false);
      setAiPrompt("");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4 flex items-center space-x-6">
          <button
            onClick={() => setActiveTab("elements")}
            className={`pb-3 font-semibold text-xs transition-colors border-b-2 ${
              activeTab === "elements"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Add form elements
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`pb-3 font-semibold text-xs transition-colors border-b-2 ${
              activeTab === "import"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Import questions
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`pb-3 font-semibold text-xs transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === "ai"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-purple-600"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Create with AI</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "elements" && (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Sidebar inside modal */}
              <div className="col-span-4 space-y-4 border-r border-gray-100 pr-6">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search form elements"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Recommended
                  </span>
                  <div className="space-y-1.5">
                    {RECOMMENDED.map((type) => {
                      const meta = QUESTION_TYPES.find((candidate) => candidate.type === type)!;
                      const Icon = meta.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => handleSelect(type)}
                          className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 flex items-center space-x-2.5 text-xs font-medium text-gray-800 transition-all"
                        >
                          <Icon className={`w-4 h-4 ${meta.iconClass}`} />
                          <span>{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Element catalog, grouped straight from the shared type registry */}
              <div className="col-span-8 grid grid-cols-2 gap-6 text-xs">
                {Object.entries(groups).map(([group, metas]) => (
                  <div key={group} className="space-y-3">
                    <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                      {group}
                    </h4>
                    <div className="space-y-1.5">
                      {metas
                        .filter((meta) =>
                          meta.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
                        )
                        .map((meta) => {
                          const Icon = meta.icon;
                          return (
                            <button
                              key={meta.type}
                              onClick={() => handleSelect(meta.type)}
                              className="w-full text-left p-2 rounded-lg hover:bg-gray-100 flex items-center space-x-2.5 text-gray-800 transition-colors"
                            >
                              <Icon className={`w-4 h-4 ${meta.iconClass}`} />
                              <span>{meta.label}</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}

                <div className="space-y-3">
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                    Not available yet
                  </h4>
                  <div className="space-y-1.5">
                    {UNAVAILABLE_TYPES.map(({ label, icon: Icon }) => (
                      <div
                        key={label}
                        className="w-full p-2 rounded-lg flex items-center justify-between text-gray-400 cursor-not-allowed"
                      >
                        <span className="flex items-center space-x-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </span>
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-semibold">
                          Soon
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="space-y-4 max-w-xl mx-auto py-4">
              <h3 className="text-sm font-bold text-gray-900">Import questions in bulk</h3>
              <p className="text-xs text-gray-500">
                Copy and paste or type in your questions below, pressing enter after each one.
              </p>
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="What is your name?&#10;What is your email address?&#10;How would you rate our platform?"
                className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onClick={handleImportSubmit}
                className="w-full bg-[#262627] hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm"
              >
                Import Questions
              </button>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-4 max-w-xl mx-auto py-4">
              <div className="flex items-center space-x-2 text-purple-700 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Create Form with Typeform AI</span>
              </div>
              <p className="text-xs text-gray-500">
                Describe the purpose of your form and AI will generate tailored questions for you.
              </p>
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. A customer feedback survey for an e-commerce website selling mechanical keyboards..."
                className="w-full border border-purple-200 bg-purple-50/30 rounded-xl p-3 text-xs text-gray-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onClick={handleAiSubmit}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <span>Generating form questions...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Questions</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
