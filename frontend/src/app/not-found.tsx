import ErrorState from "@/components/ErrorState";

export const metadata = {
  title: "Page not found — Typeform",
};

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="We couldn't find that page"
      description="The link may be broken, or the page may have been moved. Your forms and responses are unaffected."
      action={{ label: "Back to my forms", href: "/" }}
    />
  );
}
