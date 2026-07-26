"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Form, FormResponseData, FormSummary } from "@/types";
import { fetchForm, fetchFormResponses, fetchFormSummary, submitFormResponse } from "@/lib/api";
import {
  ChevronLeft,
  BarChart2,
  Table,
  Star,
  Eye,
  Calendar,
  Sparkles,
  TrendingUp,
  Filter,
  Monitor,
  X,
  Plus,
  Quote,
  Inbox,
  Share2,
  Download,
} from "lucide-react";

export default function FormResultsPage({ params }: { params: Promise<{ formId: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.formId;
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [summary, setSummary] = useState<FormSummary | null>(null);
  const [responses, setResponses] = useState<FormResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"insights" | "summary" | "responses">("summary");
  const [selectedResponse, setSelectedResponse] = useState<FormResponseData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formData, summaryData, responsesData] = await Promise.all([
        fetchForm(formId),
        fetchFormSummary(formId),
        fetchFormResponses(formId),
      ]);
      setForm(formData);
      setSummary(summaryData);
      setResponses(responsesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [formId]);

  const handleGenerateTestResponse = async () => {
    if (!form || !form.questions || form.questions.length === 0) return;
    try {
      setIsGenerating(true);
      const mockAnswers = form.questions.map((q) => {
        let val = "Sample test answer";
        if (q.type === "multiple_choice" || q.type === "dropdown") {
          val = q.options?.[0]?.label || "Option 1";
        } else if (q.type === "yes_no") {
          val = "Yes";
        } else if (q.type === "rating") {
          val = "5";
        } else if (q.type === "number") {
          val = "42";
        } else if (q.type === "email") {
          val = "test.user@example.com";
        }
        return { question_id: q.id, value: val };
      });

      await submitFormResponse(form.id, mockAnswers);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm font-sans">
        Loading results & statistics...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500 text-sm font-sans">
        Form not found.
      </div>
    );
  }

  const totalSubmissions = summary?.total_responses ?? responses.length;
  const mockViews = totalSubmissions > 0 ? totalSubmissions * 2 + 3 : 0;
  const mockStarts = totalSubmissions > 0 ? totalSubmissions + 2 : 0;
  const completionRate = mockStarts > 0 ? Math.round((totalSubmissions / mockStarts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none">
      <Header activeTab="Forms" />

      {/* Sub Header Navigation matching Screenshots 1, 2, 3 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href={`/builder/${form.id}`}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-gray-900">{form.title}</h1>
              <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                Results
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Total Submissions: {totalSubmissions}
            </p>
          </div>
        </div>

        {/* Sub-tabs: Smart Insights, Insights, Summary, Responses */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Smart Insights</span>
          </button>
          <button
            onClick={() => setSubTab("insights")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              subTab === "insights"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Insights</span>
          </button>
          <button
            onClick={() => setSubTab("summary")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              subTab === "summary"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>
          <button
            onClick={() => setSubTab("responses")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              subTab === "responses"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>
              Responses {totalSubmissions > 0 ? `[${totalSubmissions}]` : ""}
            </span>
            {totalSubmissions > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-full font-bold">
                +{totalSubmissions}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        {subTab === "insights" && (
          /* INSIGHTS TAB */
          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-xs">
              <button className="flex items-center space-x-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-lg shadow-2xs text-gray-700">
                <Calendar className="w-3.5 h-3.5" />
                <span>All time</span>
              </button>
              <button className="flex items-center space-x-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-lg shadow-2xs text-gray-700">
                <Monitor className="w-3.5 h-3.5" />
                <span>All devices</span>
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Big picture</h2>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-1">
                  <span className="text-xs font-medium text-gray-400">Views</span>
                  <p className="text-3xl font-extrabold text-gray-900">{mockViews}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-1">
                  <span className="text-xs font-medium text-gray-400">Starts</span>
                  <p className="text-3xl font-extrabold text-gray-900">{mockStarts}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-1">
                  <span className="text-xs font-medium text-gray-400">Submissions</span>
                  <p className="text-3xl font-extrabold text-purple-600">{totalSubmissions}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-1">
                  <span className="text-xs font-medium text-gray-400">Completion rate</span>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {mockStarts > 0 ? `${completionRate}%` : "—"}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-1">
                  <span className="text-xs font-medium text-gray-400">Time to complete</span>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {totalSubmissions > 0 ? "1m 12s" : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-8 flex items-center justify-between">
              <div className="space-y-2 max-w-lg">
                <h3 className="text-lg font-bold text-emerald-950">Question-by-question insights</h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  See where respondents drop off—the first step to optimizing your form questions for higher completion rates.
                </p>
                <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
                  Upgrade plan
                </button>
              </div>
            </div>
          </div>
        )}

        {subTab === "summary" && (
          /* SUMMARY TAB STATS */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-gray-900">Summary</h2>
              <button className="flex items-center space-x-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 shadow-2xs">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>

            {summary?.questions_summary.map((q, idx) => (
              <div
                key={q.question_id}
                className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                      Question {idx + 1} • {q.question_type.replace("_", " ")}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">{q.question_title}</h3>
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border">
                    {q.total_answers} out of {totalSubmissions} answered
                  </span>
                </div>

                {/* Multiple Choice & Dropdown Stats */}
                {q.options_stat && (
                  <div className="space-y-3 pt-1">
                    {q.options_stat.map((opt) => (
                      <div key={opt.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-gray-700">
                          <span>{opt.label}</span>
                          <span>
                            {opt.count} ({opt.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${opt.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Yes / No Stats */}
                {q.yes_count !== undefined && q.no_count !== undefined && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 text-center space-y-1">
                      <span className="text-xs font-bold text-emerald-800 uppercase">Yes</span>
                      <p className="text-2xl font-extrabold text-emerald-700">{q.yes_count}</p>
                    </div>
                    <div className="border border-red-200 bg-red-50/40 rounded-xl p-4 text-center space-y-1">
                      <span className="text-xs font-bold text-red-800 uppercase">No</span>
                      <p className="text-2xl font-extrabold text-red-700">{q.no_count}</p>
                    </div>
                  </div>
                )}

                {/* Rating Stats */}
                {q.avg_rating !== undefined && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center space-x-3 bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center text-amber-500 space-x-1">
                        <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                        <span className="text-2xl font-extrabold text-gray-900">{q.avg_rating}</span>
                        <span className="text-xs text-gray-500">/ 5 average rating</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Responses List with quote cards matching Screenshot 3 */}
                {q.text_responses && (
                  <div className="space-y-2 pt-1">
                    {q.text_responses.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">No responses recorded yet.</p>
                    ) : (
                      q.text_responses.map((ans, aIdx) => (
                        <div
                          key={aIdx}
                          className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-gray-800 shadow-2xs space-y-1.5 max-w-sm"
                        >
                          <Quote className="w-4 h-4 text-gray-400 rotate-180" />
                          <p className="font-semibold text-gray-900 text-sm">"{ans}"</p>
                          <span className="block text-[10px] text-gray-400">Recently submitted</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {subTab === "responses" && (
          /* RESPONSES TAB matching Screenshots 1 & 2 */
          <div>
            {responses.length === 0 ? (
              /* Empty State matching Screenshot 1 */
              <div className="py-24 text-center space-y-4 animate-fade-in max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-gray-900">No responses</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Share your form to start collecting data, or generate sample responses to test your workflow
                </p>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={() => router.push(`/builder/${form.id}`)}
                    className="bg-[#262627] hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    Share your form
                  </button>
                  <button
                    onClick={handleGenerateTestResponse}
                    disabled={isGenerating}
                    className="bg-white border border-gray-200 hover:border-gray-300 text-gray-900 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs transition-all disabled:opacity-50"
                  >
                    {isGenerating ? "Generating..." : "Generate test response"}
                  </button>
                </div>
              </div>
            ) : (
              /* Populated Table View matching Screenshot 2 */
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden space-y-3">
                {/* Table Top Controls */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 text-xs">
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-800 font-semibold shadow-2xs">
                      <Inbox className="w-3.5 h-3.5 text-gray-600" />
                      <span>Responses</span>
                    </button>
                    <button className="flex items-center space-x-1.5 text-gray-500 hover:text-gray-900">
                      <span>Spam [0]</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Search responses"
                      className="border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-700 bg-white focus:outline-none w-44"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleGenerateTestResponse}
                      disabled={isGenerating}
                      className="bg-white border border-gray-200 hover:border-gray-300 text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-all"
                    >
                      {isGenerating ? "Generating..." : "Generate test response"}
                    </button>
                  </div>
                </div>

                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-100/70 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-10"></th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Response type</th>
                      <th className="px-6 py-3">Answers</th>
                      <th className="px-6 py-3">Ending</th>
                      <th className="px-4 py-3 text-right">View Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {responses.map((resp) => (
                      <tr
                        key={resp.id}
                        onClick={() => setSelectedResponse(resp)}
                        className="hover:bg-purple-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-3.5">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-800">
                          {new Date(resp.submitted_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            Completed
                          </span>
                        </td>
                        <td className="px-6 py-3.5 max-w-xs truncate text-gray-800 font-medium">
                          {resp.answers.map((a) => a.value).filter(Boolean).join(" • ") || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded border text-[11px]">
                            A. Thanks for completing...
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button className="p-1 rounded bg-gray-100 group-hover:bg-purple-600 text-gray-600 group-hover:text-white transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Submission Detail Drawer Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex justify-end z-50">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 flex flex-col justify-between animate-fade-in">
            <div className="space-y-6 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Submission Detail
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    ID: #{selectedResponse.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedResponse.answers.map((ans, idx) => (
                  <div
                    key={ans.id || idx}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-1.5"
                  >
                    <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900">
                      {ans.question_title || "Question"}
                    </h4>
                    <p className="text-sm font-semibold text-gray-800 pt-1">
                      {ans.value || <span className="italic text-gray-400">Skipped / Empty</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedResponse(null)}
                className="w-full bg-[#262627] hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
