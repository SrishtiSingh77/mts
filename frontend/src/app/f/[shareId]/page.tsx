"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";

import EndingScreen from "@/components/Respondent/EndingScreen";
import FlowFooter from "@/components/Respondent/FlowFooter";
import LoadingScreen from "@/components/Respondent/LoadingScreen";
import QuestionCard from "@/components/Respondent/QuestionCard";
import WelcomeScreen from "@/components/Respondent/WelcomeScreen";
import { useToast } from "@/components/ToastProvider";
import { useFormFlow } from "@/hooks/useFormFlow";
import { fetchFormByShareId } from "@/lib/api";
import { accentOf, themeStyles } from "@/lib/theme";
import { Form } from "@/types";

const MIN_SPLASH_MS = 600;

export default function PublicFormPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params);
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const onFlowError = useCallback((message: string) => toast.error(message), [toast]);
  const flow = useFormFlow({ form, onError: onFlowError });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const startedAt = Date.now();
      try {
        const data = await fetchFormByShareId(shareId);
        if (!cancelled) setForm(data);
      } catch {
        if (!cancelled) setLoadError("This form is not available.");
      } finally {
        // Hold the splash briefly so it does not flash on a fast response.
        const elapsed = Date.now() - startedAt;
        setTimeout(() => !cancelled && setLoading(false), Math.max(0, MIN_SPLASH_MS - elapsed));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  useEffect(() => {
    if (flow.stage === "ending") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [flow.stage]);

  if (loading) return <LoadingScreen />;

  if (loadError || !form) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-[#fcfcfc] p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
          !
        </div>
        <h2 className="text-xl font-bold text-gray-900">{loadError ?? "Form not found"}</h2>
        <p className="max-w-sm text-xs text-gray-500">
          The link may be invalid, or the creator has unpublished this form.
        </p>
      </div>
    );
  }

  if (flow.stage === "welcome") return <WelcomeScreen form={form} onStart={flow.start} />;

  if (flow.stage === "ending") {
    return (
      <EndingScreen
        form={form}
        onPrimaryAction={() => router.push("/")}
        onSubmitAnother={flow.restart}
      />
    );
  }

  const accent = accentOf(form.theme);

  return (
    <div
      style={themeStyles(form.theme)}
      className="flex min-h-screen flex-col justify-between overflow-hidden p-6 sm:p-12"
    >
      <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-gray-200">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${flow.progress}%`, backgroundColor: accent }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {flow.current && (
            <motion.div
              key={flow.current.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full"
            >
              <QuestionCard
                question={flow.current}
                number={flow.index + 1}
                value={flow.answers[flow.current.id] ?? ""}
                accent={accent}
                error={flow.error}
                isLast={flow.isLast}
                isSubmitting={flow.isSubmitting}
                onChange={(value) => flow.setAnswer(flow.current!.id, value)}
                onAdvance={flow.goNext}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FlowFooter
        index={flow.index}
        total={flow.questions.length}
        onPrev={flow.goBack}
        onNext={flow.goNext}
      />
    </div>
  );
}
