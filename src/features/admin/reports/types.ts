export type EducationalLevel = "Inicial" | "Primario" | "Secundario";

export type ReportTabType =
  | "students_by_course"
  | "students_by_subject"
  | "teachers_by_level"
  | "students_by_sport"
  | "students_by_transport";

export type SportReportGroupingMode =
  | "by_sport"
  | "by_sport_level"
  | "by_sport_level_schedule_teacher";

export type StudentByCourseReportRow = {
  id: string;
  studentProfileId: string;
  studentCode: string;
  lastName: string;
  firstName: string;
  fullName: string;
  dni: string;
  email: string | null;
  phone: string | null;
  level: EducationalLevel;
  courseDivision: string;
  enrolledSubjects: Array<{
    courseId: number;
    subjectName: string;
    teacherName: string;
    schedule: string | null;
  }>;
  sports: Array<{
    name: string;
    schedule: string;
    teacherName: string;
  }>;
  transportRoute: string;
  diningService: string;
  status: string;
};

export type StudentBySubjectReportRow = {
  id: string;
  courseId: number;
  level: EducationalLevel;
  courseDivision: string;
  subjectName: string;
  teacherName: string;
  teacherCode: string | null;
  scheduleSummary: string | null;
  classroom: string | null;
  studentProfileId: string;
  studentCode: string;
  lastName: string;
  firstName: string;
  fullName: string;
  dni: string;
  email: string | null;
};

export type TeacherCourseAssignmentItem = {
  courseId: number;
  courseName: string;
  subjectName: string;
  commission: string;
  scheduleSummary: string | null;
  classroom: string | null;
  studentCount: number;
};

export type TeacherByLevelReportRow = {
  id: string;
  teacherProfileId: string;
  teacherCode: string;
  lastName: string;
  firstName: string;
  fullName: string;
  dni: string;
  email: string | null;
  phone: string | null;
  specialty: string;
  level: EducationalLevel;
  subjects: string[];
  courses: TeacherCourseAssignmentItem[];
  totalStudents: number;
};

export type StudentBySportReportRow = {
  id: string;
  sportName: string;
  schedule: string;
  teacherName: string;
  level: EducationalLevel;
  courseDivision: string;
  studentProfileId: string;
  studentCode: string;
  lastName: string;
  firstName: string;
  fullName: string;
  dni: string;
};

export type StudentByTransportReportRow = {
  id: string;
  transportRoute: string;
  diningService: string;
  level: EducationalLevel;
  courseDivision: string;
  studentProfileId: string;
  studentCode: string;
  lastName: string;
  firstName: string;
  fullName: string;
  dni: string;
  phone: string | null;
  email: string | null;
};

export type AdminReportsSummaryStats = {
  activeStudentsCount: number;
  activeTeachersCount: number;
  activeCoursesCount: number;
  activeSubjectsCount: number;
};

export type AdminReportsPayload = {
  stats: AdminReportsSummaryStats;
  studentsByCourse: StudentByCourseReportRow[];
  studentsBySubject: StudentBySubjectReportRow[];
  teachersByLevel: TeacherByLevelReportRow[];
  studentsBySport: StudentBySportReportRow[];
  studentsByTransport: StudentByTransportReportRow[];
  filterOptions: {
    levels: EducationalLevel[];
    courseDivisions: string[];
    subjects: string[];
  };
};

