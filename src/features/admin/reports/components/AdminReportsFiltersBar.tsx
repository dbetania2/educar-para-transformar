"use client";

import { Group, Select } from "@mantine/core";

import {
  EDUCATIONAL_LEVEL_OPTIONS,
  SPORT_FILTER_OPTIONS,
  SPORT_GROUPING_OPTIONS,
  TRANSPORT_FILTER_OPTIONS,
} from "../constants";
import type {
  AdminReportsSummaryStats,
  ReportTabType,
  SportReportGroupingMode,
  StudentByCourseReportRow,
  StudentBySportReportRow,
  StudentBySubjectReportRow,
  StudentByTransportReportRow,
  TeacherByLevelReportRow,
} from "../types";
import { AdminReportPdfButton } from "./AdminReportPdfButton";

type SelectOption = { value: string; label: string };

type AdminReportsFiltersBarProps = {
  activeTab: ReportTabType;
  stats: AdminReportsSummaryStats;
  levelFilter: string;
  courseDivisionFilter: string;
  subjectFilter: string;
  sportFilter: string;
  sportGroupingMode: SportReportGroupingMode;
  transportFilter: string;
  courseDivisionOptions: SelectOption[];
  subjectOptions: SelectOption[];
  filteredStudentsByCourse: StudentByCourseReportRow[];
  filteredStudentsBySubject: StudentBySubjectReportRow[];
  filteredTeachersByLevel: TeacherByLevelReportRow[];
  filteredStudentsBySport: StudentBySportReportRow[];
  filteredStudentsByTransport: StudentByTransportReportRow[];
  onLevelFilterChange: (value: string) => void;
  onCourseDivisionFilterChange: (value: string) => void;
  onSubjectFilterChange: (value: string) => void;
  onSportFilterChange: (value: string) => void;
  onSportGroupingModeChange: (value: SportReportGroupingMode) => void;
  onTransportFilterChange: (value: string) => void;
};

export function AdminReportsFiltersBar({
  activeTab,
  stats,
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
  onLevelFilterChange,
  onCourseDivisionFilterChange,
  onSubjectFilterChange,
  onSportFilterChange,
  onSportGroupingModeChange,
  onTransportFilterChange,
}: AdminReportsFiltersBarProps) {
  return (
    <Group gap="md" align="flex-end" wrap="wrap">
      <Select
        label="Nivel Educativo"
        data={EDUCATIONAL_LEVEL_OPTIONS}
        value={levelFilter}
        onChange={(val) => {
          onLevelFilterChange(val ?? "all");
          onCourseDivisionFilterChange("all");
        }}
        w={200}
      />

      {activeTab === "students_by_course" || activeTab === "students_by_subject" ? (
        <Select
          label="Curso / División"
          data={courseDivisionOptions}
          value={courseDivisionFilter}
          onChange={(val) => onCourseDivisionFilterChange(val ?? "all")}
          searchable
          w={220}
        />
      ) : null}

      {activeTab === "students_by_subject" || activeTab === "teachers_by_level" ? (
        <Select
          label="Materia"
          data={subjectOptions}
          value={subjectFilter}
          onChange={(val) => onSubjectFilterChange(val ?? "all")}
          searchable
          w={220}
        />
      ) : null}

      {activeTab === "students_by_sport" ? (
        <>
          <Select
            label="Deporte"
            data={SPORT_FILTER_OPTIONS}
            value={sportFilter}
            onChange={(val) => onSportFilterChange(val ?? "all")}
            searchable
            w={200}
          />
          <Select
            label="Modo de Agrupación"
            data={SPORT_GROUPING_OPTIONS}
            value={sportGroupingMode}
            onChange={(val) =>
              onSportGroupingModeChange(
                (val as SportReportGroupingMode) ?? "by_sport_level_schedule_teacher",
              )
            }
            w={280}
          />
        </>
      ) : null}

      {activeTab === "students_by_transport" ? (
        <Select
          label="Recorrido de Micro"
          data={TRANSPORT_FILTER_OPTIONS}
          value={transportFilter}
          onChange={(val) => onTransportFilterChange(val ?? "all")}
          w={240}
        />
      ) : null}

      <AdminReportPdfButton
        activeTab={activeTab}
        stats={stats}
        levelFilter={levelFilter}
        sportGroupingMode={sportGroupingMode}
        studentsByCourse={filteredStudentsByCourse}
        studentsBySubject={filteredStudentsBySubject}
        teachersByLevel={filteredTeachersByLevel}
        studentsBySport={filteredStudentsBySport}
        studentsByTransport={filteredStudentsByTransport}
      />
    </Group>
  );
}

