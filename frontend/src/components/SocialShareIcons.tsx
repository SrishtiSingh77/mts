/** Facebook / X / LinkedIn marks for the ending screen. Decorative in this build. */
export default function SocialShareIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`} aria-hidden="true">
      <span className="flex h-8 w-8 items-center justify-center rounded bg-[#1877f2] text-[17px] font-bold text-white">
        f
      </span>
      <span className="flex h-8 w-8 items-center justify-center rounded bg-ink text-[15px] font-bold text-white">
        𝕏
      </span>
      <span className="flex h-8 w-8 items-center justify-center rounded bg-[#0a66c2] text-[14px] font-bold text-white">
        in
      </span>
    </div>
  );
}
