import { useEffect, useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import type {
  AdminCourse,
  AdminCourseParticipant,
  CourseFormValues,
  CoursesResponsePayload,
} from "./types";

const currentYear = String(new Date().getFullYear());

const initialValues: CourseFormValues = {
  name: "",
  subjectName: "",
  academicTermName: `Ciclo lectivo ${currentYear}`,
  academicTermYear: currentYear,
  teacherProfileId: "",
  studentProfileIds: [],
  classroom: "",
  scheduleSummary: "",
  commission: "",
  status: "activa",
};

function mapCourseToForm(course: AdminCourse): CourseFormValues {
  return {
    name: course.name,
    subjectName: course.subjectName,
    academicTermName: course.academicTermName,
    academicTermYear: String(course.academicTermYear),
    teacherProfileId: course.teacherProfileId ?? "",
    studentProfileIds: course.studentProfileIds,
    classroom: course.classroom ?? "",
    scheduleSummary: course.scheduleSummary ?? "",
    commission: course.commission ?? "",
    status: course.status,
  };
}

function participantLabel(participant: AdminCourseParticipant) {
  const code = participant.code ? ` · ${participant.code}` : "";
  return `${participant.fullName}${code}`;
}

export function useAdminCourses() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [teachers, setTeachers] = useState<AdminCourseParticipant[]>([]);
  const [students, setStudents] = useState<AdminCourseParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);

  const form = useForm<CourseFormValues>({
    initialValues,
    validate: {
      name: (value) => value.trim().length >= 3 ? null : "Ingresá el nombre del curso.",
      subjectName: (value) => value.trim().length >= 3 ? null : "Ingresá la materia.",
      academicTermName: (value) => value.trim().length >= 3 ? null : "Ingresá el período.",
      academicTermYear: (value) => {
        const year = Number(value);
        return Number.isInteger(year) && year >= 2000 && year <= 2100 ? null : "Ingresá un año válido.";
      },
    },
  });

  const teacherOptions = useMemo(
    () => teachers.map((teacher) => ({ value: teacher.profileId, label: participantLabel(teacher) })),
    [teachers],
  );

  const studentOptions = useMemo(
    () => students.map((student) => ({ value: student.profileId, label: participantLabel(student) })),
    [students],
  );

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return courses;
    }

    return courses.filter((course) =>
      [course.name, course.subjectName, course.teacherName ?? "", course.academicTermName]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [courses, search]);

  const loadCourses = async (notifyOnError = true) => {
    setIsLoading(true);
    setLoadError(null);

    const response = await fetch("/api/admin/courses");
    const payload = (await response.json().catch(() => null)) as CoursesResponsePayload | null;

    if (!response.ok) {
      const message = payload?.error ?? "No se pudieron cargar los cursos.";
      setLoadError(message);
      setIsLoading(false);

      if (notifyOnError) {
        notifications.show({ title: "No se pudo cargar cursos", message, color: "red" });
      }

      return;
    }

    setCourses(payload?.courses ?? []);
    setTeachers(payload?.teachers ?? []);
    setStudents(payload?.students ?? []);
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setSelectedCourse(null);
    form.setValues(initialValues);
    form.resetDirty(initialValues);
    setCreateModalOpened(true);
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrapCourses = async () => {
      const response = await fetch("/api/admin/courses");
      const payload = (await response.json().catch(() => null)) as CoursesResponsePayload | null;

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        setLoadError(payload?.error ?? "No se pudieron cargar los cursos.");
        setIsLoading(false);
        return;
      }

      setCourses(payload?.courses ?? []);
      setTeachers(payload?.teachers ?? []);
      setStudents(payload?.students ?? []);
      setIsLoading(false);
    };

    void bootstrapCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleRefresh = () => void loadCourses();
    const handleCreate = () => openCreateModal();

    window.addEventListener("admin-courses-refresh", handleRefresh);
    window.addEventListener("admin-courses-create", handleCreate);

    return () => {
      window.removeEventListener("admin-courses-refresh", handleRefresh);
      window.removeEventListener("admin-courses-create", handleCreate);
    };
  });

  const openEditModal = (course: AdminCourse) => {
    const values = mapCourseToForm(course);
    setSelectedCourse(course);
    form.setValues(values);
    form.resetDirty(values);
    setEditModalOpened(true);
  };

  const closeModals = () => {
    setCreateModalOpened(false);
    setEditModalOpened(false);
    setSelectedCourse(null);
  };

  const saveCourse = async (values: CourseFormValues) => {
    setIsSaving(true);
    const isEditing = Boolean(selectedCourse);
    const response = await fetch("/api/admin/courses", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(selectedCourse ? { id: selectedCourse.id } : {}),
        ...values,
        academicTermYear: Number(values.academicTermYear),
        teacherProfileId: values.teacherProfileId || null,
      }),
    });
    const payload = (await response.json().catch(() => null)) as CoursesResponsePayload | null;

    if (!response.ok) {
      notifications.show({
        title: isEditing ? "No se pudo actualizar el curso" : "No se pudo crear el curso",
        message: payload?.error ?? "Revisá los datos e intentá nuevamente.",
        color: "red",
      });
      setIsSaving(false);
      return;
    }

    setCourses(payload?.courses ?? []);
    setTeachers(payload?.teachers ?? teachers);
    setStudents(payload?.students ?? students);
    closeModals();
    setIsSaving(false);
    notifications.show({
      title: isEditing ? "Curso actualizado" : "Curso creado",
      message: "Las asignaciones quedaron sincronizadas.",
      color: "green",
    });
  };

  return {
    courses,
    teachers,
    students,
    isLoading,
    isSaving,
    loadError,
    search,
    filteredCourses,
    createModalOpened,
    editModalOpened,
    selectedCourse,
    form,
    teacherOptions,
    studentOptions,
    setSearch,
    openCreateModal,
    openEditModal,
    closeModals,
    saveCourse,
    loadCourses,
  };
}
