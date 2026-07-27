"use client";

import { use, useEffect, useState } from "react";

import ErrorState from "@/components/ErrorState";
import LoadingScreen from "@/components/Respondent/LoadingScreen";
import RespondentExperience from "@/components/Respondent/RespondentExperience";
import { fetchFormByShareId } from "@/lib/api";
import { Form } from "@/types";

const MIN_SPLASH_MS = 600;

/** Public respondent entry point. Only resolves while the form is published. */
export default function PublicFormPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params);

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const startedAt = Date.now();
      try {
        const data = await fetchFormByShareId(shareId);
        if (!cancelled) setForm(data);
      } catch {
        if (!cancelled) setLoadError("This form isn't available");
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

  // tf-light-scope pins the colour tokens back to light: this flow renders the
  // creator's chosen form theme, not the viewer's dark preference.
  const wrap = (node: React.ReactNode) => <div className="tf-light-scope">{node}</div>;

  if (loading) return wrap(<LoadingScreen />);

  if (loadError || !form) {
    return wrap(
      <ErrorState
        title="This form isn't available"
        description="The link may be invalid, or the creator has unpublished it. If someone sent you this link, ask them to publish the form and share it again."
        action={{ label: "Create your own typeform", href: "/" }}
      />
    );
  }

  return wrap(<RespondentExperience form={form} />);
}
