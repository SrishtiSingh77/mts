"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { useToast } from "@/components/ToastProvider";
import { useFormFlow } from "@/hooks/useFormFlow";
import { accentOf, themeStyles } from "@/lib/theme";
import { Form } from "@/types";
import EndingScreen from "./EndingScreen";
import FlowFooter from "./FlowFooter";
import QuestionCard from "./QuestionCard";
import WelcomeScreen from "./WelcomeScreen";

interface RespondentExperienceProps {
  form: Form;
  /** Preview runs the identical flow but never stores a response. */
  preview?: boolean;
}

/**
 * The one-question-at-a-time experience, shared by the public link and the
 * creator's preview so the two can never drift apart.
 */
export default function RespondentExperience({ form, preview }: RespondentExperienceProps) {
  const router = useRouter();
  const toast = useToast();

  const onFlowError = useCallback((message: string) => toast.error(message), [toast]);
  const flow = useFormFlow({ form, onError: onFlowError, preview });

  useEffect(() => {
    if (flow.stage === "ending") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [flow.stage]);

  if (flow.stage === "welcome") {
    return (
      <>
        {preview && <PreviewBadge />}
        <WelcomeScreen form={form} onStart={flow.start} />
      </>
    );
  }

  if (flow.stage === "ending") {
    return (
      <>
        {preview && <PreviewBadge />}
        <EndingScreen
          form={form}
          onPrimaryAction={() => router.push("/")}
          onSubmitAnother={flow.restart}
        />
      </>
    );
  }

  const accent = accentOf(form.theme);

  return (
    <div style={themeStyles(form.theme)} className="flex min-h-screen flex-col overflow-hidden">
      {preview && <PreviewBadge />}

      {/* Thin progress rule pinned to the very top */}
      <div className="fixed left-0 right-0 top-0 z-40 h-[3px] bg-[#e4e4e7]">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${flow.progress}%`, backgroundColor: accent }}
        />
      </div>

      {/* Content sits left-aligned and vertically centred, as in Typeform */}
      <div className="flex flex-1 items-center px-6 sm:px-[12%]">
        <AnimatePresence mode="wait">
          {flow.current && (
            <motion.div
              key={flow.current.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-[820px]"
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
        canGoBack={flow.canGoBack}
        isLast={flow.isLast}
        onPrev={flow.goBack}
        onNext={flow.goNext}
      />
    </div>
  );
}

/** Makes it unmistakable that a preview run is not recorded. */
function PreviewBadge() {
  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
      <span className="flex items-center gap-2 rounded-full bg-ink/90 px-4 py-1.5 text-[13px] font-medium text-white shadow-lg backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-[#6ee7b7]" />
        <span>Preview — answers are not saved</span>
      </span>
    </div>
  );
}
