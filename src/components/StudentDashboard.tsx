import React, { useState, useEffect } from "react";
import { User, StudentDashboardData, Assignment } from "../types";
import { 
  LogOut, BookOpen, Calendar, Clock, CheckCircle, GraduationCap,
  FileText, Upload, AlertCircle, Award, MessageSquare, Plus, Check 
} from "lucide-react";

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // File upload state
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/student/${user.id}/dashboard`);
      if (!response.ok) {
        throw new Error("Failed to load dashboard statistics");
      }
      const resData = await response.json();
      setData(resData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user.id]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      setFileContent(`Mock file content of ${file.name} - uploaded via Drag & Drop`);
    }
  };

  // Handle traditional input selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      setFileContent(`Mock content of standard attachment ${file.name}`);
    }
  };

  // Submit Assignment
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingAssignmentId || !fileName) return;

    try {
      const response = await fetch(`/api/assignments/${uploadingAssignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.id,
          fileName,
          fileContent: fileContent || "Sample student work PDF mockup."
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Submission failed");
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setUploadingAssignmentId(null);
        setFileName("");
        setFileContent("");
        fetchDashboard(); // reload data
      }, 1500);

    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading your student desk...</p>
      </div>
    );
  }

  const currentClass = data?.classes && data.classes.length > 0 ? data.classes[0] : null;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-100 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm shadow-slate-100/10">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center bg-slate-900 text-white p-1.5 rounded-lg shadow-sm">
            <BookOpen className="h-5 w-5" />
            <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 border border-slate-900">
              <Check className="h-2 w-2 text-white stroke-[4]" />
            </div>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">ClassDesk Student</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Welcome Block */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">ClassDesk Student Dashboard</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h2>
            <p className="text-sm text-slate-300 max-w-lg leading-relaxed pt-1">
              Check active assignments, deadlines, upload submissions, and review teacher feedback.
            </p>
          </div>
          {/* Background subtle graphics */}
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
            <GraduationCap className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Enrollment Info Card */}
        {currentClass ? (
          <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase">Classroom Directory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Teacher Info */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400">Teacher</span>
                <p className="text-base font-bold text-slate-800 mt-2">{currentClass.teacherName}</p>
                <p className="text-xs text-slate-500">{currentClass.teacherEmail}</p>
              </div>

              {/* Class Info */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400">Class & Section</span>
                <p className="text-base font-bold text-slate-800 mt-2">{currentClass.className}</p>
                <p className="text-xs text-slate-500">Section {currentClass.section}</p>
              </div>

              {/* Semester Info */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400">Semester</span>
                <p className="text-base font-bold text-slate-800 mt-2">Semester {currentClass.semester}</p>
                <p className="text-xs text-slate-500">Academic Year 2026</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950">No Enrolled Classes Found</h4>
              <p className="text-sm leading-relaxed text-amber-800">
                You are not registered in any active classes on this system yet. Please contact your instructor and obtain an Invitation Code (e.g. STU-XXXXXX) to gain class membership.
              </p>
            </div>
          </div>
        )}

        {/* Assignments Section */}
        {currentClass && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Assignments</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {currentClass.assignments.length} Total
              </span>
            </div>

            <div className="space-y-4">
              {currentClass.assignments.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-250 rounded-2xl p-10 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No homework assignments created yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Excellent! Take a break, you're all caught up.</p>
                </div>
              ) : (
                currentClass.assignments.map((assignment) => (
                  <div 
                    key={assignment.id} 
                    className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Assignment Details */}
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-slate-900">{assignment.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{assignment.description}</p>
                      </div>

                      {/* Right: Status Tag */}
                      <div className="shrink-0 flex items-center">
                        {assignment.status === "checked" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider">
                            Checked ✅
                          </span>
                        ) : assignment.status === "submitted" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-bold uppercase tracking-wider">
                            Submitted ✅
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold uppercase tracking-wider">
                            Not Submitted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta info row */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Deadline: <strong className="text-slate-700">{assignment.deadline}</strong></span>
                      </div>

                      {assignment.attachmentName && (
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>Resource: <span className="text-slate-600 font-mono hover:underline cursor-pointer">{assignment.attachmentName}</span></span>
                        </div>
                      )}
                    </div>

                    {/* Feedback and Marks Section */}
                    {assignment.status === "checked" && (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mt-2 space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-100/50 pb-2">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <span>Evaluation Score</span>
                          </div>
                          <span className="text-base font-extrabold text-emerald-900 bg-emerald-100/60 px-3 py-0.5 rounded-lg">
                            {assignment.marks}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Instructor Feedback
                          </span>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                            "{assignment.feedback}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    {assignment.status !== "checked" && (
                      <div className="flex justify-end pt-2">
                        {assignment.status === "submitted" ? (
                          <button
                            onClick={() => {
                              setUploadingAssignmentId(assignment.id);
                              setFileName(assignment.fileName || "updated_assignment.pdf");
                              setFileContent("");
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Re-upload submission
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setUploadingAssignmentId(assignment.id);
                              setFileName("");
                              setFileContent("");
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Assignment
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* File Upload Modal */}
      {uploadingAssignmentId && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">Upload assignment solution</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose a PDF or file to represent your solution submission for grading.
              </p>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              {/* Drag and Drop Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-50/50" 
                    : fileName 
                      ? "border-emerald-300 bg-emerald-50/10" 
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                }`}
              >
                {fileName ? (
                  <div className="space-y-2">
                    <FileText className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="text-sm font-semibold text-slate-800">{fileName}</p>
                    <button
                      type="button"
                      onClick={() => setFileName("")}
                      className="text-xs text-rose-500 hover:underline font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-medium text-slate-700">
                      Drag & drop your homework file here, or{" "}
                      <label className="text-indigo-600 hover:underline cursor-pointer">
                        browse
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-slate-400">PDF, Word Document up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Quick Preset Action to select 'assignment.pdf' directly as requested in prompt */}
              {!fileName && (
                <div className="text-center">
                  <span className="text-xs text-slate-400">Or use prompt mockup standard:</span>
                  <div className="mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFileName("assignment.pdf");
                        setFileContent("Sample React Login Page submission document");
                      }}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-all border border-slate-200 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      assignment.pdf
                    </button>
                  </div>
                </div>
              )}

              {/* Status Banner */}
              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Submitted Successfully! ✅</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  disabled={submitSuccess}
                  onClick={() => setUploadingAssignmentId(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!fileName || submitSuccess}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-medium rounded-xl text-sm transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
