"use client";

import { ChevronLeft, Download, Gem, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";

import ErrorState from "@/components/ErrorState";
import InsightsPanel from "@/components/Results/InsightsPanel";
import ResponseDetailPanel from "@/components/Results/ResponseDetailPanel";
import ResponsesTable from "@/components/Results/ResponsesTable";
import SummaryCard from "@/components/Results/SummaryCard";
import { useToast } from "@/components/ToastProvider";
import {
  deleteResponses,
  fetchForm,
  fetchFormResponses,
  fetchFormSummary,
  responsesCsvUrl,
  submitFormResponse,
} from "@/lib/api";
import { ratingMax } from "@/lib/validation";
import { Form, FormResponseData, FormSummary, Question } from "@/types";

type SubTab = "insights" | "summary" | "responses";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "insights", label: "Insights" },
  { id: "summary", label: "Summary" },
  { id: "responses", label: "Responses" },
];

const SAMPLE_PEOPLE = [
  { name: "Meera Krishnan", email: "meera.krishnan@example.in" },
  { name: "Devansh Gupta", email: "devansh.gupta@example.in" },
  { name: "Ishita Bose", email: "ishita.bose@example.in" },
  { name: "Nikhil Raghavan", email: "nikhil.raghavan@example.in" },
  { name: "Sanya Kulkarni", email: "sanya.kulkarni@example.in" },
];

const SAMPLE_COMMENTS = [
  "Filling this out took under a minute — nice flow.",
  "Would be good to save progress midway through.",
  "The one-question-at-a-time layout keeps it focused.",
];

/** Plausible answer for the test-response generator, valid under the server's rules. */
function sampleAnswer(question: Question, person: (typeof SAMPLE_PEOPLE)[number]): string {
  switch (question.type) {
    case "multiple_choice":
    case "dropdown":
      return question.options[0]?.label ?? "";
    case "yes_no":
      return Math.random() > 0.4 ? "Yes" : "No";
    case "rating":
      return String(Math.max(1, Math.round(Math.random() * ratingMax(question))));
    case "number":
      return String(Math.floor(Math.random() * 50) + 1);
    case "email":
      return person.email;
    case "long_text":
      return SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)];
    default:
      return person.name;
  }
}

export default function FormResultsPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [summary, setSummary] = useState<FormSummary | null>(null);
  const [responses, setResponses] = useState<FormResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<SubTab>("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [formData, summaryData, responsesData] = await Promise.all([
        fetchForm(formId),
        fetchFormSummary(formId),
        fetchFormResponses(formId),
      ]);
      setForm(formData);
      setSummary(summaryData);
      setResponses(responsesData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load results.");
    } finally {
      setLoading(false);
    }
  }, [formId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredResponses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return responses;
    return responses.filter((response) =>
      response.answers.some((answer) => answer.value.toLowerCase().includes(query))
    );
  }, [responses, searchQuery]);

  const handleGenerateTestResponse = async () => {
    if (!form?.questions?.length) return;
    setIsGenerating(true);
    try {
      // One person per generated response, so name and email stay consistent.
      const person = SAMPLE_PEOPLE[Math.floor(Math.random() * SAMPLE_PEOPLE.length)];
      await submitFormResponse(
        form.id,
        form.questions.map((question) => ({
          question_id: question.id,
          value: sampleAnswer(question, person),
        }))
      );
      await loadData();
      toast.success("Test response added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate a response.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!form || !selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} response(s)? This cannot be undone.`)) return;

    try {
      const { deleted } = await deleteResponses(form.id, selectedIds);
      setSelectedIds([]);
      setDetailIndex(null);
      await loadData();
      toast.success(`Deleted ${deleted} response(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete those responses.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-panel text-sm text-faint">
        Loading results & statistics...
      </div>
    );
  }

  if (!form) {
    return (
      <ErrorState
        code="404"
        title="No results for this form"
        description="The form was deleted, or this link points at an id that no longer exists."
        action={{ label: "Back to my forms", href: "/" }}
      />
    );
  }

  const totalSubmissions = summary?.total_responses ?? responses.length;
  const activeResponse = detailIndex !== null ? filteredResponses[detailIndex] : null;

  return (
    <div className="relative flex min-h-screen flex-col bg-stage">
      {/* Builder-style top bar so Results reads as a tab of the same form */}
      <header className="flex h-[68px] shrink-0 items-center justify-between bg-white px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={`/builder/${form.id}`}
            className="flex items-center gap-2 text-[15px] font-medium text-ink transition-opacity hover:opacity-70"
          >
            <ChevronLeft className="h-[18px] w-[18px]" />
            <span>Forms</span>
          </Link>
          <span className="text-muted">›</span>
          <span className="truncate text-[15px] font-medium text-ink">{form.title}</span>
        </div>

        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
          {["Content", "Workflow", "Connect", "Share"].map((tab) => (
            <button
              key={tab}
              onClick={() => router.push(`/builder/${form.id}?tab=${tab}`)}
              className="rounded-lg px-3.5 py-1.5 text-[15px] text-muted transition-colors hover:text-ink"
            >
              {tab}
            </button>
          ))}
          <span className="rounded-lg bg-black/[0.05] px-3.5 py-1.5 text-[15px] text-ink">Results</span>
        </nav>

        <button className="rounded-lg bg-brand-green px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-green-hover active:bg-[#178770] active:scale-[0.99]">
          View plans
        </button>
      </header>

      {/* Sub-navigation: underlined tabs, as in the reference */}
      <div className="flex shrink-0 items-end gap-7 border-b border-hair bg-white px-6">
        <span className="flex items-center gap-2 pb-3.5 text-[15px] text-faint" title="Coming soon">
          <span>Smart Insights</span>
          <Gem className="h-4 w-4 text-[#a7d4c6]" />
        </span>

        {SUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`border-b-[3px] pb-3 pt-1 text-[15px] transition-colors ${
              subTab === id
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
            {id === "responses" && totalSubmissions > 0 ? ` ${totalSubmissions}` : ""}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-8 py-9">
          {subTab === "insights" && (
            <InsightsPanel summary={summary} questionCount={form.questions?.length ?? 0} />
          )}

          {subTab === "summary" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-ink">Summary</h2>
                <a
                  href={responsesCsvUrl(form.id)}
                  className="shadow-2xs flex items-center space-x-1.5 rounded-lg border border-hair bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-[#c9c9cf]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </a>
              </div>

              {(summary?.questions_summary ?? []).map((questionSummary, index) => (
                <SummaryCard
                  key={questionSummary.question_id}
                  summary={questionSummary}
                  index={index}
                  totalSubmissions={totalSubmissions}
                />
              ))}
            </div>
          )}

          {subTab === "responses" &&
            (responses.length === 0 ? (
              <div className="animate-fade-in mx-auto max-w-md space-y-4 py-24 text-center">
                <h2 className="text-2xl font-bold text-ink">No responses</h2>
                <p className="text-xs leading-relaxed text-muted">
                  Share your form to start collecting data, or generate a sample response to test
                  your workflow.
                </p>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={() => router.push(`/builder/${form.id}`)}
                    className="cursor-pointer rounded-xl bg-[#262627] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-black"
                  >
                    Share your form
                  </button>
                  <button
                    onClick={handleGenerateTestResponse}
                    disabled={isGenerating}
                    className="shadow-2xs cursor-pointer rounded-xl border border-hair bg-white px-4 py-2.5 text-xs font-semibold text-ink transition-all hover:border-[#c9c9cf] disabled:opacity-50"
                  >
                    {isGenerating ? "Generating..." : "Generate test response"}
                  </button>
                </div>
              </div>
            ) : (
              <ResponsesTable
                responses={filteredResponses}
                selectedIds={selectedIds}
                searchQuery={searchQuery}
                isGenerating={isGenerating}
                csvUrl={responsesCsvUrl(form.id)}
                onSearchChange={setSearchQuery}
                onToggleSelect={(id) =>
                  setSelectedIds((current) =>
                    current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
                  )
                }
                onToggleSelectAll={(checked) =>
                  setSelectedIds(checked ? filteredResponses.map((r) => r.id) : [])
                }
                onOpenDetail={setDetailIndex}
                onGenerateTestResponse={handleGenerateTestResponse}
              />
            ))}
        </main>

        {activeResponse && detailIndex !== null && (
          <ResponseDetailPanel
            response={activeResponse}
            form={form}
            index={detailIndex}
            total={filteredResponses.length}
            onNavigate={setDetailIndex}
            onClose={() => setDetailIndex(null)}
          />
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="animate-fade-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 select-none items-center space-x-4 rounded-2xl border border-hair bg-white px-5 py-2.5 text-xs shadow-2xl">
          <span className="font-bold text-ink">{selectedIds.length} selected</span>
          <div className="h-4 w-px bg-hair" />

          <a
            href={responsesCsvUrl(form.id)}
            title="Export all responses as CSV"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-panel hover:text-ink"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            onClick={handleDeleteSelected}
            title="Delete selected"
            className="rounded-lg p-1.5 text-[#c0392b] transition-colors hover:bg-[#fdf2f1]"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setSelectedIds([])}
            title="Clear selection"
            className="rounded-lg p-1.5 text-faint transition-colors hover:bg-panel hover:text-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
