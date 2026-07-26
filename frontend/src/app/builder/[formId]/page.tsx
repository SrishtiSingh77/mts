"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import BuilderHeader from "@/components/Builder/BuilderHeader";
import BuilderSidebarPages from "@/components/Builder/BuilderSidebarPages";
import BuilderCanvas from "@/components/Builder/BuilderCanvas";
import BuilderRightPanel from "@/components/Builder/BuilderRightPanel";
import ShareModal from "@/components/Builder/ShareModal";
import AddContentModal from "@/components/Builder/AddContentModal";
import { Form, Question, QuestionType } from "@/types";
import {
  fetchForm,
  updateForm,
  createQuestion,
  updateQuestion,
  duplicateQuestion,
  deleteQuestion,
  reorderQuestions,
  togglePublishForm,
} from "@/lib/api";

export default function BuilderPage({ params }: { params: Promise<{ formId: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.formId;
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Content" | "Workflow" | "Connect">("Content");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);

  const loadFormData = async () => {
    try {
      const data = await fetchForm(formId);
      setForm(data);
      if (data.questions && data.questions.length > 0) {
        if (!activeQuestionId || !data.questions.find((q) => q.id === activeQuestionId)) {
          setActiveQuestionId(data.questions[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, [formId]);

  const handleUpdateFormTitle = async (newTitle: string) => {
    if (!form) return;
    setForm({ ...form, title: newTitle });
    try {
      await updateForm(form.id, { title: newTitle });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestionWithType = async (type: QuestionType = "short_text") => {
    if (!form) return;
    try {
      const newQ = await createQuestion(form.id, type);
      const updatedQuestions = [...(form.questions || []), newQ];
      setForm({ ...form, questions: updatedQuestions });
      setActiveQuestionId(newQ.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAddQuestions = async (titles: string[]) => {
    if (!form) return;
    try {
      for (const title of titles) {
        const newQ = await createQuestion(form.id, "short_text");
        await updateQuestion(newQ.id, { title });
      }
      await loadFormData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQuestion = async (updatedData: Partial<Question>) => {
    if (!form || !activeQuestionId) return;
    const questions = form.questions || [];
    const updatedQuestions = questions.map((q) =>
      q.id === activeQuestionId ? { ...q, ...updatedData } : q
    );
    setForm({ ...form, questions: updatedQuestions });

    try {
      await updateQuestion(activeQuestionId, updatedData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateQuestion = async (qId: string) => {
    try {
      const dup = await duplicateQuestion(qId);
      await loadFormData();
      setActiveQuestionId(dup.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!form) return;
    try {
      await deleteQuestion(qId);
      const remaining = (form.questions || []).filter((q) => q.id !== qId);
      setForm({ ...form, questions: remaining });
      if (activeQuestionId === qId && remaining.length > 0) {
        setActiveQuestionId(remaining[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorder = async (newQuestions: Question[]) => {
    if (!form) return;
    setForm({ ...form, questions: newQuestions });
    try {
      await reorderQuestions(form.id, newQuestions.map((q) => q.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async () => {
    if (!form) return;
    try {
      const updated = await togglePublishForm(form.id);
      setForm({ ...form, status: updated.status });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Loading builder...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center text-red-500 text-sm">
        Form not found.
      </div>
    );
  }

  const activeQuestion =
    (form.questions || []).find((q) => q.id === activeQuestionId) || null;
  const activeIndex = (form.questions || []).findIndex(
    (q) => q.id === activeQuestionId
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
      <BuilderHeader
        form={form}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onShareClick={() => setIsShareModalOpen(true)}
        onTitleChange={handleUpdateFormTitle}
      />

      {activeTab === "Content" ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left Pages Sidebar */}
          <BuilderSidebarPages
            questions={form.questions || []}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={setActiveQuestionId}
            onAddQuestion={() => setIsAddContentModalOpen(true)}
            onDuplicateQuestion={handleDuplicateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onReorder={handleReorder}
          />

          {/* Center Canvas Live Preview */}
          <BuilderCanvas
            question={activeQuestion}
            questionNumber={activeIndex + 1}
            onUpdateQuestion={handleUpdateQuestion}
            onAddQuestion={() => setIsAddContentModalOpen(true)}
          />

          {/* Right Question Settings Inspector */}
          <BuilderRightPanel
            question={activeQuestion}
            onUpdateQuestion={handleUpdateQuestion}
          />
        </div>
      ) : (
        /* Workflow / Connect Tab Placeholders */
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/60 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">
            {activeTab === "Workflow" ? "⚡" : "🔌"}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{activeTab} Settings</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            {activeTab} feature configuration is available as a placeholder in this demo.
          </p>
          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      )}

      {/* Share / Publish Overlay Modal */}
      <ShareModal
        form={form}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onTogglePublish={handleTogglePublish}
      />

      {/* Add Content Modal Catalog */}
      <AddContentModal
        isOpen={isAddContentModalOpen}
        onClose={() => setIsAddContentModalOpen(false)}
        onSelectType={handleAddQuestionWithType}
        onBulkAdd={handleBulkAddQuestions}
      />
    </div>
  );
}
