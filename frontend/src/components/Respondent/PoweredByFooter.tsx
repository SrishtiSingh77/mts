import TypeformLogo from "@/components/TypeformLogo";

/** The dark pill Typeform stamps on every public form. */
export default function PoweredByFooter() {
  return (
    <span className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[13px] font-medium text-white">
      <span>Powered by</span>
      <TypeformLogo className="h-3 w-4 text-white" />
      <span className="font-bold">Typeform</span>
    </span>
  );
}
