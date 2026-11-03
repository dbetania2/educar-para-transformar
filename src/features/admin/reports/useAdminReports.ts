import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AdminReportsPayload,
  AdminReportsSummaryStats,
  ReportTabType,
  SportReportGroupingMode,
  StudentByCourseReportRow,
  StudentBySportReportRow,
  StudentBySubjectReportRow,
  StudentByTransportReportRow,
  TeacherByLevelReportRow,
} from "./types";

const initialStats: AdminReportsSummaryStats = {
  activeStudentsCount: 0,
  activeTeachersCount: 0,
  activeCoursesCount: 0,
  activeSubjectsCount: 0,
};

export function useAdminReports() {
  const [activeTab, setActiveTab] = useState<ReportTabType>("students_by_course");
  const [stats, setStats] = useState<AdminReportsSummaryStats>(initialStats);
  const [studentsByCourse, setStudentsByCourse] = useState<StudentByCourseReportRow[]>([]);
  const [studentsBySubject, setStudentsBySubject] = useState<StudentBySubjectReportRow[]>([]);
  const [teachersByLevel, setTeachersByLevel] = useState<TeacherByLevelReportRow[]>([]);
  const [studentsBySport, setStudentsBySport] = useState<StudentBySportReportRow[]>([]);
  const [studentsByTransport, setStudentsByTransport] = useState<StudentByTransportReportRow[]>([]);
  const [courseDivisions, setCourseDivisions] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [courseDivisionFilter, setCourseDivisionFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [sportGroupingMode, setSportGroupingMode] =
    useState<SportReportGroupingMode>("by_sport_level_schedule_teacher");
  const [transportFilter, setTransportFilter] = useState<string>("all");

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/reports", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json().catch(() => null)) as
        | (AdminReportsPayload & { error?: string })
        | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? "No se pudieron cargar los reportes institucionales.");
      }

      setStats(payload.stats ?? initialStats);
      setStudentsByCourse(payload.studentsByCourse ?? []);
      setStudentsBySubject(payload.studentsBySubject ?? []);
      setTeachersByLevel(payload.teachersByLevel ?? []);
      setStudentsBySport(payload.studentsBySport ?? []);
      setStudentsByTransport(payload.studentsByTransport ?? []);
      setCourseDivisions(payload.filterOptions?.courseDivisions ?? []);
      setSubjects(payload.filterOptions?.subjects ?? []);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los reportes institucionales.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrapReports = async () => {
      try {
        const response = await fetch("/api/admin/reports", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json().catch(() => null)) as
          | (AdminReportsPayload & { error?: string })
          | null;

        if (cancelled) return;

        if (!response.ok || !payload) {
          throw new Error(payload?.error ?? "No se pudieron cargar los reportes institucionales.");
        }

        setStats(payload.stats ?? initialStats);
        setStudentsByCourse(payload.studentsByCourse ?? []);
        setStudentsBySubject(payload.studentsBySubject ?? []);
        setTeachersByLevel(payload.teachersByLevel ?? []);
        setStudentsBySport(payload.studentsBySport ?? []);
        setStudentsByTransport(payload.studentsByTransport ?? []);
        setCourseDivisions(payload.filterOptions?.courseDivisions ?? []);
        setSubjects(payload.filterOptions?.subjects ?? []);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los reportes institucionales.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapReports();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      void loadReports();
    };

    window.addEventListener("admin-reports-refresh", handleRefresh);
    return () => {
      window.removeEventListener("admin-reports-refresh", handleRefresh);
    };
  }, [loadReports]);

  const handleTabChange = useCallback((nextTab: ReportTabType) => {
    setActiveTab(nextTab);
    setCourseDivisionFilter("all");
    setSubjectFilter("all");
    setSportFilter("all");
    setTransportFilter("all");
  }, []);

  const courseDivisionOptions = useMemo(() => {
    const sourceDivisions =
      levelFilter === "all"
        ? courseDivisions
        : Array.from(
            new Set(
              studentsByCourse
                .filter((row) => row.level === levelFilter)
                .map((row) => row.courseDivision),
            ),
          );

    return [
      { value: "all", label: "Todos los cursos / divisiones" },
      ...sourceDivisions.map((div) => ({ value: div, label: div })),
    ];
  }, [courseDivisions, levelFilter, studentsByCourse]);

  const subjectOptions = useMemo(() => {
    const sourceSubjects =
      levelFilter === "all"
        ? subjects
        : Array.from(
            new Set(
              studentsBySubject
                .filter((row) => row.level === levelFilter)
                .map((row) => row.subjectName),
            ),
          );

    return [
      { value: "all", label: "Todas las materias" },
      ...sourceSubjects.map((sub) => ({ value: sub, label: sub })),
    ];
  }, [levelFilter, studentsBySubject, subjects]);

  const filteredStudentsByCourse = useMemo(() => {
    const query = search.trim().toLowerCase();

    return studentsByCourse.filter((row) => {
      if (levelFilter !== "all" && row.level !== levelFilter) return false;
      if (courseDivisionFilter !== "all" && row.courseDivision !== courseDivisionFilter) {
        return false;
      }

      if (!query) return true;

      return (
        row.fullName.toLowerCase().includes(query) ||
        row.studentCode.toLowerCase().includes(query) ||
        row.dni.toLowerCase().includes(query) ||
        row.courseDivision.toLowerCase().includes(query) ||
        (row.email ?? "").toLowerCase().includes(query)
      );
    });
  }, [courseDivisionFilter, levelFilter, search, studentsByCourse]);

  const filteredStudentsBySubject = useMemo(() => {
    const query = search.trim().toLowerCase();

    return studentsBySubject.filter((row) => {
      if (levelFilter !== "all" && row.level !== levelFilter) return false;
      if (subjectFilter !== "all" && row.subjectName !== subjectFilter) return false;
      if (courseDivisionFilter !== "all" && row.courseDivision !== courseDivisionFilter) {
        return false;
      }

      if (!query) return true;

      return (
        row.fullName.toLowerCase().includes(query) ||
        row.studentCode.toLowerCase().includes(query) ||
        row.subjectName.toLowerCase().includes(query) ||
        row.teacherName.toLowerCase().includes(query) ||
        row.courseDivision.toLowerCase().includes(query)
      );
    });
  }, [courseDivisionFilter, levelFilter, search, studentsBySubject, subjectFilter]);

  const filteredTeachersByLevel = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teachersByLevel.filter((row) => {
      if (levelFilter !== "all" && row.level !== levelFilter) return false;
      if (subjectFilter !== "all" && !row.subjects.includes(subjectFilter)) return false;

      if (!query) return true;

      return (
        row.fullName.toLowerCase().includes(query) ||
        row.teacherCode.toLowerCase().includes(query) ||
        row.specialty.toLowerCase().includes(query) ||
        row.dni.toLowerCase().includes(query) ||
        row.subjects.some((sub) => sub.toLowerCase().includes(query))
      );
    });
  }, [levelFilter, search, subjectFilter, teachersByLevel]);

  const filteredStudentsBySport = useMemo(() => {
    const query = search.trim().toLowerCase();

    return studentsBySport.filter((row) => {
      if (levelFilter !== "all" && row.level !== levelFilter) return false;
      if (sportFilter !== "all" && row.sportName !== sportFilter) return false;

      if (!query) return true;

      return (
        row.fullName.toLowerCase().includes(query) ||
        row.studentCode.toLowerCase().includes(query) ||
        row.sportName.toLowerCase().includes(query) ||
        row.teacherName.toLowerCase().includes(query) ||
        row.schedule.toLowerCase().includes(query)
      );
    });
  }, [levelFilter, search, sportFilter, studentsBySport]);

  const filteredStudentsByTransport = useMemo(() => {
    const query = search.trim().toLowerCase();

    return studentsByTransport.filter((row) => {
      if (levelFilter !== "all" && row.level !== levelFilter) return false;
      if (transportFilter !== "all" && row.transportRoute !== transportFilter) return false;

      if (!query) return true;

      return (
        row.fullName.toLowerCase().includes(query) ||
        row.studentCode.toLowerCase().includes(query) ||
        row.transportRoute.toLowerCase().includes(query) ||
        row.diningService.toLowerCase().includes(query) ||
        row.courseDivision.toLowerCase().includes(query)
      );
    });
  }, [levelFilter, search, studentsByTransport, transportFilter]);

  return {
    activeTab,
    stats,
    isLoading,
    loadError,
    search,
    levelFilter,
    courseDivisionFilter,
    subjectFilter,
    sportFilter,
    sportGroupingMode,
    transportFilter,
    courseDivisionOptions,
    subjectOptions,
    filteredStudentsByCourse,
    filteredStudentsBySubject,
    filteredTeachersByLevel,
    filteredStudentsBySport,
    filteredStudentsByTransport,
    setSearch,
    setLevelFilter,
    setCourseDivisionFilter,
    setSubjectFilter,
    setSportFilter,
    setSportGroupingMode,
    setTransportFilter,
    handleTabChange,
    loadReports,
  };
}

