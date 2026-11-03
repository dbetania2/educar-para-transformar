"use client";

import { useMemo, useState } from "react";
import { Alert, Stack, Tabs } from "@mantine/core";
import {
  IconAlertCircle,
  IconBallFootball,
  IconBook2,
  IconBus,
  IconUserCheck,
  IconUsersGroup,
} from "@tabler/icons-react";

import { AdminPageLoader, ResponsiveDataTable } from "@/components/molecules";
import { AdminListTemplate } from "@/components/templates/AdminListTemplate/AdminListTemplate";
import { REPORT_TAB_OPTIONS } from "./constants";
import {
  AdminReportDetailDrawer,
  type SelectedReportDetail,
} from "./components/AdminReportDetailDrawer";
import { AdminReportsFiltersBar } from "./components/AdminReportsFiltersBar";
import { AdminReportsStatsGrid } from "./components/AdminReportsStatsGrid";
import {
  getStudentByCourseColumns,
  getStudentBySportColumns,
  getStudentBySubjectColumns,
  getStudentByTransportColumns,
  getTeacherByLevelColumns,
} from "./components/reportTableColumns";
import type { ReportTabType } from "./types";
import { useAdminReports } from "./useAdminReports";

const adminReportsBreadcrumbs = [
  { label: "Admin", href: "/admin/usuarios" },
  { label: "Reportes" },
];

export default function AdminReportsFeature() {
  const [selectedDetail, setSelectedDetail] = useState<SelectedReportDetail>(null);

  const {
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
  } = useAdminReports();

  const studentByCourseColumns = useMemo(
    () => getStudentByCourseColumns(setSelectedDetail),
    [],
  );
  const studentBySubjectColumns = useMemo(() => getStudentBySubjectColumns(), []);
  const teacherByLevelColumns = useMemo(
    () => getTeacherByLevelColumns(setSelectedDetail),
    [],
  );
  const studentBySportColumns = useMemo(
    () => getStudentBySportColumns(sportGroupingMode),
    [sportGroupingMode],
  );
  const studentByTransportColumns = useMemo(() => getStudentByTransportColumns(), []);

  if (isLoading && stats.activeStudentsCount === 0 && stats.activeCoursesCount === 0) {
    return (
      <AdminPageLoader
        title="Cargando reportes"
        loadingLabel="Consolidando métricas y listados académicos..."
        breadcrumbs={adminReportsBreadcrumbs}
      />
    );
  }

  return (
    <>
      <AdminReportDetailDrawer
        detail={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />

      <AdminListTemplate
        title="Reportes Institucionales"
        description="Consultas analíticas de alumnos por curso, materia, deportes, transporte escolar y distribución docente."
        breadcrumbs={adminReportsBreadcrumbs}
        searchProps={{
          value: search,
          onChange: setSearch,
          placeholder:
            activeTab === "teachers_by_level"
              ? "Buscar por apellido del docente, legajo, especialidad o materia..."
              : "Buscar por apellido, legajo, DNI, curso, deporte o recorrido...",
        }}
        statsSlot={<AdminReportsStatsGrid stats={stats} />}
        filtersSlot={
          <AdminReportsFiltersBar
            activeTab={activeTab}
            stats={stats}
            levelFilter={levelFilter}
            courseDivisionFilter={courseDivisionFilter}
            subjectFilter={subjectFilter}
            sportFilter={sportFilter}
            sportGroupingMode={sportGroupingMode}
            transportFilter={transportFilter}
            courseDivisionOptions={courseDivisionOptions}
            subjectOptions={subjectOptions}
            filteredStudentsByCourse={filteredStudentsByCourse}
            filteredStudentsBySubject={filteredStudentsBySubject}
            filteredTeachersByLevel={filteredTeachersByLevel}
            filteredStudentsBySport={filteredStudentsBySport}
            filteredStudentsByTransport={filteredStudentsByTransport}
            onLevelFilterChange={setLevelFilter}
            onCourseDivisionFilterChange={setCourseDivisionFilter}
            onSubjectFilterChange={setSubjectFilter}
            onSportFilterChange={setSportFilter}
            onSportGroupingModeChange={setSportGroupingMode}
            onTransportFilterChange={setTransportFilter}
          />
        }
      >
        <Stack gap="md">
          <Tabs
            value={activeTab}
            onChange={(val) => handleTabChange((val as ReportTabType) ?? "students_by_course")}
            variant="pills"
            radius="md"
          >
            <Tabs.List mb="md">
              {REPORT_TAB_OPTIONS.map((tab) => (
                <Tabs.Tab
                  key={tab.value}
                  value={tab.value}
                  leftSection={
                    tab.value === "students_by_course" ? (
                      <IconUsersGroup size={16} />
                    ) : tab.value === "students_by_subject" ? (
                      <IconBook2 size={16} />
                    ) : tab.value === "teachers_by_level" ? (
                      <IconUserCheck size={16} />
                    ) : tab.value === "students_by_sport" ? (
                      <IconBallFootball size={16} />
                    ) : (
                      <IconBus size={16} />
                    )
                  }
                >
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          {loadError ? (
            <Alert
              color="red"
              icon={<IconAlertCircle size={18} />}
              title="No se pudieron cargar los reportes"
            >
              {loadError}
            </Alert>
          ) : null}

          {activeTab === "students_by_course" ? (
            <ResponsiveDataTable
              data={filteredStudentsByCourse}
              columns={studentByCourseColumns}
              rowKey={(row) => row.id}
              pageSize={25}
              emptyMessage="No existen alumnos registrados para el nivel o curso seleccionado."
              loading={isLoading}
            />
          ) : null}

          {activeTab === "students_by_subject" ? (
            <ResponsiveDataTable
              data={filteredStudentsBySubject}
              columns={studentBySubjectColumns}
              rowKey={(row) => row.id}
              pageSize={25}
              emptyMessage="No existen alumnos matriculados en la materia o nivel seleccionado."
              loading={isLoading}
            />
          ) : null}

          {activeTab === "teachers_by_level" ? (
            <ResponsiveDataTable
              data={filteredTeachersByLevel}
              columns={teacherByLevelColumns}
              rowKey={(row) => row.id}
              pageSize={25}
              emptyMessage="No existen docentes asignados para el nivel o especialidad seleccionada."
              loading={isLoading}
            />
          ) : null}

          {activeTab === "students_by_sport" ? (
            <ResponsiveDataTable
              data={filteredStudentsBySport}
              columns={studentBySportColumns}
              rowKey={(row) => row.id}
              pageSize={25}
              emptyMessage="No existen alumnos inscriptos en la disciplina deportiva seleccionada."
              loading={isLoading}
            />
          ) : null}

          {activeTab === "students_by_transport" ? (
            <ResponsiveDataTable
              data={filteredStudentsByTransport}
              columns={studentByTransportColumns}
              rowKey={(row) => row.id}
              pageSize={25}
              emptyMessage="No existen alumnos asignados al recorrido de transporte seleccionado."
              loading={isLoading}
            />
          ) : null}
        </Stack>
      </AdminListTemplate>
    </>
  );
}
