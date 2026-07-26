import Link from "next/link";

import TypeformLogo from "./TypeformLogo";

interface ErrorStateProps {
  /** Large muted label above the heading, e.g. a status code. */
  code?: string;
  title: string;
  description: string;
  /** Defaults to a link back to the form list. */
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}

/**
 * Shared full-page state for 404s and unreachable forms, so every dead end
 * looks like the product instead of bare red text.
 */
export default function ErrorState({
  code,
  title,
  description,
  action = { label: "Back to my forms", href: "/" },
  secondaryAction,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-screen flex-col bg-stage">
      <div className="flex flex-1 items-center px-6 sm:px-[12%]">
        <div className="animate-fade-in max-w-[620px]">
          {code && <p className="text-[15px] tracking-wide text-faint">{code}</p>}

          <h1 className="mt-2 text-[34px] leading-tight text-ink sm:text-[42px]">{title}</h1>
          <p className="mt-4 text-[18px] leading-relaxed text-muted">{description}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={action.href}
              className="rounded-md bg-ink px-6 py-3 text-[17px] font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              {action.label}
            </Link>

            {secondaryAction && (
              <Link
                href={secondaryAction.href}
                className="rounded-md border border-hair bg-white px-5 py-3 text-[17px] text-ink transition-colors hover:bg-panel"
              >
                {secondaryAction.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      <footer className="flex justify-end px-6 pb-6 sm:px-12">
        <span className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[13px] font-medium text-white">
          <span>Powered by</span>
          <TypeformLogo className="h-3 w-4 text-white" />
          <span className="font-bold">Typeform</span>
        </span>
      </footer>
    </div>
  );
}
