import TypeformLogo from "@/components/TypeformLogo";

/** Matches Typeform's public splash: wordmark over a two-tone progress rule. */
export default function LoadingScreen() {
  return (
    <div className="flex h-screen select-none flex-col items-center justify-center bg-stage">
      <span className="text-[13px] text-muted">powered by</span>
      <div className="mt-0.5 flex items-center gap-1.5">
        <TypeformLogo className="h-4 w-5 text-ink" />
        <span className="text-[24px] font-bold tracking-tight text-ink">Typeform</span>
      </div>
      <div className="mt-3 flex h-[3px] w-[196px] overflow-hidden">
        <span className="h-full flex-1 bg-[#b9b9bf]" />
        <span className="h-full flex-1 bg-ink" />
      </div>
    </div>
  );
}
