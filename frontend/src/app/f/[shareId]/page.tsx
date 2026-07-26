"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronUp, ChevronDown, Check, AlertCircle, ArrowRight, Star } from "lucide-react";
import { Form, Question } from "@/types";
import { fetchFormByShareId, submitFormResponse } from "@/lib/api";

export default function PublicFormPage({ params }: { params: Promise<{ shareId: string }> }) {
  const resolvedParams = use(params);
  const shareId = resolvedParams.shareId;
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flow State
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function loadForm() {
      try {
        setLoading(true);
        const data = await fetchFormByShareId(shareId);
        setForm(data);
      } catch (err: any) {
        setError("Form not found or no longer available.");
      } finally {
        // Simulated smooth loading transition matching Screenshot 4
        setTimeout(() => setLoading(false), 800);
      }
    }
    loadForm();
  }, [shareId]);

  const questions = form?.questions || [];
  const currentQuestion = questions[currentIndex] || null;

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;
    const value = (answers[currentQuestion.id] || "").trim();

    // Required Check
    if (currentQuestion.is_required && !value) {
      setValidationError("Please answer this required question before continuing.");
      return false;
    }

    // Email Check
    if (value && currentQuestion.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setValidationError("Please enter a valid email address (e.g. name@example.com).");
        return false;
      }
    }

    // Number Check
    if (value && currentQuestion.type === "number") {
      if (isNaN(Number(value))) {
        setValidationError("Please enter a valid numeric value.");
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentQuestion()) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setValidationError(null);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    try {
      setIsSubmitting(true);
      const payload = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        value: val,
      }));
      await submitFormResponse(form.id, payload);
      setIsSubmitted(true);

      // Celebratory Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setValidationError("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isSubmitted || !hasStarted) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, answers, hasStarted, isSubmitted, questions]);

  /* Loading Screen matching Screenshot 4 */
  if (loading) {
    return (
      <div className="h-screen bg-[#fcfcfc] flex flex-col items-center justify-center font-sans select-none space-y-3">
        <span className="text-xs text-gray-400 font-medium">powered by</span>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">FormFlow</h2>
        <div className="w-44 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gray-900 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-bold text-gray-900">{error || "Form Not Found"}</h2>
        <p className="text-xs text-gray-500 max-w-sm">
          The requested link might be invalid or the creator has unpublished this form.
        </p>
      </div>
    );
  }

  // Welcome Screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col justify-between p-8 font-sans selection:bg-purple-200">
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
            {form.title.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-base text-gray-600 max-w-lg leading-relaxed">
              {form.description}
            </p>
          )}

          <button
            onClick={() => setHasStarted(true)}
            className="bg-[#262627] hover:bg-black text-white font-semibold text-base py-3.5 px-8 rounded-2xl shadow-lg transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
          >
            <span>Start Form</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-gray-400">Takes less than 2 minutes</p>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
            Powered by <span className="text-purple-600 font-extrabold">FormFlow</span>
          </span>
        </footer>
      </div>
    );
  }

  /* Thank You Screen matching Screenshot 5 */
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col justify-between p-8 font-sans">
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full border-2 border-gray-900 text-gray-900 flex items-center justify-center shadow-xs">
            <Check className="w-10 h-10 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Thanks for completing this form
            </h1>
            <p className="text-gray-600 text-sm font-medium">
              Now <span className="font-extrabold text-gray-900">create your own</span> — it's free, easy & beautiful
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="bg-[#262627] hover:bg-black text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Create a form
          </button>
        </div>

        <footer className="text-center py-4 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
            Powered by <span className="text-purple-600 font-extrabold">FormFlow</span>
          </span>
        </footer>
      </div>
    );
  }

  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col justify-between p-6 sm:p-12 font-sans select-none overflow-hidden">
      {/* Top Header Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Main Single Question Container */}
      <div className="flex-1 flex items-center justify-center max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full space-y-6"
            >
              {/* Question Title */}
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <span className="text-purple-600 font-bold text-xl sm:text-2xl pt-0.5">
                    {currentIndex + 1} →
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                    {currentQuestion.title}
                    {currentQuestion.is_required && (
                      <span className="text-red-500 ml-1 font-bold">*</span>
                    )}
                  </h2>
                </div>

                {/* Subtext Description */}
                {currentQuestion.description && (
                  <p className="text-sm text-gray-500 pl-8">{currentQuestion.description}</p>
                )}
              </div>

              {/* Validation Warning Alert */}
              {validationError && (
                <div className="ml-8 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Interactive Answers Input */}
              <div className="pl-8 pt-2">
                {currentQuestion.type === "short_text" && (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => {
                      setValidationError(null);
                      setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                    }}
                    className="w-full border-b-2 border-purple-600 bg-transparent py-2 text-xl text-gray-900 placeholder-gray-300 focus:outline-none"
                  />
                )}

                {currentQuestion.type === "long_text" && (
                  <textarea
                    autoFocus
                    rows={4}
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => {
                      setValidationError(null);
                      setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                    }}
                    className="w-full border-b-2 border-purple-600 bg-transparent py-2 text-lg text-gray-900 placeholder-gray-300 focus:outline-none resize-none"
                  />
                )}

                {currentQuestion.type === "email" && (
                  <input
                    type="email"
                    autoFocus
                    placeholder="name@example.com"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => {
                      setValidationError(null);
                      setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                    }}
                    className="w-full border-b-2 border-purple-600 bg-transparent py-2 text-xl text-gray-900 placeholder-gray-300 focus:outline-none"
                  />
                )}

                {currentQuestion.type === "number" && (
                  <input
                    type="number"
                    autoFocus
                    placeholder="0"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => {
                      setValidationError(null);
                      setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                    }}
                    className="w-full border-b-2 border-purple-600 bg-transparent py-2 text-xl text-gray-900 placeholder-gray-300 focus:outline-none"
                  />
                )}

                {currentQuestion.type === "multiple_choice" && (
                  <div className="space-y-2.5 max-w-md">
                    {currentQuestion.options?.map((opt, idx) => {
                      const isSelected = answers[currentQuestion.id] === opt.label;
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <button
                          key={opt.id || idx}
                          onClick={() => {
                            setValidationError(null);
                            setAnswers({ ...answers, [currentQuestion.id]: opt.label });
                          }}
                          className={`w-full text-left flex items-center justify-between border-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "border-purple-600 bg-purple-50 text-purple-950 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300 text-gray-800"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center ${
                                isSelected ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {letter}
                            </span>
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-purple-600 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === "dropdown" && (
                  <div className="max-w-md">
                    <select
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => {
                        setValidationError(null);
                        setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                      }}
                      className="w-full border-2 border-purple-600 rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-900 bg-white focus:outline-none shadow-xs"
                    >
                      <option value="">Select an option...</option>
                      {currentQuestion.options?.map((opt, idx) => (
                        <option key={opt.id || idx} value={opt.label}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {currentQuestion.type === "yes_no" && (
                  <div className="flex items-center space-x-4 max-w-xs">
                    {["Yes", "No"].map((val) => {
                      const isSelected = answers[currentQuestion.id] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => {
                            setValidationError(null);
                            setAnswers({ ...answers, [currentQuestion.id]: val });
                          }}
                          className={`flex-1 border-2 rounded-2xl py-3.5 px-6 font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                            isSelected
                              ? "border-purple-600 bg-purple-50 text-purple-950 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300 text-gray-800"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center ${
                              isSelected ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {val.charAt(0)}
                          </span>
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === "rating" && (
                  <div className="flex items-center space-x-3 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const currentVal = Number(answers[currentQuestion.id] || 0);
                      const isSelected = currentVal >= star;
                      return (
                        <button
                          key={star}
                          onClick={() => {
                            setValidationError(null);
                            setAnswers({ ...answers, [currentQuestion.id]: String(star) });
                          }}
                          className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-amber-400 bg-amber-50 text-amber-500 scale-105"
                              : "border-gray-200 bg-white text-gray-300 hover:border-amber-300"
                          }`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              isSelected ? "fill-amber-400 text-amber-400" : ""
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Submit / OK Action Button */}
                <div className="pt-8 flex items-center space-x-4">
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="bg-[#262627] hover:bg-black text-white font-bold text-base py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <span>
                      {currentIndex === questions.length - 1
                        ? isSubmitting
                          ? "Submitting..."
                          : "Submit ✓"
                        : "OK ✓"}
                    </span>
                  </button>

                  <span className="text-xs text-gray-400 hidden sm:inline">
                    press <span className="font-bold text-gray-600">Enter ↵</span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Footer & Navigation Controls */}
      <footer className="flex items-center justify-between pt-6 border-t border-gray-100 max-w-4xl mx-auto w-full">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Powered by <span className="text-purple-600 font-extrabold">FormFlow</span>
        </span>

        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-gray-500">
            {currentIndex + 1} of {questions.length}
          </span>

          <div className="flex items-center space-x-1 border border-gray-200 bg-white rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
