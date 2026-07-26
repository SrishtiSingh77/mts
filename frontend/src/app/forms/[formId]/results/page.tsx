"use client";

import { BarChart2, ChevronLeft, Download, Sparkles, Table, Trash2, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";

import Header from "@/components/Header";
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

const SUB_TABS: { id: SubTab; label: string; icon: typeof BarChart2 }[] = [
  { id: "insights", label: "Insights", icon: TrendingUp },
  { id: "summary", label: "Summary", icon: BarChart2 },
  { id: "responses", label: "Responses", icon: Table },
];

/** Plausible answer for the test-response generator, valid under the server's rules. */
function sampleAnswer(question: Question): string {
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
      return "test.user@example.com";
    case "long_text":
      return "Generated sample response for testing the results view.";
    default:
      return "Sample test response";
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
      await submitFormResponse(
        form.id,
        form.questions.map((question) => ({
          question_id: question.id,
          value: sampleAnswer(question),
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-400">
        Loading results & statistics...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-red-500">
        Form not found.
      </div>
    );
  }

  const totalSubmissions = summary?.total_responses ?? responses.length;
  const activeResponse = detailIndex !== null ? filteredResponses[detailIndex] : null;

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50">
      <Header activeTab="Forms" />

      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center space-x-3">
          <Link
            href={`/builder/${form.id}`}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-gray-900">{form.title}</h1>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                Results
              </span>
            </div>
            <p className="text-xs text-gray-500">Total submissions: {totalSubmissions}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 rounded-xl bg-gray-100 p-1">
          <span className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-400">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Smart Insights</span>
          </span>
          {SUB_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                subTab === id
                  ? "shadow-2xs bg-white text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>
                {label}
                {id === "responses" && totalSubmissions > 0 ? ` [${totalSubmissions}]` : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-8">
          {subTab === "insights" && (
            <InsightsPanel summary={summary} questionCount={form.questions?.length ?? 0} />
          )}

          {subTab === "summary" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-gray-900">Summary</h2>
                <a
                  href={responsesCsvUrl(form.id)}
                  className="shadow-2xs flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300"
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
                <h2 className="text-2xl font-bold text-gray-900">No responses</h2>
                <p className="text-xs leading-relaxed text-gray-500">
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
                    className="shadow-2xs cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-900 transition-all hover:border-gray-300 disabled:opacity-50"
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
        <div className="animate-fade-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 select-none items-center space-x-4 rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-xs shadow-2xl">
          <span className="font-bold text-gray-900">{selectedIds.length} selected</span>
          <div className="h-4 w-px bg-gray-200" />

          <a
            href={responsesCsvUrl(form.id)}
            title="Export all responses as CSV"
            className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            onClick={handleDeleteSelected}
            title="Delete selected"
            className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setSelectedIds([])}
            title="Clear selection"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
