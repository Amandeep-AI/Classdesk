import React, { useState } from "react";
import Logo from "./Logo";
import { User } from "../types";
import { AlertCircle, ChevronLeft } from "lucide-react";

interface AuthCardProps {
  onLoginSuccess: (user: User) => void;
  initialRole?: "teacher" | "student";
  onBackToLanding: () => void;
}

export default function AuthCard({ onLoginSuccess, initialRole = "student", onBackToLanding }: AuthCardProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"teacher" | "student">(initialRole);
  
  // Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Trigger login/signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isSignUp ? "/api/auth/register" : "/api/auth/login";
    const body: any = isSignUp 
      ? { name, email, password, role, invitationCode: role === "student" ? invitationCode : undefined }
      : { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred");
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Back to landing button */}
      <button 
        onClick={onBackToLanding}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Logo />

        <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100/50 p-8">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isSignUp
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                isSignUp
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Radio selection (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">I am a</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === "student"}
                      onChange={() => setRole("student")}
                      className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 accent-slate-900"
                    />
                    <span className="text-sm font-medium text-slate-800">Student</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={role === "teacher"}
                      onChange={() => setRole("teacher")}
                      className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 accent-slate-900"
                    />
                    <span className="text-sm font-medium text-slate-800">Teacher</span>
                  </label>
                </div>
              </div>
            )}

            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                required
                placeholder="e.g. rahul@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

            {/* Invitation Code (Sign Up + Student only) */}
            {isSignUp && role === "student" && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Invitation code</label>
                <input
                  type="text"
                  required
                  placeholder="STU-XXXXXX"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 tracking-wider uppercase font-mono transition-all"
                />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter the Invitation Code generated by your teacher (e.g. <span className="font-mono bg-slate-50 px-1 py-0.5 rounded">STU-123456</span>).
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-xl shadow-md transition-all duration-150 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isSignUp ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Quick Sandbox Help Credential Hint */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">Quick Login Accounts</span>
            <div className="flex flex-wrap gap-2 justify-center mt-2.5">
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setEmail("ravi@gmail.com");
                  setPassword("password123");
                  setError(null);
                }}
                className="text-[10px] bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md font-medium transition-colors"
              >
                Teacher: Ravi
              </button>
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setEmail("rahul@gmail.com");
                  setPassword("password123");
                  setError(null);
                }}
                className="text-[10px] bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md font-medium transition-colors"
              >
                Student: Rahul
              </button>
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setEmail("neha@gmail.com");
                  setPassword("password123");
                  setError(null);
                }}
                className="text-[10px] bg-amber-50/50 text-amber-700 hover:bg-amber-50 border border-amber-100 px-2 py-1 rounded-md font-medium transition-colors"
              >
                Student: Neha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
