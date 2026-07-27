"use client";

import { Calendar, Gem, Search, Upload, Video, X } from "lucide-react";
import { useState } from "react";

import { GROUP_CHIP, QUESTION_TYPES, chipClassFor, questionTypesByGroup } from "@/lib/questionTypes";
import { QuestionType } from "@/types";

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: QuestionType) => void;
  onBulkAdd: (titles: string[]) => void;
}

type ModalTab = "elements" | "import" | "ai";

const TABS: { id: ModalTab; label: string }[] = [
  { id: "elements", label: "Add form elements" },
  { id: "import", label: "Import questions" },
  { id: "ai", label: "Create with AI" },
];

const RECOMMENDED: QuestionType[] = ["short_text", "multiple_choice", "rating"];

/** Element types Typeform offers that this clone deliberately leaves out. */
const UNAVAILABLE = [
  { label: "Video and Audio", icon: Video },
  { label: "File Upload", icon: Upload },
  { label: "Date", icon: Calendar },
  { label: "Payment", icon: Gem },
];

export default function AddContentModal({
  isOpen,
  onClose,
  onSelectType,
  onBulkAdd,
}: AddContentModalProps) {
  const [tab, setTab] = useState<ModalTab>("elements");
  const [search, setSearch] = useState("");
  const [importText, setImportText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const query = search.trim().toLowerCase();
  const groups = questionTypesByGroup();

  const select = (type: QuestionType) => {
    onSelectType(type);
    onClose();
  };

  const submitImport = () => {
    const lines = importText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return;
    onBulkAdd(lines);
    setImportText("");
    onClose();
  };

  const submitAi = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    // Local stub — real generation is out of scope, flagged as such in the UI.
    setTimeout(() => {
      onBulkAdd([
        `What is your feedback regarding ${aiPrompt.trim()}?`,
        "How satisfied are you with our service overall?",
        "What should we focus on next?",
      ]);
      setIsGenerating(false);
      setAiPrompt("");
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 p-4 pt-6">
      <div className="animate-fade-in flex max-h-[92vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl bg-panel shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
        {/* Tab strip — the active tab is a raised white pill */}
        <div className="flex shrink-0 items-center gap-2 px-6 pb-4 pt-5">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2.5 text-[15px] transition-colors ${
                tab === id
                  ? "border border-hair bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto rounded-full p-1.5 text-muted transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-surface px-8 py-7">
          {tab === "elements" && (
            <div className="grid grid-cols-12 gap-8">
              {/* Left rail: search, recommended, apps */}
              <div className="col-span-12 space-y-6 lg:col-span-3">
                <div className="flex items-center gap-2.5 rounded-lg border border-hair px-3 py-2.5">
                  <Search className="h-[18px] w-[18px] shrink-0 text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search form elements"
                    className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
                  />
                </div>

                <div>
                  <h4 className="mb-2.5 text-[15px] font-medium text-ink">Recommended</h4>
                  <div className="space-y-2">
                    {RECOMMENDED.map((type) => {
                      const meta = QUESTION_TYPES.find((candidate) => candidate.type === type)!;
                      const Icon = meta.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => select(type)}
                          className="flex w-full items-center gap-3 rounded-lg border border-hair px-3 py-2.5 text-left text-[15px] text-ink transition-colors hover:border-[#c9c9cf] hover:bg-panel"
                        >
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-md ${chipClassFor(type)}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2.5 text-[15px] font-medium text-ink">Connect to apps</h4>
                  <div className="space-y-2">
                    {["Hubspot", "Salesforce", "Browse all apps"].map((app) => (
                      <div
                        key={app}
                        title="Integrations — coming soon"
                        className="flex cursor-not-allowed items-center justify-between rounded-lg border border-hair px-3 py-2.5 text-[15px] text-faint"
                      >
                        <span>{app}</span>
                        <Gem className="h-4 w-4 text-[#a7d4c6]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Catalog, driven by the shared type registry */}
              <div className="col-span-12 grid grid-cols-2 gap-x-8 gap-y-7 lg:col-span-9 lg:grid-cols-3">
                {groups.map(({ group, metas }) => {
                  const visible = metas.filter((meta) =>
                    meta.label.toLowerCase().includes(query)
                  );
                  if (!visible.length) return null;

                  return (
                    <div key={group}>
                      <h4 className="mb-2.5 text-[15px] font-medium text-ink">{group}</h4>
                      <div className="space-y-0.5">
                        {visible.map((meta) => {
                          const Icon = meta.icon;
                          return (
                            <button
                              key={meta.type}
                              onClick={() => select(meta.type)}
                              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[15px] text-ink transition-colors hover:bg-panel"
                            >
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-md ${GROUP_CHIP[group]}`}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span>{meta.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div>
                  <h4 className="mb-2.5 text-[15px] font-medium text-ink">Not in this build</h4>
                  <div className="space-y-0.5">
                    {UNAVAILABLE.filter((item) => item.label.toLowerCase().includes(query)).map(
                      ({ label, icon: Icon }) => (
                        <div
                          key={label}
                          className="flex cursor-not-allowed items-center gap-3 rounded-lg px-2 py-2 text-[15px] text-faint"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-panel">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>{label}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "import" && (
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8">
                <h4 className="mb-2.5 text-[15px] font-medium text-ink">Form questions</h4>
                <textarea
                  rows={14}
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder="Copy and paste or type in your questions, and press enter after each one."
                  className="w-full resize-none rounded-lg border border-hair bg-panel/60 p-4 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                />
              </div>

              <div className="col-span-12 space-y-4 lg:col-span-4">
                <div className="rounded-lg border border-[#bcd7f5] bg-[#f5faff] p-4 text-[14px] text-ink dark:border-[#2c4a6b] dark:bg-[#111d28]">
                  <ul className="list-disc space-y-2 pl-4">
                    <li>Paste or type your questions in the text field</li>
                    <li>Each line becomes its own short-text question</li>
                  </ul>
                </div>
                <button
                  onClick={submitImport}
                  disabled={!importText.trim()}
                  className="w-full rounded-lg bg-chrome py-2.5 text-[15px] font-medium text-on-chrome transition-colors hover:bg-chrome-hover active:bg-chrome-pressed disabled:cursor-not-allowed disabled:bg-[#c9c9cf]"
                >
                  Import questions
                </button>
              </div>
            </div>
          )}

          {tab === "ai" && (
            <div className="mx-auto max-w-xl space-y-4 py-4">
              <h4 className="text-[17px] font-medium text-ink">Create with AI</h4>
              <p className="text-[15px] text-muted">
                Describe your form and a starter set of questions is generated locally. Real model
                generation is out of scope for this build.
              </p>
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="e.g. A customer feedback survey for a mechanical keyboard store..."
                className="w-full resize-none rounded-lg border border-hair p-4 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none"
              />
              <button
                onClick={submitAi}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full rounded-lg bg-chrome py-2.5 text-[15px] font-medium text-on-chrome transition-colors hover:bg-chrome-hover active:bg-chrome-pressed disabled:cursor-not-allowed disabled:bg-[#c9c9cf]"
              >
                {isGenerating ? "Generating questions..." : "Generate questions"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
