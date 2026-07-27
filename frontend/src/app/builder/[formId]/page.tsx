"use client";

import { Plug } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

import AddContentModal from "@/components/Builder/AddContentModal";
import BuilderCanvas from "@/components/Builder/BuilderCanvas";
import BuilderHeader, { BUILDER_TABS, BuilderTab } from "@/components/Builder/BuilderHeader";
import BuilderRightPanel from "@/components/Builder/BuilderRightPanel";
import BuilderSidebarPages from "@/components/Builder/BuilderSidebarPages";
import BuilderToolbar from "@/components/Builder/BuilderToolbar";
import ComingSoonPanel from "@/components/Builder/ComingSoonPanel";
import EndingInspector from "@/components/Builder/EndingInspector";
import SettingsTabView from "@/components/Builder/SettingsTabView";
import ShareTabView from "@/components/Builder/ShareTabView";
import WelcomeInspector from "@/components/Builder/WelcomeInspector";
import WorkflowTabView from "@/components/Builder/WorkflowTabView";
import ErrorState from "@/components/ErrorState";
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
  updateQuestionLogic,
} from "@/lib/api";
import {
  Form,
  FormEnding,
  FormTheme,
  FormUpdatePayload,
  FormWelcome,
  LogicRule,
  Question,
  QuestionType,
  ENDING_PAGE_ID,
  WELCOME_PAGE_ID,
} from "@/types";

const SAVE_DEBOUNCE_MS = 500;

/** Per-question debounce timers, module-scoped so re-renders do not reset them. */
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

export default function BuilderPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BuilderTab>("Content");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);

  // Lets the dashboard context menu deep-link straight to a tab.
  useEffect(() => {
    const requested = searchParams.get("tab");
    if (requested && (BUILDER_TABS as readonly string[]).includes(requested)) {
      setActiveTab(requested as BuilderTab);
    }
  }, [searchParams]);

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

  /** Welcome edits are debounced under a single key, like question edits. */
  const handleWelcomeChange = (patch: Partial<FormWelcome>) => {
    if (!form) return;
    const next = { ...form.welcome, ...patch };
    setForm({ ...form, welcome: next });

    if (saveTimers.has(WELCOME_PAGE_ID)) clearTimeout(saveTimers.get(WELCOME_PAGE_ID));
    saveTimers.set(
      WELCOME_PAGE_ID,
      setTimeout(async () => {
        saveTimers.delete(WELCOME_PAGE_ID);
        try {
          await updateForm(form.id, { welcome: next });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save the welcome screen.");
        }
      }, SAVE_DEBOUNCE_MS)
    );
  };

  const handleEndingChange = (patch: Partial<FormEnding>) => {
    if (!form) return;
    const next = { ...form.ending, ...patch };
    setForm({ ...form, ending: next });

    if (saveTimers.has(ENDING_PAGE_ID)) clearTimeout(saveTimers.get(ENDING_PAGE_ID));
    saveTimers.set(
      ENDING_PAGE_ID,
      setTimeout(async () => {
        saveTimers.delete(ENDING_PAGE_ID);
        try {
          await updateForm(form.id, { ending: next });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save the ending screen.");
        }
      }, SAVE_DEBOUNCE_MS)
    );
  };

  const handleEnableWelcome = async () => {
    if (!form) return;
    const next = { ...form.welcome, show: true };
    setForm({ ...form, welcome: next });
    setActiveQuestionId(WELCOME_PAGE_ID);
    try {
      setForm(await updateForm(form.id, { welcome: next }));
      toast.success("Welcome screen added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add a welcome screen.");
      loadForm();
    }
  };

  const handleRemoveWelcome = async () => {
    if (!form) return;
    const next = { ...form.welcome, show: false };
    setForm({ ...form, welcome: next });
    setActiveQuestionId(form.questions?.[0]?.id ?? null);
    try {
      setForm(await updateForm(form.id, { welcome: next }));
      toast.success("Welcome screen removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the welcome screen.");
      loadForm();
    }
  };

  /** Previews work on drafts; only the public /f/ link requires publishing. */
  /** Branching rules save immediately; there is no partial state worth debouncing. */
  const handleRulesChange = async (questionId: string, rules: LogicRule[]) => {
    if (!form) return;
    setForm({
      ...form,
      questions: (form.questions ?? []).map((q) => (q.id === questionId ? { ...q, logic: rules } : q)),
    });
    try {
      const updated = await updateQuestionLogic(questionId, rules);
      setForm((previous) =>
        previous
          ? {
              ...previous,
              questions: (previous.questions ?? []).map((q) =>
                q.id === questionId ? updated : q
              ),
            }
          : previous
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that rule.");
      loadForm();
    }
  };

  const handlePreview = () => {
    if (!form) return;
    if (!form.questions?.length) {
      toast.info("Add a question before previewing this form.");
      return;
    }
    window.open(`/preview/${form.id}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-[15px] text-muted">
        Loading builder...
      </div>
    );
  }

  if (!form) {
    return (
      <ErrorState
        code="404"
        title="This form no longer exists"
        description="It may have been deleted, or the link points at an id that was never created."
        action={{ label: "Back to my forms", href: "/" }}
      />
    );
  }

  const questions = form.questions ?? [];
  const isWelcomeSelected = activeQuestionId === WELCOME_PAGE_ID && form.welcome.show;
  const isEndingSelected = activeQuestionId === ENDING_PAGE_ID;
  const activeQuestion = questions.find((q) => q.id === activeQuestionId) ?? null;
  const activeIndex = questions.findIndex((q) => q.id === activeQuestionId);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      <BuilderHeader
        form={form}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onTitleChange={(title) => saveForm({ title })}
      />

      {activeTab === "Content" && (
        <>
          {/* Toolbar lives in the canvas column so it shares a row with the
              sidebar's mode selector, as in the original. */}
          <div className="flex min-h-0 flex-1">
            <BuilderSidebarPages
              questions={questions}
              activeQuestionId={activeQuestionId}
              welcomeEnabled={form.welcome.show}
              isWelcomeActive={isWelcomeSelected}
              endingTitle={form.ending.title}
              onSelectWelcome={() => setActiveQuestionId(WELCOME_PAGE_ID)}
              onEnableWelcome={handleEnableWelcome}
              onSelectQuestion={setActiveQuestionId}
              onAddQuestion={() => setIsAddContentOpen(true)}
              onDuplicateQuestion={handleDuplicateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onReorder={handleReorder}
              isEndingActive={isEndingSelected}
              onSelectEnding={() => setActiveQuestionId(ENDING_PAGE_ID)}
              collapsed={isRailCollapsed}
              onToggleCollapsed={() => setIsRailCollapsed((value) => !value)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <BuilderToolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onAddContent={() => setIsAddContentOpen(true)}
                onOpenSettings={() => setActiveTab("Settings")}
                onPreview={handlePreview}
              />

              <BuilderCanvas
                form={form}
                question={activeQuestion}
                questionNumber={activeIndex + 1}
                theme={form.theme}
                viewMode={viewMode}
                showWelcome={isWelcomeSelected}
                showEnding={isEndingSelected}
                onUpdateQuestion={handleUpdateQuestion}
                onWelcomeChange={handleWelcomeChange}
                onEndingChange={handleEndingChange}
              />
            </div>

            {isWelcomeSelected ? (
              <WelcomeInspector
                welcome={form.welcome}
                onWelcomeChange={handleWelcomeChange}
                onRemove={handleRemoveWelcome}
              />
            ) : isEndingSelected ? (
              <EndingInspector ending={form.ending} onEndingChange={handleEndingChange} />
            ) : (
              <BuilderRightPanel question={activeQuestion} onUpdateQuestion={handleUpdateQuestion} />
            )}
          </div>
        </>
      )}

      {activeTab === "Share" && (
        <ShareTabView form={form} onTogglePublish={handleTogglePublish} />
      )}

      {activeTab === "Settings" && (
        <SettingsTabView
          form={form}
          onThemeChange={(theme: FormTheme) => saveForm({ theme })}
        />
      )}

      {activeTab === "Workflow" && (
        <WorkflowTabView questions={questions} onRulesChange={handleRulesChange} />
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
