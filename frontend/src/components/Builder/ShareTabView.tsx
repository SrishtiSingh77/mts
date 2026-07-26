"use client";

import { useState } from "react";
import { Link2, Edit3, QrCode, Globe, Copy, Check, ExternalLink, Sparkles, Layout, Mail } from "lucide-react";
import { Form } from "@/types";

interface ShareTabViewProps {
  form: Form;
}

export default function ShareTabView({ form }: ShareTabViewProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/f/${form.share_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-gray-50/60 overflow-y-auto p-8 font-sans select-none">
      <div className="max-w-3xl mx-auto space-y-8 py-4">
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Choose how you'd like to share your form
          </h2>
          <p className="text-xs text-gray-500">
            Publish your link or embed your form directly into your site or emails.
          </p>
        </div>

        {/* Main Share Link Card matching Screenshot 3 */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-8 space-y-6">
          {/* Link Box */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="bg-[#262627] hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-2xs active:scale-95 flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Copy link</span>
                </>
              )}
            </button>

            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-700 font-mono focus:outline-none"
            />

            <button className="text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl px-3 py-2.5 flex items-center space-x-1 hover:bg-gray-50">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
              <QrCode className="w-4 h-4" />
            </button>
          </div>

          {/* Link Preview Section */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Link preview</span>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <span>Customize</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/40 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg shadow-2xs">
                {form.title.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-gray-900">{form.title}</h4>
                <p className="text-xs text-gray-500">
                  {form.description || "Turn data collection into an experience with FormFlow."}
                </p>
                <span className="text-[10px] text-gray-400 font-mono">formflow.app/f/{form.share_id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Embed Form Section matching Screenshot 3 */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Embed form</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* On your website card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 transition-all cursor-pointer shadow-2xs flex items-center space-x-4">
              <div className="w-20 h-16 rounded-xl bg-purple-200/80 flex items-center justify-center text-purple-700">
                <Layout className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">On your website</h4>
                <p className="text-[11px] text-gray-500">Popup, side tab, or full page embed</p>
              </div>
            </div>

            {/* In your email card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-all cursor-pointer shadow-2xs flex items-center space-x-4">
              <div className="w-20 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">In your email</h4>
                <p className="text-[11px] text-gray-500">Embed first question into newsletters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="text-center pt-2">
          <button className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs py-2.5 px-6 rounded-xl shadow-2xs transition-colors">
            Explore other ways to share
          </button>
        </div>
      </div>
    </div>
  );
}
