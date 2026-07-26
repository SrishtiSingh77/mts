import TypeformLogo from "@/components/TypeformLogo";

export default function LoadingScreen() {
  return (
    <div className="flex h-screen select-none flex-col items-center justify-center space-y-3 bg-[#fcfcfc]">
      <span className="text-xs font-medium text-gray-400">powered by</span>
      <div className="flex items-center space-x-2">
        <TypeformLogo className="h-4 w-5 text-gray-900" />
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Typeform</h2>
      </div>
      <div className="h-1 w-44 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full w-3/4 animate-pulse rounded-full bg-gray-900" />
      </div>
    </div>
  );
}
