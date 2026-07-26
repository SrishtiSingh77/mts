"use client";

import { use, useEffect, useState } from "react";

import ErrorState from "@/components/ErrorState";
import LoadingScreen from "@/components/Respondent/LoadingScreen";
import RespondentExperience from "@/components/Respondent/RespondentExperience";
import { fetchForm } from "@/lib/api";
import { Form } from "@/types";

/**
 * Creator-side preview. Reads the form through the private endpoint, so a draft
 * previews fine while the public /f/[shareId] route stays gated on publish.
 */
export default function FormPreviewPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchForm(formId)
      .then((data) => !cancelled && setForm(data))
      .catch(() => !cancelled && setLoadError("This form could not be loaded."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [formId]);

  if (loading) return <LoadingScreen />;

  if (loadError || !form) {
    return (
      <ErrorState
        code="404"
        title="Nothing to preview"
        description="This form was deleted, or the link points at an id that no longer exists."
        action={{ label: "Back to my forms", href: "/" }}
      />
    );
  }

  if (!form.questions?.length) {
    return (
      <ErrorState
        title="This form has no questions yet"
        description="Add at least one question on the Content tab, then preview it again."
        action={{ label: "Back to the builder", href: `/builder/${form.id}` }}
      />
    );
  }

  return <RespondentExperience form={form} preview />;
}
