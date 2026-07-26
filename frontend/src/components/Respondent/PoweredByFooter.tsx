import TypeformLogo from "@/components/TypeformLogo";

export default function PoweredByFooter() {
  return (
    <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
      <span>Powered by</span>
      <TypeformLogo className="h-3 w-4 text-gray-900" />
      <span className="font-extrabold lowercase text-gray-900">Typeform</span>
    </span>
  );
}
