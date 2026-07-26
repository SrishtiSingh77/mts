"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ApiError, submitPublicResponse } from "@/lib/api";
import { validateAnswer } from "@/lib/validation";
import { Form, Question } from "@/types";

type Stage = "welcome" | "questions" | "ending";

interface UseFormFlowOptions {
  form: Form | null;
  onError: (message: string) => void;
}

/** Owns the one-question-at-a-time state machine: position, answers, validation, submit. */
export function useFormFlow({ form, onError }: UseFormFlowOptions) {
  const questions = useMemo<Question[]>(() => form?.questions ?? [], [form]);

  const [stage, setStage] = useState<Stage>("welcome");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Choice inputs auto-advance on a timer, so the advance handler must not read a
  // stale answers closure — it reads this ref instead.
  const answersRef = useRef<Record<string, string>>({});

  const current = questions[index] ?? null;
  const isLast = index === questions.length - 1;
  const progress = questions.length ? Math.round(((index + 1) / questions.length) * 100) : 0;

  const setAnswer = useCallback((questionId: string, value: string) => {
    answersRef.current = { ...answersRef.current, [questionId]: value };
    setAnswers(answersRef.current);
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!form) return;
    setIsSubmitting(true);
    try {
      const payload = questions.map((question) => ({
        question_id: question.id,
        value: answersRef.current[question.id] ?? "",
      }));
      await submitPublicResponse(form.share_id, payload);
      setStage("ending");
    } catch (caught) {
      if (caught instanceof ApiError && caught.fieldErrors.length) {
        // Jump back to the first question the server rejected.
        const first = caught.fieldErrors[0];
        const target = questions.findIndex((question) => question.id === first.question_id);
        if (target >= 0) setIndex(target);
        setError(first.message);
      } else {
        const message =
          caught instanceof Error ? caught.message : "Failed to submit response. Please try again.";
        setError(message);
        onError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onError, questions]);

  const goNext = useCallback(() => {
    const question = questions[index];
    if (!question) return;

    const validationError = validateAnswer(question, answersRef.current[question.id] ?? "");
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    if (index === questions.length - 1) {
      void submit();
    } else {
      setIndex(index + 1);
    }
  }, [index, questions, submit]);

  const goBack = useCallback(() => {
    setError(null);
    setIndex((previous) => Math.max(0, previous - 1));
  }, []);

  const start = useCallback(() => setStage("questions"), []);

  // Creators can turn the welcome screen off, in which case go straight to Q1.
  useEffect(() => {
    if (form && !form.welcome.show) {
      setStage((current) => (current === "welcome" ? "questions" : current));
    }
  }, [form]);

  // Enter starts the form from the welcome screen.
  useEffect(() => {
    if (stage !== "welcome") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        event.preventDefault();
        setStage("questions");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage]);

  const restart = useCallback(() => {
    answersRef.current = {};
    setAnswers({});
    setIndex(0);
    setError(null);
    setStage("questions");
  }, []);

  // Keyboard navigation: Enter / ArrowDown advance, ArrowUp goes back.
  useEffect(() => {
    if (stage !== "questions") return;

    function onKeyDown(event: KeyboardEvent) {
      // The textarea input handles its own Enter so Shift+Enter can insert newlines.
      const inTextarea = (event.target as HTMLElement)?.tagName === "TEXTAREA";

      if (event.key === "Enter" && !event.shiftKey && !inTextarea) {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        goBack();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goBack, goNext, stage]);

  return {
    stage,
    index,
    current,
    questions,
    answers,
    error,
    isSubmitting,
    isLast,
    progress,
    setAnswer,
    goNext,
    goBack,
    start,
    restart,
  };
}
