"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Form, FormResponseData, FormSummary } from "@/types";
import { fetchForm, fetchFormResponses, fetchFormSummary } from "@/lib/api";
import { ChevronLeft, BarChart2, Table, Star, CheckCircle, Eye, Calendar, User, X } from "lucide-react";

export default function FormResultsPage({ params }: { params: Promise<{ formId: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.formId;
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [summary, setSummary] = useState<FormSummary | null>(null);
  const [responses, setResponses] = useState<FormResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "responses">("summary");
  const [selectedResponse, setSelectedResponse] = useState<FormResponseData | null>(null);

  useEffect(() => {
    async function loadData() {
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
    }
    loadData();
  }, [formId]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header activeTab="Forms" />

      {/* Sub Header Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
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
              Total Submissions: {summary?.total_responses ?? responses.length}
            </p>
          </div>
        </div>

        {/* Tab Switcher: Summary / Responses */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === "summary"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === "responses"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Responses ({responses.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        {activeTab === "summary" ? (
          /* SUMMARY TAB STATS */
          <div className="space-y-6">
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
                    {q.total_answers} answers
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
                        <span className="text-xs text-gray-500">/ 5 avg</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Number Stats */}
                {q.avg_number !== undefined && (
                  <div className="grid grid-cols-3 gap-4 pt-1 text-center">
                    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase">Average</span>
                      <p className="text-lg font-bold text-gray-900">{q.avg_number}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase">Min</span>
                      <p className="text-lg font-bold text-gray-900">{q.min_number}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase">Max</span>
                      <p className="text-lg font-bold text-gray-900">{q.max_number}</p>
                    </div>
                  </div>
                )}

                {/* Text Responses List */}
                {q.text_responses && (
                  <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
                    {q.text_responses.length === 0 ? (
                      <p className="text-xs text-gray-400">No responses recorded yet.</p>
                    ) : (
                      q.text_responses.map((ans, aIdx) => (
                        <div
                          key={aIdx}
                          className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-xs text-gray-800"
                        >
                          "{ans}"
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* RESPONSES TAB TABLE */
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">Submitted Responses</h3>
              <span className="text-xs text-gray-500 font-medium">
                Click any submission row to view complete answers
              </span>
            </div>

            {responses.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                No submissions received yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100/70 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Submission ID</th>
                    <th className="px-6 py-3.5">Date & Time</th>
                    <th className="px-6 py-3.5">Answers Preview</th>
                    <th className="px-6 py-3.5 text-right">View Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {responses.map((resp) => (
                    <tr
                      key={resp.id}
                      onClick={() => setSelectedResponse(resp)}
                      className="hover:bg-purple-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-purple-600 font-semibold">
                        #{resp.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(resp.submitted_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-800 font-medium">
                        {resp.answers.map((a) => a.value).filter(Boolean).join(" • ") || "No answers"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-purple-600 text-gray-600 group-hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
