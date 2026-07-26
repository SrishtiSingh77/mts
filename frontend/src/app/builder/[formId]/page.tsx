"use client";

import { Plug, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

import AddContentModal from "@/components/Builder/AddContentModal";
import BuilderCanvas from "@/components/Builder/BuilderCanvas";
import BuilderHeader, { BuilderTab } from "@/components/Builder/BuilderHeader";
import BuilderRightPanel from "@/components/Builder/BuilderRightPanel";
import BuilderSidebarPages from "@/components/Builder/BuilderSidebarPages";
import ComingSoonPanel from "@/components/Builder/ComingSoonPanel";
import SettingsTabView from "@/components/Builder/SettingsTabView";
import ShareTabView from "@/components/Builder/ShareTabView";
import { useToast } from "@/components/ToastProvider";
import {
  createQuestion,
  deleteQuestion,
  duplicateQuestion,
  fetchForm,
  reorderQuestions,
  togglePublishForm,
  updateForm,
  updateQuestion,
} from "@/lib/api";
import { Form, FormEnding, FormTheme, FormUpdatePayload, Question, QuestionType } from "@/types";

const SAVE_DEBOUNCE_MS = 500;

/** Per-question debounce timers, module-scoped so re-renders do not reset them. */
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

export default function BuilderPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BuilderTab>("Content");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);

  const loadForm = useCallback(async () => {
    try {
      const data = await fetchForm(formId);
      setForm(data);
      setActiveQuestionId((current) => {
        const stillExists = data.questions?.some((q) => q.id === current);
        return stillExists ? current : (data.questions?.[0]?.id ?? null);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load this form.");
    } finally {
      setLoading(false);
    }
  }, [formId, toast]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  /** Optimistic form patch plus a persisted PUT. */
  const saveForm = async (patch: FormUpdatePayload, successMessage?: string) => {
    if (!form) return;
    setForm({ ...form, ...patch } as Form);
    try {
      const updated = await updateForm(form.id, patch);
      setForm(updated);
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your changes.");
      loadForm();
    }
  };

  const handleTabChange = (tab: BuilderTab) => {
    if (tab === "Results") {
      router.push(`/forms/${formId}/results`);
      return;
    }
    setActiveTab(tab);
  };

  const handleAddQuestion = async (type: QuestionType) => {
    if (!form) return;
    try {
      const question = await createQuestion(form.id, type);
      setForm({ ...form, questions: [...(form.questions ?? []), question] });
      setActiveQuestionId(question.id);
      toast.success("Question added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add that question.");
    }
  };

  const handleBulkAdd = async (titles: string[]) => {
    if (!form) return;
    try {
      await Promise.all(titles.map((title) => createQuestion(form.id, "short_text", { title })));
      await loadForm();
      toast.success(`Imported ${titles.length} question${titles.length === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed.");
    }
  };

  /** Debounced so typing a title is one request, not one per keystroke. */
  const handleUpdateQuestion = (patch: Partial<Question>) => {
    if (!form || !activeQuestionId) return;
    const questionId = activeQuestionId;

    setForm({
      ...form,
      questions: (form.questions ?? []).map((q) =>
        q.id === questionId ? { ...q, ...patch } : q
      ),
    });

    if (saveTimers.has(questionId)) clearTimeout(saveTimers.get(questionId));
    saveTimers.set(
      questionId,
      setTimeout(async () => {
        saveTimers.delete(questionId);
        try {
          await updateQuestion(questionId, patch);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save that question.");
        }
      }, SAVE_DEBOUNCE_MS)
    );
  };

  const handleDuplicateQuestion = async (questionId: string) => {
    try {
      const duplicate = await duplicateQuestion(questionId);
      await loadForm();
      setActiveQuestionId(duplicate.id);
      toast.success("Question duplicated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not duplicate that question.");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!form) return;
    try {
      await deleteQuestion(questionId);
      const remaining = (form.questions ?? []).filter((q) => q.id !== questionId);
      setForm({ ...form, questions: remaining });
      if (activeQuestionId === questionId) setActiveQuestionId(remaining[0]?.id ?? null);
      toast.success("Question deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete that question.");
    }
  };

  const handleReorder = async (questions: Question[]) => {
    if (!form) return;
    const previous = form.questions ?? [];
    setForm({ ...form, questions });
    try {
      await reorderQuestions(form.id, questions.map((q) => q.id));
    } catch (error) {
      setForm({ ...form, questions: previous });
      toast.error(error instanceof Error ? error.message : "Could not reorder questions.");
    }
  };

  const handleTogglePublish = async () => {
    if (!form) return;
    try {
      const updated = await togglePublishForm(form.id);
      setForm(updated);
      toast.success(updated.status === "published" ? "Form published" : "Form unpublished");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change publish status.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-400">
        Loading builder...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-red-500">
        Form not found.
      </div>
    );
  }

  const questions = form.questions ?? [];
  const activeQuestion = questions.find((q) => q.id === activeQuestionId) ?? null;
  const activeIndex = questions.findIndex((q) => q.id === activeQuestionId);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <BuilderHeader
        form={form}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onTitleChange={(title) => saveForm({ title })}
      />

      {activeTab === "Content" && (
        <div className="flex flex-1 overflow-hidden">
          <BuilderSidebarPages
            questions={questions}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={setActiveQuestionId}
            onAddQuestion={() => setIsAddContentOpen(true)}
            onDuplicateQuestion={handleDuplicateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onReorder={handleReorder}
          />

          <BuilderCanvas
            question={activeQuestion}
            questionNumber={activeIndex + 1}
            theme={form.theme}
            onUpdateQuestion={handleUpdateQuestion}
            onAddQuestion={() => setIsAddContentOpen(true)}
          />

          <BuilderRightPanel question={activeQuestion} onUpdateQuestion={handleUpdateQuestion} />
        </div>
      )}

      {activeTab === "Share" && (
        <ShareTabView form={form} onTogglePublish={handleTogglePublish} />
      )}

      {activeTab === "Settings" && (
        <SettingsTabView
          form={form}
          onThemeChange={(theme: FormTheme) => saveForm({ theme })}
          onEndingChange={(ending: FormEnding) => saveForm({ ending })}
        />
      )}

      {activeTab === "Workflow" && (
        <ComingSoonPanel
          icon={Workflow}
          title="Logic & branching"
          description="Route respondents down different paths based on their answers."
          features={["Logic jumps", "Conditional branching", "Question groups", "Calculated scores"]}
        />
      )}

      {activeTab === "Connect" && (
        <ComingSoonPanel
          icon={Plug}
          title="Integrations"
          description="Push responses to the tools your team already uses."
          features={["Webhooks", "Google Sheets", "Slack notifications", "Team collaboration"]}
        />
      )}

      <AddContentModal
        isOpen={isAddContentOpen}
        onClose={() => setIsAddContentOpen(false)}
        onSelectType={handleAddQuestion}
        onBulkAdd={handleBulkAdd}
      />
    </div>
  );
}
