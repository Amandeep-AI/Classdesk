import { BookOpen, Check } from "lucide-react";

export default function Logo({ className = "h-6 w-6 text-slate-900" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center bg-slate-900 text-white p-1.5 rounded-lg shadow-sm">
        <BookOpen className="h-5 w-5" />
        <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 border border-slate-900">
          <Check className="h-2 w-2 text-white stroke-[4]" />
        </div>
      </div>
      <span className="font-sans font-bold tracking-tight text-xl text-slate-900">ClassDesk</span>
    </div>
  );
}
