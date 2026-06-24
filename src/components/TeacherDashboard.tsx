import React, { useState, useEffect } from "react";
import { User, Class, Student, Assignment, Submission } from "../types";
import { 
  Plus, Users, FileText, ClipboardCheck, BookOpen, LogOut, 
  PlusCircle, Calendar, Upload, CheckCircle, Clock, Trash, AlertCircle, Check, Award, MessageSquare 
} from "lucide-react";

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeClass, setActiveClass] = useState<Class | null>(null);
  const [activeTab, setActiveTab] = useState<"classes" | "assignments" | "students" | "submissions">("classes");
  
  // Loading & error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Class Creation Form
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");

  // Student Invitation Form
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [invitationSuccess, setInvitationSuccess] = useState<any>(null);

  // Student list
  const [students, setStudents] = useState<Student[]>([]);

  // Assignment upload Form
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDesc, setAssignmentDesc] = useState("");
  const [assignmentDeadline, setAssignmentDeadline] = useState("");
  const [attachmentName, setAttachmentName] = useState("");

  // Assignments List
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Submissions list
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Feedback form
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  // Fetch teacher classes
  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/classes/teacher/${user.id}`);
      if (!response.ok) throw new Error("Failed to load classes");
      const data = await response.json();
      setClasses(data);
      if (data.length > 0 && !activeClass) {
        setActiveClass(data[0]); // Select first class by default
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student lists for selected class
  const fetchStudents = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch assignments for selected class
  const fetchAssignments = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
        if (data.length > 0) {
          setSelectedAssignment(data[0]);
        } else {
          setSelectedAssignment(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch submissions for active assignment
  const fetchSubmissions = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user.id]);

  useEffect(() => {
    if (activeClass) {
      fetchStudents(activeClass.id);
      fetchAssignments(activeClass.id);
    }
  }, [activeClass]);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions(selectedAssignment.id);
    } else {
      setSubmissions([]);
    }
  }, [selectedAssignment]);

  // Create Class Handler
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !section || !semester) return;

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className, section, semester, teacherId: user.id })
      });

      if (!response.ok) throw new Error("Could not create class");
      
      const newCls = await response.json();
      setClasses([...classes, newCls]);
      setActiveClass(newCls);
      
      // Reset
      setClassName("");
      setSection("");
      setSemester("");
      setShowCreateClass(false);
      setActiveTab("classes");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add/Invite Student Handler
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass || !studentName || !studentEmail) return;

    try {
      const response = await fetch(`/api/classes/${activeClass.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: studentName, email: studentEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite student");
      }

      setInvitationSuccess(data);
      fetchStudents(activeClass.id);

      // Reset fields
      setStudentName("");
      setStudentEmail("");
      
      // Auto-hide success banner after 6s
      setTimeout(() => setInvitationSuccess(null), 8000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create Assignment Handler
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass || !assignmentTitle || !assignmentDesc || !assignmentDeadline) return;

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: activeClass.id,
          title: assignmentTitle,
          description: assignmentDesc,
          deadline: assignmentDeadline,
          attachmentName: attachmentName || null,
          attachmentData: attachmentName ? "Sample Mock Resource Content" : null
        })
      });

      if (!response.ok) throw new Error("Failed to create assignment");

      const newAssignment = await response.json();
      setAssignments([...assignments, newAssignment]);
      setSelectedAssignment(newAssignment);
      
      // Reset
      setAssignmentTitle("");
      setAssignmentDesc("");
      setAssignmentDeadline("");
      setAttachmentName("");
      setShowCreateAssignment(false);
      setActiveTab("assignments");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Grade/Feedback Submission Handler
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission || !marks || !feedback) return;

    try {
      const response = await fetch(`/api/submissions/${gradingSubmission.submissionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks, feedback })
      });

      if (!response.ok) throw new Error("Failed to submit marks");

      // Reload
      if (selectedAssignment) {
        fetchSubmissions(selectedAssignment.id);
      }
      
      setGradingSubmission(null);
      setMarks("");
      setFeedback("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading your teacher desk...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="border-b border-slate-100 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm shadow-slate-100/10">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center bg-slate-900 text-white p-1.5 rounded-lg shadow-sm">
            <BookOpen className="h-5 w-5" />
            <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 border border-slate-900">
              <Check className="h-2 w-2 text-white stroke-[4]" />
            </div>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">ClassDesk Teacher</span>
        </div>

        {/* Active Class Dropdown Selection */}
        <div className="flex items-center gap-4">
          {classes.length > 0 && activeClass && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl max-w-xs">
              <span className="text-xs text-slate-400 font-bold uppercase shrink-0">Class:</span>
              <select
                value={activeClass.id}
                onChange={(e) => {
                  const target = classes.find(c => c.id === e.target.value);
                  if (target) {
                    setActiveClass(target);
                    setSelectedAssignment(null);
                  }
                }}
                className="bg-transparent text-sm font-bold text-slate-800 outline-none pr-1 cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

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

      {/* Main Layout Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side Sidebar / Navigation Controls */}
        <aside className="lg:w-64 space-y-6 shrink-0">
          <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3 block mb-2">Teacher Workspace</span>
            
            <button
              onClick={() => { setActiveTab("classes"); setShowCreateClass(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "classes" && !showCreateClass
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              My Classes
            </button>

            <button
              onClick={() => { setActiveTab("assignments"); setShowCreateAssignment(false); }}
              disabled={classes.length === 0}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === "assignments" && !showCreateAssignment
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              Assignments
            </button>

            <button
              onClick={() => { setActiveTab("students"); setShowAddStudent(false); }}
              disabled={classes.length === 0}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === "students" && !showAddStudent
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4" />
              Students
            </button>

            <button
              onClick={() => setActiveTab("submissions")}
              disabled={classes.length === 0}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === "submissions"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              Submissions
            </button>
          </div>

          <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3 block">Quick Actions</span>
            <button
              onClick={() => { setShowCreateClass(true); setActiveTab("classes"); }}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-slate-600" />
              Create Class
            </button>
          </div>
        </aside>

        {/* Right Side Work area */}
        <main className="flex-1 space-y-6">

          {/* Create Class Section View */}
          {showCreateClass && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Create Class</h2>
                <p className="text-xs text-slate-400">Establish a new classroom space and specify academic semester attributes.</p>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Class Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA 2nd Year"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Section</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Semester</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateClass(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MY CLASSES TAB */}
          {activeTab === "classes" && !showCreateClass && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">My Classes</h2>
                  <p className="text-xs text-slate-400">Review, manage, and select your active academic classroom sessions.</p>
                </div>
                <button
                  onClick={() => setShowCreateClass(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Create Class
                </button>
              </div>

              {classes.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-base font-semibold text-slate-800">No classes created yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    To start posting assignments and inviting students, establish your first class namespace.
                  </p>
                  <button
                    onClick={() => setShowCreateClass(true)}
                    className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Create Class Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      onClick={() => setActiveClass(cls)}
                      className={`cursor-pointer p-6 rounded-2xl border transition-all relative overflow-hidden group ${
                        activeClass?.id === cls.id
                          ? "bg-white border-slate-950 ring-1 ring-slate-950 shadow-md"
                          : "bg-white border-slate-200/80 hover:border-slate-350 hover:shadow-sm"
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500 uppercase tracking-wide">
                            Semester {cls.semester}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 pt-1 group-hover:text-slate-950">{cls.name}</h3>
                          <p className="text-xs text-slate-400 font-medium">Section {cls.section}</p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                          <span className="text-xs text-slate-500 font-medium">Click to select active workspace</span>
                          {activeClass?.id === cls.id && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === "students" && activeClass && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Students & Invitations</h2>
                  <p className="text-xs text-slate-400">
                    Managing classroom list for <strong className="text-slate-600">{activeClass.name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowAddStudent(!showAddStudent)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Student
                </button>
              </div>

              {/* Add Student Form */}
              {showAddStudent && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
                  <div className="border-b border-slate-150 pb-3">
                    <h3 className="text-base font-bold text-slate-800">Add Student</h3>
                    <p className="text-xs text-slate-400">Add a student's record and auto-generate their exclusive enrollment security key.</p>
                  </div>

                  <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Student Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Kumar"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Student Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@gmail.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all"
                    >
                      Generate Invitation
                    </button>
                  </form>
                </div>
              )}

              {/* Invitation Success Banner */}
              {invitationSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 space-y-3 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Student Invitation Generated Successfully!</span>
                  </div>
                  <div className="text-sm space-y-1.5 bg-white/70 rounded-xl p-3.5 border border-emerald-100/50">
                    <p>Student Name: <strong className="text-slate-900">{invitationSuccess.name}</strong></p>
                    <p>Email: <strong className="text-slate-900">{invitationSuccess.email}</strong></p>
                    <p className="flex items-center gap-2">
                      Invitation Code: 
                      <span className="font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-xs">
                        {invitationSuccess.invitationCode}
                      </span>
                    </p>
                  </div>
                  <p className="text-[11px] text-emerald-600">
                    Give this Invitation Code to the student. When they sign up with their matching email, they'll auto-join your class!
                  </p>
                </div>
              )}

              {/* Students Grid/Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Roster Details ({students.length})</h3>
                </div>

                {students.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500">No students enrolled yet</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Add Student" above to invite students into this classroom.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                          <th className="py-3 px-6">Name</th>
                          <th className="py-3 px-6">Email Address</th>
                          <th className="py-3 px-6">Security Invitation Code</th>
                          <th className="py-3 px-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
                        {students.map((student, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-6 font-bold text-slate-900">{student.name}</td>
                            <td className="py-3.5 px-6 font-mono text-slate-600 text-xs">{student.email}</td>
                            <td className="py-3.5 px-6">
                              <span className="font-mono bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                {student.invitationCode}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              {student.status === "Registered" ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                  ● Enrolled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                  ● Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === "assignments" && activeClass && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Course Assignments</h2>
                  <p className="text-xs text-slate-400">
                    Upload and publish assignments for <strong className="text-slate-600">{activeClass.name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateAssignment(!showCreateAssignment)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </button>
              </div>

              {/* Create Assignment Form */}
              {showCreateAssignment && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
                  <div className="border-b border-slate-150 pb-3">
                    <h3 className="text-base font-bold text-slate-800">Create Assignment</h3>
                    <p className="text-xs text-slate-400">Publish guidelines and specify deadlines for your enrolled class.</p>
                  </div>

                  <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. React Login Page"
                        value={assignmentTitle}
                        onChange={(e) => setAssignmentTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Description</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe the homework details and rules..."
                        value={assignmentDesc}
                        onChange={(e) => setAssignmentDesc(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Deadline</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 30 June"
                          value={assignmentDeadline}
                          onChange={(e) => setAssignmentDeadline(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Attach Reference PDF (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. assignment_specifications.pdf"
                          value={attachmentName}
                          onChange={(e) => setAttachmentName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateAssignment(false)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        Publish Assignment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Assignments Listing */}
              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-base font-semibold text-slate-800">No Assignments Uploaded</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Publish homework details, reference guidelines, and cut-off deadlines.
                    </p>
                    <button
                      onClick={() => setShowCreateAssignment(true)}
                      className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Create Assignment
                    </button>
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500 uppercase tracking-wide">
                            HW {assignment.id}
                          </span>
                          <h4 className="text-lg font-bold text-slate-900">{assignment.title}</h4>
                        </div>
                        <p className="text-sm text-slate-500 max-w-xl leading-relaxed">{assignment.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            Deadline: <strong className="text-slate-600">{assignment.deadline}</strong>
                          </span>
                          {assignment.attachmentName && (
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Upload className="w-3.5 h-3.5" />
                              PDF Attachment: <span className="text-indigo-600 font-bold">{assignment.attachmentName}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setActiveTab("submissions");
                          }}
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all"
                        >
                          Check Submissions
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === "submissions" && activeClass && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Student Submissions</h2>
                  <p className="text-xs text-slate-400">
                    Review and grade submissions for Class: <strong className="text-slate-600">{activeClass.name}</strong>
                  </p>
                </div>

                {/* Assignment Select dropdown to toggle between submissions */}
                {assignments.length > 0 && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl max-w-xs shadow-sm">
                    <span className="text-xs text-slate-400 font-bold uppercase shrink-0">HW Item:</span>
                    <select
                      value={selectedAssignment?.id || ""}
                      onChange={(e) => {
                        const target = assignments.find(a => a.id === e.target.value);
                        if (target) setSelectedAssignment(target);
                      }}
                      className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      {assignments.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Submissions List Table */}
              {selectedAssignment ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Evaluating Assignment</span>
                      <h3 className="text-lg font-bold mt-1">{selectedAssignment.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">{selectedAssignment.description}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-center">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>Deadline: {selectedAssignment.deadline}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submissions roster</h4>
                      <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 border border-slate-150 rounded shadow-sm">
                        Total {submissions.length} students enrolled
                      </span>
                    </div>

                    {submissions.length === 0 ? (
                      <div className="p-12 text-center">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-500">No students are currently enrolled in this class.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                              <th className="py-3 px-6">Student</th>
                              <th className="py-3 px-6">Submitted File</th>
                              <th className="py-3 px-6">Status</th>
                              <th className="py-3 px-6">Grade Info</th>
                              <th className="py-3 px-6 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
                            {submissions.map((sub, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="font-bold text-slate-900">{sub.studentName}</div>
                                  <div className="text-xs text-slate-400">{sub.studentEmail}</div>
                                </td>
                                <td className="py-4 px-6">
                                  {sub.submitted ? (
                                    <div className="flex flex-col gap-1">
                                      <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 self-start">
                                        {sub.fileName}
                                      </span>
                                      {sub.submittedAt && (
                                        <span className="text-[10px] text-slate-400">
                                          At: {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">No attachments</span>
                                  )}
                                </td>
                                <td className="py-4 px-6">
                                  {sub.status === "checked" ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                      Checked ✅
                                    </span>
                                  ) : sub.submitted ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                      Submitted ✅
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                      Pending ❌
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-6">
                                  {sub.status === "checked" ? (
                                    <div className="space-y-0.5">
                                      <div className="text-sm font-extrabold text-slate-800">Score: <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{sub.marks}</span></div>
                                      <div className="text-xs text-slate-400 italic truncate max-w-[150px]" title={sub.feedback || ""}>
                                        "{sub.feedback}"
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">Not graded</span>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  {sub.submitted ? (
                                    <button
                                      onClick={() => {
                                        setGradingSubmission(sub);
                                        setMarks(sub.marks || "");
                                        setFeedback(sub.feedback || "");
                                      }}
                                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all"
                                    >
                                      {sub.status === "checked" ? "Edit Grade" : "Evaluate"}
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className="px-3.5 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold cursor-not-allowed"
                                    >
                                      No Work
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-base font-semibold text-slate-800">No Assignments Found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Create your first course assignment before reviewing work submissions.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Evaluate & Feedback Dialog PopUp */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Grade Student Submission</h3>
              <p className="text-xs text-slate-400">
                Evaluating <strong className="text-slate-600">{gradingSubmission.studentName}</strong>'s file submission:
              </p>
              <div className="mt-2 bg-slate-50 rounded-xl p-3 border border-slate-150 flex items-center justify-between text-xs font-mono text-slate-700">
                <span>{gradingSubmission.fileName}</span>
                <span className="text-[10px] text-slate-400 uppercase">Attached</span>
              </div>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Marks Awarded</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9/10"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-bold text-slate-800"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-400 font-bold">
                    Score
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">Use standard format like <strong className="text-slate-600">9/10</strong> or percentage grades.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Feedback Note</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Very Good Work. Need Better UI."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none font-medium text-slate-700"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Submit Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
