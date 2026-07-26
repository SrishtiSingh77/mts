"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, Globe, Sparkles, X, Loader2 } from "lucide-react";
import { Form } from "@/types";

interface ShareModalProps {
  form: Form;
  isOpen: boolean;
  onClose: () => void;
  onTogglePublish: () => Promise<void>;
}

export default function ShareModal({
  form,
  isOpen,
  onClose,
  onTogglePublish,
}: ShareModalProps) {
  const [publishing, setPublishing] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPublishing(true);
      const timer = setTimeout(() => {
        setPublishing(false);
      }, 1000); // Publishing animation effect
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/f/${form.share_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-fade-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {publishing ? (
          /* Publishing Loading Animation State */
          <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            <h3 className="text-lg font-bold text-gray-900">Publishing your form...</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Generating your unique shareable link and preparing public respondent flow.
            </p>
          </div>
        ) : (
          /* Published / Share Screen State */
          <div className="p-8 space-y-6">
            {/* Header Badge */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-gray-900">{form.title}</h3>
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      form.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        form.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    <span className="capitalize">{form.status}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">Your form is ready to collect responses</p>
              </div>
            </div>

            {/* Shareable Link Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Shareable Public URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 bg-gray-50 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="bg-[#262627] hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions: Open link in new tab + Toggle Publish/Unpublish */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1.5"
              >
                <span>Test public form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onTogglePublish}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-colors ${
                  form.status === "published"
                    ? "border-amber-300 text-amber-800 hover:bg-amber-50"
                    : "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                {form.status === "published" ? "Unpublish Form" : "Publish Form"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
