import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthCard from "./components/AuthCard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"landing" | "auth" | "dashboard">("landing");
  const [initialRole, setInitialRole] = useState<"teacher" | "student">("student");

  // Load user session on startup
  useEffect(() => {
    const cachedUser = localStorage.getItem("classdesk_user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
        setView("dashboard");
      } catch (e) {
        localStorage.removeItem("classdesk_user");
      }
    }
  }, []);

  const handleGetStarted = (role?: "teacher" | "student") => {
    if (role) {
      setInitialRole(role);
    } else {
      setInitialRole("student");
    }
    setView("auth");
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("classdesk_user", JSON.stringify(loggedInUser));
    setView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("classdesk_user");
    setView("landing");
  };

  const handleBackToLanding = () => {
    setView("landing");
  };

  // Render appropriate view
  if (view === "dashboard" && user) {
    if (user.role === "teacher") {
      return <TeacherDashboard user={user} onLogout={handleLogout} />;
    } else {
      return <StudentDashboard user={user} onLogout={handleLogout} />;
    }
  }

  if (view === "auth") {
    return (
      <AuthCard
        onLoginSuccess={handleLoginSuccess}
        initialRole={initialRole}
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  return <LandingPage onGetStarted={handleGetStarted} />;
}
