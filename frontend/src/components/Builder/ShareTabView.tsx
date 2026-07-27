"use client";

import { AlertTriangle, Check, ChevronDown, Gem, Link2, Mail, Pencil, QrCode, SquareDashed } from "lucide-react";
import { useState } from "react";

import TypeformLogo from "@/components/TypeformLogo";
import { useToast } from "@/components/ToastProvider";
import { Form } from "@/types";

interface ShareTabViewProps {
  form: Form;
  onTogglePublish: () => void;
}

export default function ShareTabView({ form, onTogglePublish }: ShareTabViewProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const isPublished = form.status === "published";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/f/${form.share_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Shareable link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 select-none overflow-y-auto bg-stage px-6 py-9">
      <div className="mx-auto max-w-[800px]">
        <h2 className="text-center text-[30px] leading-snug text-ink">
          Choose how you&rsquo;d like to share your form
        </h2>

        {/* Publish state — the link only resolves while published */}
        <div
          className={`mt-7 flex items-center justify-between gap-4 rounded-xl border px-5 py-4 ${
            isPublished
              ? "border-[#a7d4c6] bg-[#f2faf7] dark:border-[#2f6b5c] dark:bg-[#12241f]"
              : "border-[#f0d9a8] bg-[#fffaf0] dark:border-[#6b5a2f] dark:bg-[#241f12]"
          }`}
        >
          <div className="flex items-start gap-3">
            {isPublished ? (
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#a37413] dark:text-[#d9b45f]" />
            )}
            <div>
              <p className="text-[15px] font-medium text-ink">
                {isPublished ? "Your form is live" : "Your form is a draft"}
              </p>
              <p className="mt-0.5 text-[14px] text-muted">
                {isPublished
                  ? "Anyone with the link can respond — no account needed."
                  : "The public link returns “not available” until you publish."}
              </p>
            </div>
          </div>

          <button
            onClick={onTogglePublish}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-[15px] font-medium text-white transition-colors active:scale-[0.99] ${
              isPublished
                ? "bg-chrome hover:bg-chrome-hover active:bg-chrome-pressed"
                : "bg-brand-green hover:bg-brand-green-hover active:bg-[#178770]"
            }`}
          >
            {isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>

        {/* Link card */}
        <div className="mt-5 rounded-xl border border-hair bg-surface p-7">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-chrome px-4 py-2.5 text-[15px] font-medium text-on-chrome transition-colors hover:bg-chrome-hover active:bg-chrome-pressed active:scale-[0.98]"
            >
              {copied ? <Check className="h-[18px] w-[18px]" /> : <Link2 className="h-[18px] w-[18px]" />}
              <span>{copied ? "Copied!" : "Copy link"}</span>
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-panel px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{publicUrl}</span>
              <button
                disabled
                title="Custom link slugs — coming soon"
                className="flex shrink-0 items-center gap-1.5 text-[15px] text-faint"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>

            <button
              disabled
              title="QR code — coming soon"
              aria-label="QR code"
              className="shrink-0 rounded-lg border border-hair p-2.5 text-faint"
            >
              <QrCode className="h-[18px] w-[18px]" />
            </button>
          </div>

          <div className="mt-6 border-t border-hair pt-5">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-ink">Link preview</span>
              <button
                disabled
                title="Coming soon"
                className="flex items-center gap-2 text-[15px] text-faint"
              >
                <span>Customize</span>
                <ChevronDown className="h-4 w-4" />
                <Gem className="h-4 w-4 text-[#a7d4c6]" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-4 rounded-lg border border-hair p-4">
              <span className="flex h-[76px] w-[128px] shrink-0 items-center justify-center rounded-md bg-panel">
                <TypeformLogo className="h-4 w-5 text-ink" />
                <span className="ml-1.5 text-[15px] font-bold text-ink">Typeform</span>
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-ink">{form.title}</p>
                <p className="mt-0.5 line-clamp-1 text-[14px] text-muted">
                  {form.description || "Turn data collection into an experience with Typeform."}
                </p>
                <p className="mt-0.5 text-[13px] text-faint">{origin.replace(/^https?:\/\//, "")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Embed options — visual placeholders */}
        <h3 className="mt-8 text-[15px] font-medium text-ink">Embed form</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "On your website", icon: SquareDashed, tint: "from-[#d9a8ea] to-[#c07fdb]" },
            { label: "In your email", icon: Mail, tint: "from-[#a8c8f0] to-[#7fa8e0]" },
          ].map(({ label, icon: Icon, tint }) => (
            <div
              key={label}
              title="Embedding — coming soon"
              className="flex cursor-not-allowed items-center gap-4 overflow-hidden rounded-xl border border-hair bg-surface"
            >
              <span
                className={`flex h-[104px] w-[180px] shrink-0 items-center justify-center bg-gradient-to-br ${tint} text-white`}
              >
                <Icon className="h-8 w-8" />
              </span>
              <span className="text-[15px] text-ink">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            disabled
            title="Coming soon"
            className="rounded-lg border border-hair bg-surface px-5 py-2.5 text-[15px] text-faint"
          >
            Explore other ways to share
          </button>
        </div>
      </div>
    </div>
  );
}
