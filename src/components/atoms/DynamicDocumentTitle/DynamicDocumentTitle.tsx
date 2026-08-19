"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

const segmentTitleBySlug: Record<string, string> = {
  admin: "Admin",
  alumno: "Alumno",
  alumnos: "Alumnos",
  asistencias: "Asistencias",
  bitacora: "Bitácora",
  calificaciones: "Calificaciones",
  contacto: "Contacto",
  cursos: "Cursos",
  docente: "Docente",
  docentes: "Docentes",
  hijos: "Hijos",
  inicio: "Inicio",
  inscripcion: "Inscripción",
  legajos: "Legajos",
  materiales: "Materiales",
  mensajes: "Mensajes",
  noticias: "Noticias",
  notas: "Notas",
  nosotros: "Nosotros",
  "no-docente": "No docente",
  "no-docentes": "No docentes",
  pendientes: "Pendientes",
  perfil: "Perfil",
  reportes: "Reportes",
  solicitudes: "Solicitudes",
  tutor: "Tutor",
  tutores: "Tutores",
  usuarios: "Usuarios",
};

const detailTitleByParentSegment: Record<string, string> = {
  alumnos: "Alumno",
  cursos: "Curso",
  docentes: "Docente",
  hijos: "Hijo",
  materiales: "Material",
  noticias: "Noticia",
  "no-docentes": "No docente",
  tutores: "Tutor",
};

function toTitleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getKnownSegmentTitle(segment: string) {
  return segmentTitleBySlug[segment.toLowerCase()];
}

function getSegmentTitle(segment: string) {
  return getKnownSegmentTitle(segment) ?? toTitleCase(segment);
}

function getRouteTitle(pathname: string | null) {
  if (!pathname || pathname === "/") {
    return "Inicio";
  }

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  const lastSegment = segments.at(-1);
  if (!lastSegment) {
    return "Inicio";
  }

  const knownTitle = getKnownSegmentTitle(lastSegment);
  if (knownTitle) {
    return knownTitle;
  }

  const parentSegment = segments.at(-2)?.toLowerCase();
  if (parentSegment && detailTitleByParentSegment[parentSegment]) {
    return detailTitleByParentSegment[parentSegment];
  }

  return getSegmentTitle(lastSegment);
}

export function DynamicDocumentTitle() {
  const pathname = usePathname();
  const routeTitle = useMemo(() => getRouteTitle(pathname), [pathname]);

  useEffect(() => {
    document.title = routeTitle;
  }, [routeTitle]);

  return null;
}
