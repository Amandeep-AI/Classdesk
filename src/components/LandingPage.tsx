import { GraduationCap, FileText, BookOpen, CheckSquare } from "lucide-react";
import Logo from "./Logo";

interface LandingPageProps {
  onGetStarted: (initialRole?: "teacher" | "student") => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Logo />
        <button
          onClick={() => onGetStarted()}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Sign in
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 py-12 md:py-20 text-center">
        <div className="animate-fade-in space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight md:leading-none">
            Simple assignments for teachers & students
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Post assignments with deadlines. Students submit. Teachers give feedback and award marks.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onGetStarted()}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg shadow-slate-950/10 hover:shadow-slate-950/20 active:scale-[0.98] transition-all"
            >
              Get started
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-24">
          {/* Card 1: Teacher */}
          <div
            onClick={() => onGetStarted("teacher")}
            className="group cursor-pointer bg-white border border-slate-150/80 p-6 rounded-2xl text-left shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Teacher login</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Create assignments, track deadlines, invite students, and review submissions in a centralized workspace.
            </p>
          </div>

          {/* Card 2: Student */}
          <div
            onClick={() => onGetStarted("student")}
            className="group cursor-pointer bg-white border border-slate-150/80 p-6 rounded-2xl text-left shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Student login</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Register via invitation code, view active homework assignments, and easily submit papers before the deadline.
            </p>
          </div>

          {/* Card 3: Feedback */}
          <div
            onClick={() => onGetStarted()}
            className="group cursor-pointer bg-white border border-slate-150/80 p-6 rounded-2xl text-left shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-colors">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Feedback & awards</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Teachers leave marks out of ten and comprehensive notes. Students receive instant, helpful feedback upon grading.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        &copy; {new Date().getFullYear()} ClassDesk. Designed with clean minimal typography.
      </footer>
    </div>
  );
}
