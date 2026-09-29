import { useMemo } from "react";
import { SimpleGrid, Select, TextInput, MultiSelect, Stack } from "@mantine/core";
import { useAdminCourses } from "./useAdminCourses";
import { IconBook, IconClock, IconUsers } from "@tabler/icons-react";
import { AdminFormSection } from "@/components/templates/AdminFormDrawerTemplate/AdminFormDrawerTemplate";
import {
  SUBJECTS_BY_LEVEL,
  ACADEMIC_TERM_OPTIONS,
  CLASSROOM_OPTIONS,
  SCHEDULE_OPTIONS,
  LEVEL_OPTIONS,
  COMMISSION_OPTIONS,
  YEAR_OPTIONS,
  COURSE_STATUS_OPTIONS,
} from "./constants";

export function CourseForm({
  form,
  teacherOptions,
  studentOptions,
  dbSubjects = [],
  dbTerms = [],
  dbClassrooms = [],
  dbSchedules = [],
}: {
  form: ReturnType<typeof useAdminCourses>["form"];
  teacherOptions: Array<{ value: string; label: string }>;
  studentOptions: Array<{ value: string; label: string }>;
  dbSubjects?: string[];
  dbTerms?: Array<{ name: string; year: number }>;
  dbClassrooms?: string[];
  dbSchedules?: string[];
}) {
  const currentLevel = form.values.level || "Primario";
  const catalogSubjects = SUBJECTS_BY_LEVEL[currentLevel] || SUBJECTS_BY_LEVEL.Primario;

  const currentSubjects = useMemo(() => {
    const list = Array.from(new Set([...dbSubjects, ...catalogSubjects]));
    if (form.values.subjectName && !list.includes(form.values.subjectName)) {
      list.unshift(form.values.subjectName);
    }
    return list;
  }, [catalogSubjects, dbSubjects, form.values.subjectName]);

  const currentTermNames = useMemo(() => {
    const fromDb = dbTerms.map((t) => t.name);
    const list = Array.from(new Set([...fromDb, ...ACADEMIC_TERM_OPTIONS]));
    if (form.values.academicTermName && !list.includes(form.values.academicTermName)) {
      list.unshift(form.values.academicTermName);
    }
    return list;
  }, [dbTerms, form.values.academicTermName]);

  const currentClassrooms = useMemo(() => {
    const list = Array.from(new Set([...dbClassrooms, ...CLASSROOM_OPTIONS]));
    if (form.values.classroom && !list.includes(form.values.classroom)) {
      list.unshift(form.values.classroom);
    }
    return list;
  }, [dbClassrooms, form.values.classroom]);

  const currentSchedules = useMemo(() => {
    const list = Array.from(new Set([...dbSchedules, ...SCHEDULE_OPTIONS]));
    if (form.values.scheduleSummary && !list.includes(form.values.scheduleSummary)) {
      list.unshift(form.values.scheduleSummary);
    }
    return list;
  }, [dbSchedules, form.values.scheduleSummary]);

  const handleLevelChange = (value: string | null) => {
    const nextLevel = value || "Primario";
    const availableSubjects = Array.from(new Set([...dbSubjects, ...(SUBJECTS_BY_LEVEL[nextLevel] || [])]));
    const nextSubject = availableSubjects[0] || "Matemática";
    const commission = form.values.commission || "1° A";

    form.setFieldValue("level", nextLevel);
    form.setFieldValue("subjectName", nextSubject);
    form.setFieldValue("name", `${nextSubject} - ${commission}`);
  };

  const handleSubjectChange = (value: string | null) => {
    const nextSubject = value || "Matemática";
    const commission = form.values.commission || "1° A";

    form.setFieldValue("subjectName", nextSubject);
    form.setFieldValue("name", `${nextSubject} - ${commission}`);
  };

  const handleTermChange = (value: string | null) => {
    const termName = value || `Ciclo lectivo ${new Date().getFullYear()}`;
    form.setFieldValue("academicTermName", termName);
    const found = dbTerms.find((t) => t.name === termName);
    if (found) {
      form.setFieldValue("academicTermYear", String(found.year));
    }
  };

  const handleCommissionChange = (value: string | null) => {
    const nextCommission = value || "1° A";
    const subject = form.values.subjectName || "Matemática";

    form.setFieldValue("commission", nextCommission);
    form.setFieldValue("name", `${subject} - ${nextCommission}`);
  };

  return (
    <Stack gap={0}>
      <AdminFormSection title="INFORMACIÓN DEL CURSO" icon={<IconBook size={18} />}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Select
            label="Nivel Educativo"
            data={LEVEL_OPTIONS}
            required
            value={form.values.level}
            onChange={handleLevelChange}
          />

          <Select
            label="Materia"
            data={currentSubjects}
            required
            searchable
            value={form.values.subjectName || currentSubjects[0]}
            onChange={handleSubjectChange}
          />

          <Select
            label="Comisión / División"
            data={COMMISSION_OPTIONS}
            required
            value={form.values.commission || "1° A"}
            onChange={handleCommissionChange}
          />

          <TextInput
            label="Nombre asignado al curso"
            placeholder="Ej: Matemática - 1° A"
            required
            {...form.getInputProps("name")}
          />
        </SimpleGrid>
      </AdminFormSection>

      <AdminFormSection title="CONFIGURACIÓN ACADÉMICA" icon={<IconClock size={18} />}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Select
            label="Período Lectivo"
            data={currentTermNames}
            required
            searchable
            value={form.values.academicTermName}
            onChange={handleTermChange}
          />

          <Select
            label="Año Lectivo"
            data={YEAR_OPTIONS}
            required
            {...form.getInputProps("academicTermYear")}
          />

          <Select
            label="Aula Asignada"
            data={currentClassrooms}
            searchable
            {...form.getInputProps("classroom")}
          />

          <Select
            label="Grilla Horaria"
            data={currentSchedules}
            searchable
            {...form.getInputProps("scheduleSummary")}
          />

          <Select
            label="Estado del curso"
            data={COURSE_STATUS_OPTIONS}
            required
            {...form.getInputProps("status")}
          />
        </SimpleGrid>
      </AdminFormSection>

      <AdminFormSection title="PERSONAL Y ALUMNOS" icon={<IconUsers size={18} />}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
          <Select
            label="Docente titular a cargo"
            placeholder="Seleccionar docente del cuerpo académico"
            data={teacherOptions}
            searchable
            clearable
            nothingFoundMessage="No hay docentes cargados"
            {...form.getInputProps("teacherProfileId")}
          />
        </SimpleGrid>

        <MultiSelect
          label="Alumnos matriculados en la comisión"
          placeholder="Seleccionar estudiantes"
          data={studentOptions}
          searchable
          clearable
          hidePickedOptions
          nothingFoundMessage="No hay alumnos cargados"
          {...form.getInputProps("studentProfileIds")}
        />
      </AdminFormSection>
    </Stack>
  );
}
