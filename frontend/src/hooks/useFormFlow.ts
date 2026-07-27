"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ApiError,
  recordFormView,
  savePartialResponse,
  submitPublicResponse,
} from "@/lib/api";
import { JUMP_TO_ENDING, resolveNextQuestionId } from "@/lib/logic";
import { validateAnswer } from "@/lib/validation";
import { Form, Question } from "@/types";

type Stage = "welcome" | "questions" | "ending";

interface UseFormFlowOptions {
  form: Form | null;
  onError: (message: string) => void;
  /** Creator preview: validate and advance as usual, but never persist. */
  preview?: boolean;
}

/** Owns the one-question-at-a-time state machine: position, answers, validation, submit. */
export function useFormFlow({ form, onError, preview }: UseFormFlowOptions) {
  const questions = useMemo<Question[]>(() => form?.questions ?? [], [form]);

  const [stage, setStage] = useState<Stage>("welcome");
  // Ids of the questions visited so far; the last one is on screen. Branching
  // means "back" is wherever the respondent came from, not index - 1.
  const [visited, setVisited] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Choice inputs auto-advance on a timer, so the advance handler must not read a
  // stale answers closure — it reads this ref instead.
  const answersRef = useRef<Record<string, string>>({});

  // Partial-response tracking. The server issues the row id on first save and we
  // keep updating that same row, so an abandoned attempt is one row, not many.
  const responseIdRef = useRef<string | undefined>(undefined);
  const startedAtRef = useRef<string | undefined>(undefined);
  const viewRecordedRef = useRef(false);

  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const nextInOrder = useCallback(
    (questionId: string): string | null => {
      const at = questions.findIndex((q) => q.id === questionId);
      return at >= 0 && at + 1 < questions.length ? questions[at + 1].id : null;
    },
    [questions]
  );

  const currentId = visited.length ? visited[visited.length - 1] : (questions[0]?.id ?? null);
  const current = currentId ? (byId.get(currentId) ?? null) : null;
  const index = current ? questions.findIndex((q) => q.id === current.id) : 0;

  /** Whether answering this question ends the form on the current branch. */
  const isLast = useMemo(() => {
    if (!current) return true;
    const next = resolveNextQuestionId(
      current,
      answers[current.id] ?? "",
      nextInOrder(current.id)
    );
    return next === null || next === JUMP_TO_ENDING;
  }, [answers, current, nextInOrder]);

  // Branching makes the real path length unknown up front, so progress is based
  // on how far through the question list the current step sits.
  const progress = questions.length ? Math.round(((index + 1) / questions.length) * 100) : 0;

  const setAnswer = useCallback((questionId: string, value: string) => {
    answersRef.current = { ...answersRef.current, [questionId]: value };
    setAnswers(answersRef.current);
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!form) return;

    // A preview must not create a response, and a draft has no public endpoint.
    if (preview) {
      setStage("ending");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = questions.map((question) => ({
        question_id: question.id,
        value: answersRef.current[question.id] ?? "",
      }));
      await submitPublicResponse(
        form.share_id,
        payload,
        responseIdRef.current,
        startedAtRef.current
      );
      responseIdRef.current = undefined;
      setStage("ending");
    } catch (caught) {
      if (caught instanceof ApiError && caught.fieldErrors.length) {
        // Jump back to the first question the server rejected.
        const first = caught.fieldErrors[0];
        // Walk back to the rejected question, keeping the path that led there.
        if (byId.has(first.question_id)) {
          setVisited((stack) => {
            const at = stack.indexOf(first.question_id);
            return at >= 0 ? stack.slice(0, at + 1) : [...stack, first.question_id];
          });
        }
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
  }, [byId, form, onError, preview, questions]);

  /** Snapshot progress so an abandoned attempt still shows up in Insights. */
  const saveProgress = useCallback(
    (parkedOnQuestionId: string) => {
      if (!form || preview) return;
      const answered = questions
        .map((question) => ({
          question_id: question.id,
          value: answersRef.current[question.id] ?? "",
        }))
        .filter((entry) => entry.value !== "");

      savePartialResponse(form.share_id, answered, responseIdRef.current, parkedOnQuestionId)
        .then(({ response_id }) => {
          responseIdRef.current = response_id;
        })
        // Progress saving is best-effort; never interrupt the respondent.
        .catch(() => undefined);
    },
    [form, preview, questions]
  );

  const goNext = useCallback(() => {
    const question = currentId ? byId.get(currentId) : questions[0];
    if (!question) return;

    const validationError = validateAnswer(question, answersRef.current[question.id] ?? "");
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    const nextId = resolveNextQuestionId(
      question,
      answersRef.current[question.id] ?? "",
      nextInOrder(question.id)
    );

    if (!nextId || nextId === JUMP_TO_ENDING || !byId.has(nextId)) {
      void submit();
      return;
    }

    setVisited((stack) => (stack.length ? [...stack, nextId] : [question.id, nextId]));
    saveProgress(nextId);
  }, [byId, nextInOrder, questions, saveProgress, submit]);

  const goBack = useCallback(() => {
    setError(null);
    setVisited((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }, []);

  const start = useCallback(() => {
    startedAtRef.current = new Date().toISOString();
    setVisited(questions.length ? [questions[0].id] : []);
    setStage("questions");
  }, [questions]);

  // Count one view per public load, before the respondent commits to anything.
  useEffect(() => {
    if (!form || preview || viewRecordedRef.current) return;
    viewRecordedRef.current = true;
    void recordFormView(form.share_id);
  }, [form, preview]);

  // Creators can turn the welcome screen off, in which case go straight to Q1.
  useEffect(() => {
    if (form && !form.welcome.show) {
      setStage((current) => {
        if (current !== "welcome") return current;
        startedAtRef.current = new Date().toISOString();
        setVisited(questions.length ? [questions[0].id] : []);
        return "questions";
      });
    }
  }, [form, questions]);

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
    responseIdRef.current = undefined;
    startedAtRef.current = new Date().toISOString();
    answersRef.current = {};
    setAnswers({});
    setVisited(questions.length ? [questions[0].id] : []);
    setError(null);
    setStage("questions");
  }, [questions]);

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
    canGoBack: visited.length > 1,
    progress,
    setAnswer,
    goNext,
    goBack,
    start,
    restart,
  };
}
