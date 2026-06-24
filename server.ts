import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Middleware
app.use(express.json({ limit: "50mb" }));

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "teacher" | "student";
}

interface Class {
  id: string;
  name: string;
  section: string;
  semester: string;
  teacherId: string;
}

interface StudentClass {
  studentId: string;
  classId: string;
}

interface Invitation {
  id: string; // STU-XXXXXX
  email: string;
  classId: string;
  status: "pending" | "registered";
}

interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  deadline: string;
  attachmentName: string | null;
  attachmentData: string | null;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  fileName: string;
  fileContent: string | null;
  status: "submitted" | "checked";
  marks: string | null;
  feedback: string | null;
}

interface DbState {
  users: User[];
  classes: Class[];
  students_classes: StudentClass[];
  invitations: Invitation[];
  assignments: Assignment[];
  submissions: Submission[];
}

const defaultState: DbState = {
  users: [
    { id: "t1", name: "Ravi Sharma", email: "ravi@gmail.com", password: "password123", role: "teacher" },
    { id: "s1", name: "Rahul Kumar", email: "rahul@gmail.com", password: "password123", role: "student" },
    { id: "s3", name: "Neha Sharma", email: "neha@gmail.com", password: "password123", role: "student" }
  ],
  classes: [
    { id: "c1", name: "BCA 2nd Year", section: "A", semester: "4", teacherId: "t1" }
  ],
  students_classes: [
    { studentId: "s1", classId: "c1" },
    { studentId: "s3", classId: "c1" }
  ],
  invitations: [
    { id: "STU-845632", email: "rahul@gmail.com", classId: "c1", status: "registered" },
    { id: "STU-123456", email: "aman@gmail.com", classId: "c1", status: "pending" },
    { id: "STU-999888", email: "neha@gmail.com", classId: "c1", status: "registered" }
  ],
  assignments: [
    {
      id: "a1",
      classId: "c1",
      title: "React Login Page",
      description: "Create a clean React login and signup page matching ClassDesk's Figma specifications. Make sure to use Tailwind CSS.",
      deadline: "30 June",
      attachmentName: "figma_guidelines.pdf",
      attachmentData: "Placeholder PDF Guide Content"
    }
  ],
  submissions: [
    {
      id: "sub1",
      assignmentId: "a1",
      studentId: "s1",
      submittedAt: "2026-06-23T10:00:00Z",
      fileName: "react_login_assignment.pdf",
      fileContent: "Rahul's react login page solution submission content.",
      status: "checked",
      marks: "9/10",
      feedback: "Very Good Work. Need Better UI."
    },
    {
      id: "sub2",
      assignmentId: "a1",
      studentId: "s3",
      submittedAt: "2026-06-23T11:30:00Z",
      fileName: "neha_react_submission.pdf",
      fileContent: "Neha's react login page solution submission content.",
      status: "submitted",
      marks: null,
      feedback: null
    }
  ]
};

// Helper database read/write
function readDb(): DbState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    } else {
      writeDb(defaultState);
      return defaultState;
    }
  } catch (error) {
    console.error("Error reading db:", error);
    return defaultState;
  }
}

function writeDb(state: DbState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing db:", error);
  }
}

// Generate ID helper
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Auth API Endpoints
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, invitationCode } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields (name, email, password, role) are required" });
  }

  const db = readDb();
  
  // Check if email already registered
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  if (role === "student") {
    if (!invitationCode) {
      return res.status(400).json({ error: "Invitation code is required for student registration" });
    }

    // Verify invitation code and email
    const invitationIndex = db.invitations.findIndex(
      inv => inv.id === invitationCode && inv.email.toLowerCase() === email.toLowerCase()
    );

    if (invitationIndex === -1) {
      return res.status(400).json({ error: "Invalid email or invitation code match. Please check with your teacher." });
    }

    const invitation = db.invitations[invitationIndex];

    // Create user
    const newUser: User = {
      id: generateId(),
      name,
      email: email.toLowerCase(),
      password,
      role: "student"
    };

    db.users.push(newUser);

    // Update invitation status
    invitation.status = "registered";

    // Auto add to class
    db.students_classes.push({
      studentId: newUser.id,
      classId: invitation.classId
    });

    writeDb(db);

    const { password: _, ...userWithoutPassword } = newUser;
    return res.json({ user: userWithoutPassword, message: "Registered successfully and added to class!" });
  } else {
    // Teacher registration
    const newUser: User = {
      id: generateId(),
      name,
      email: email.toLowerCase(),
      password,
      role: "teacher"
    };

    db.users.push(newUser);
    writeDb(db);

    const { password: _, ...userWithoutPassword } = newUser;
    return res.json({ user: userWithoutPassword, message: "Registered successfully as a teacher!" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword });
});

// Class Endpoints
app.post("/api/classes", (req, res) => {
  const { name, section, semester, teacherId } = req.body;

  if (!name || !section || !semester || !teacherId) {
    return res.status(400).json({ error: "Name, section, semester, and teacherId are required" });
  }

  const db = readDb();
  const newClass: Class = {
    id: "c-" + generateId(),
    name,
    section,
    semester,
    teacherId
  };

  db.classes.push(newClass);
  writeDb(db);

  return res.json(newClass);
});

app.get("/api/classes/teacher/:teacherId", (req, res) => {
  const { teacherId } = req.params;
  const db = readDb();
  const teacherClasses = db.classes.filter(c => c.teacherId === teacherId);
  return res.json(teacherClasses);
});

// Student and Invitation Endpoints
app.post("/api/classes/:classId/students", (req, res) => {
  const { classId } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Student Name and Email are required" });
  }

  const db = readDb();

  // Check if invitation already exists for this email in this class
  const existingInv = db.invitations.find(
    inv => inv.email.toLowerCase() === email.toLowerCase() && inv.classId === classId
  );

  if (existingInv) {
    return res.status(400).json({ error: "An invitation has already been sent to this student email." });
  }

  // Generate invitation code STU-XXXXXX where X is digit
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  const invitationCode = `STU-${digits}`;

  const newInvitation: Invitation = {
    id: invitationCode,
    email: email.toLowerCase(),
    classId,
    status: "pending"
  };

  db.invitations.push(newInvitation);

  // If a student with this email is already registered in the system, we can automatically add them as registered
  const registeredUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === "student");
  if (registeredUser) {
    newInvitation.status = "registered";
    // Check if already in student_classes
    const alreadyEnrolled = db.students_classes.some(
      sc => sc.studentId === registeredUser.id && sc.classId === classId
    );
    if (!alreadyEnrolled) {
      db.students_classes.push({
        studentId: registeredUser.id,
        classId
      });
    }
  }

  writeDb(db);

  return res.json({
    name,
    email: email.toLowerCase(),
    invitationCode,
    status: newInvitation.status
  });
});

app.get("/api/classes/:classId/students", (req, res) => {
  const { classId } = req.params;
  const db = readDb();

  // Find invitations for this class
  const classInvitations = db.invitations.filter(inv => inv.classId === classId);

  // Map each invitation to a student record (enrolled or pending)
  const studentsList = classInvitations.map(inv => {
    // Find registered user with this email
    const registeredUser = db.users.find(u => u.email.toLowerCase() === inv.email.toLowerCase() && u.role === "student");
    return {
      name: registeredUser ? registeredUser.name : inv.email.split("@")[0], // Fallback if pending
      email: inv.email,
      invitationCode: inv.id,
      status: inv.status === "registered" ? "Registered" : "Pending",
      studentId: registeredUser ? registeredUser.id : null
    };
  });

  return res.json(studentsList);
});

// Assignment Endpoints
app.post("/api/assignments", (req, res) => {
  const { classId, title, description, deadline, attachmentName, attachmentData } = req.body;

  if (!classId || !title || !description || !deadline) {
    return res.status(400).json({ error: "classId, title, description, and deadline are required" });
  }

  const db = readDb();
  const newAssignment: Assignment = {
    id: "a-" + generateId(),
    classId,
    title,
    description,
    deadline,
    attachmentName: attachmentName || null,
    attachmentData: attachmentData || null
  };

  db.assignments.push(newAssignment);
  writeDb(db);

  return res.json(newAssignment);
});

app.get("/api/classes/:classId/assignments", (req, res) => {
  const { classId } = req.params;
  const db = readDb();
  const classAssignments = db.assignments.filter(a => a.classId === classId);
  return res.json(classAssignments);
});

// Submissions Endpoints
app.post("/api/assignments/:assignmentId/submit", (req, res) => {
  const { assignmentId } = req.params;
  const { studentId, fileName, fileContent } = req.body;

  if (!studentId || !fileName) {
    return res.status(400).json({ error: "studentId and fileName are required" });
  }

  const db = readDb();

  // Check if already submitted
  const existingSubIndex = db.submissions.findIndex(
    sub => sub.assignmentId === assignmentId && sub.studentId === studentId
  );

  const newSubmission: Submission = {
    id: existingSubIndex !== -1 ? db.submissions[existingSubIndex].id : "sub-" + generateId(),
    assignmentId,
    studentId,
    submittedAt: new Date().toISOString(),
    fileName,
    fileContent: fileContent || "Sample content",
    status: "submitted",
    marks: existingSubIndex !== -1 ? db.submissions[existingSubIndex].marks : null,
    feedback: existingSubIndex !== -1 ? db.submissions[existingSubIndex].feedback : null
  };

  if (existingSubIndex !== -1) {
    db.submissions[existingSubIndex] = newSubmission;
  } else {
    db.submissions.push(newSubmission);
  }

  writeDb(db);
  return res.json(newSubmission);
});

app.get("/api/assignments/:assignmentId/submissions", (req, res) => {
  const { assignmentId } = req.params;
  const db = readDb();

  // Get assignment
  const assignment = db.assignments.find(a => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found" });
  }

  // Get class students
  const studentEnrollments = db.students_classes.filter(sc => sc.classId === assignment.classId);

  // Return submission status for ALL enrolled students
  const results = studentEnrollments.map(se => {
    const student = db.users.find(u => u.id === se.studentId);
    const submission = db.submissions.find(sub => sub.assignmentId === assignmentId && sub.studentId === se.studentId);

    return {
      studentId: se.studentId,
      studentName: student ? student.name : "Unknown",
      studentEmail: student ? student.email : "Unknown",
      submitted: !!submission,
      submittedAt: submission ? submission.submittedAt : null,
      fileName: submission ? submission.fileName : null,
      fileContent: submission ? submission.fileContent : null,
      status: submission ? submission.status : "pending",
      marks: submission ? submission.marks : null,
      feedback: submission ? submission.feedback : null,
      submissionId: submission ? submission.id : null
    };
  });

  return res.json(results);
});

app.post("/api/submissions/:submissionId/feedback", (req, res) => {
  const { submissionId } = req.params;
  const { marks, feedback } = req.body;

  if (!marks || !feedback) {
    return res.status(400).json({ error: "Marks and feedback are required" });
  }

  const db = readDb();
  const submissionIndex = db.submissions.findIndex(sub => sub.id === submissionId);

  if (submissionIndex === -1) {
    return res.status(404).json({ error: "Submission not found" });
  }

  db.submissions[submissionIndex].marks = marks;
  db.submissions[submissionIndex].feedback = feedback;
  db.submissions[submissionIndex].status = "checked";

  writeDb(db);

  return res.json(db.submissions[submissionIndex]);
});

// Student Dashboard API (Consolidated)
app.get("/api/student/:studentId/dashboard", (req, res) => {
  const { studentId } = req.params;
  const db = readDb();

  const student = db.users.find(u => u.id === studentId && u.role === "student");
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Find which classes this student is enrolled in
  const enrollments = db.students_classes.filter(sc => sc.studentId === studentId);
  
  const dashboardClasses = enrollments.map(se => {
    const cls = db.classes.find(c => c.id === se.classId);
    if (!cls) return null;

    const teacher = db.users.find(u => u.id === cls.teacherId);

    // Get assignments for this class
    const assignmentsList = db.assignments.filter(a => a.classId === cls.id);

    // Attach submission status for each assignment
    const assignmentsWithStatus = assignmentsList.map(a => {
      const submission = db.submissions.find(sub => sub.assignmentId === a.id && sub.studentId === studentId);
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        deadline: a.deadline,
        attachmentName: a.attachmentName,
        status: submission ? (submission.status === "checked" ? "checked" : "submitted") : "pending",
        fileName: submission ? submission.fileName : null,
        submittedAt: submission ? submission.submittedAt : null,
        marks: submission ? submission.marks : null,
        feedback: submission ? submission.feedback : null,
        submissionId: submission ? submission.id : null
      };
    });

    return {
      classId: cls.id,
      className: cls.name,
      section: cls.section,
      semester: cls.semester,
      teacherName: teacher ? teacher.name : "Unknown Teacher",
      teacherEmail: teacher ? teacher.email : "",
      assignments: assignmentsWithStatus
    };
  }).filter(Boolean);

  return res.json({
    student: {
      id: student.id,
      name: student.name,
      email: student.email
    },
    classes: dashboardClasses
  });
});

// Create Express and Vite dynamic server bundle wrapper
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
