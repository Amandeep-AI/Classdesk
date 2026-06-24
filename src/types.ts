export interface User {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "student";
}

export interface Class {
  id: string;
  name: string;
  section: string;
  semester: string;
  teacherId: string;
}

export interface Student {
  name: string;
  email: string;
  invitationCode: string;
  status: "Registered" | "Pending";
  studentId: string | null;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  deadline: string;
  attachmentName: string | null;
  status?: "pending" | "submitted" | "checked";
  fileName?: string | null;
  submittedAt?: string | null;
  marks?: string | null;
  feedback?: string | null;
  submissionId?: string | null;
}

export interface Submission {
  studentId: string;
  studentName: string;
  studentEmail: string;
  submitted: boolean;
  submittedAt: string | null;
  fileName: string | null;
  fileContent: string | null;
  status: "pending" | "submitted" | "checked";
  marks: string | null;
  feedback: string | null;
  submissionId: string | null;
}

export interface StudentDashboardData {
  student: User;
  classes: {
    classId: string;
    className: string;
    section: string;
    semester: string;
    teacherName: string;
    teacherEmail: string;
    assignments: Assignment[];
  }[];
}
