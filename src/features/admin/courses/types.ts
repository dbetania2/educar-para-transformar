export type CourseStatus = "activa" | "completada" | "pausada" | "cancelada";

export type AdminCourseOption = {
  value: string;
  label: string;
};

export type AdminCourseParticipant = {
  profileId: string;
  fullName: string;
  dni: string;
  email: string | null;
  code: string;
};

export type AdminCourse = {
  id: number;
  name: string;
  subjectName: string;
  academicTermName: string;
  academicTermYear: number;
  teacherProfileId: string | null;
  teacherName: string | null;
  studentCount: number;
  studentProfileIds: string[];
  classroom: string | null;
  scheduleSummary: string | null;
  commission: string | null;
  status: CourseStatus;
  createdAt: string;
};

export type CourseFormValues = {
  name: string;
  level: string;
  subjectName: string;
  academicTermName: string;
  academicTermYear: string;
  teacherProfileId: string;
  studentProfileIds: string[];
  classroom: string;
  scheduleSummary: string;
  commission: string;
  status: CourseStatus;
};


export type CoursesResponsePayload = {
  error?: string;
  courses?: AdminCourse[];
  teachers?: AdminCourseParticipant[];
  students?: AdminCourseParticipant[];
  subjects?: string[];
  academicTerms?: Array<{ name: string; year: number }>;
  classrooms?: string[];
  schedules?: string[];
};



export type CourseMutationResponsePayload = {
  error?: string;
  course?: AdminCourse;
};
