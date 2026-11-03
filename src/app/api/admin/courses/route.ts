import { NextResponse } from "next/server";

import { getAdminClientWithGuard } from "@/lib/auth/adminAccess";
import { getProfileByAuthUserId, insertAuditLog } from "@/lib/supabase/academicAdmin";
import {
  ensureAcademicTerm,
  ensureSubject,
  getCourses,
  isMissingRelationError,
  isValidPayload,
  normalizeOptionalText,
  normalizeRequiredText,
  parseYear,
  syncCourseEnrollmentsDiff,
  validateCourseScheduleConflicts,
  type CoursePayload,
} from "./courseHelpers";

export async function GET() {
  const access = await getAdminClientWithGuard();
  if ("error" in access) return access.error;

  try {
    return NextResponse.json(await getCourses(access.supabase));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron obtener los cursos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const access = await getAdminClientWithGuard();
  if ("error" in access) return access.error;

  const body = await request.json().catch(() => null);
  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Payload inválido para crear curso." }, { status: 400 });
  }

  const subjectName = normalizeRequiredText(body.subjectName) || normalizeRequiredText(body.name);
  const termName = normalizeRequiredText(body.academicTermName);
  const termYear = parseYear(body.academicTermYear) as number;
  const studentProfileIds = Array.from(new Set(body.studentProfileIds ?? []));
  const teacherProfileId = normalizeOptionalText(body.teacherProfileId);
  const classroom = normalizeOptionalText(body.classroom);
  const scheduleSummary = normalizeOptionalText(body.scheduleSummary);
  const status = body.status ?? "activa";

  try {
    const [subject, academicTerm] = await Promise.all([
      ensureSubject(access.supabase, subjectName),
      ensureAcademicTerm(access.supabase, termName, termYear),
    ]);

    await validateCourseScheduleConflicts({
      supabase: access.supabase,
      academicTermId: academicTerm.id,
      scheduleSummary,
      teacherProfileId,
      classroom,
      status,
    });

    const insertedCourse = await access.supabase
      .from("courses")
      .insert({
        subject_id: subject.id,
        academic_term_id: academicTerm.id,
        teacher_profile_id: teacherProfileId,
        name: normalizeRequiredText(body.name),
        commission: normalizeOptionalText(body.commission),
        classroom,
        schedule_summary: scheduleSummary,
        status,
      })
      .select("id")
      .single();

    if (insertedCourse.error) {
      throw new Error(insertedCourse.error.message ?? "No se pudo crear el curso.");
    }

    const courseId = Number(insertedCourse.data.id);

    if (teacherProfileId) {
      const teacherLink = await access.supabase
        .from("course_teachers")
        .insert({
          course_id: courseId,
          teacher_profile_id: teacherProfileId,
          role_in_course: "titular",
        });

      if (
        teacherLink.error &&
        teacherLink.error.code !== "23505" &&
        !isMissingRelationError(teacherLink.error)
      ) {
        throw new Error(teacherLink.error.message ?? "No se pudo asignar el docente al curso.");
      }
    }

    if (studentProfileIds.length > 0) {
      await syncCourseEnrollmentsDiff({
        supabase: access.supabase,
        courseId,
        studentProfileIds,
      });
    }

    const actorProfile = await getProfileByAuthUserId(access.supabase, access.user.id);
    await insertAuditLog({
      supabase: access.supabase,
      actorProfileId: actorProfile?.id ?? null,
      entityName: "courses",
      entityId: String(courseId),
      action: "course_created",
      newData: { teacherProfileId, studentProfileIds },
    });

    return NextResponse.json(await getCourses(access.supabase));
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el curso.";
    const statusCode = message.startsWith("Choque") ? 409 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function PATCH(request: Request) {
  const access = await getAdminClientWithGuard();
  if ("error" in access) return access.error;

  const body = await request.json().catch(() => null);
  const courseId =
    body && typeof body === "object" ? Number((body as Record<string, unknown>).id) : NaN;

  if (!Number.isInteger(courseId) || !isValidPayload(body)) {
    return NextResponse.json({ error: "Payload inválido para actualizar curso." }, { status: 400 });
  }

  const payload = body as CoursePayload;
  const subjectName =
    normalizeRequiredText(payload.subjectName) || normalizeRequiredText(payload.name);
  const termName = normalizeRequiredText(payload.academicTermName);
  const termYear = parseYear(payload.academicTermYear) as number;
  const studentProfileIds = Array.from(new Set(payload.studentProfileIds ?? []));
  const teacherProfileId = normalizeOptionalText(payload.teacherProfileId);
  const classroom = normalizeOptionalText(payload.classroom);
  const scheduleSummary = normalizeOptionalText(payload.scheduleSummary);
  const status = payload.status ?? "activa";

  try {
    const [subject, academicTerm] = await Promise.all([
      ensureSubject(access.supabase, subjectName),
      ensureAcademicTerm(access.supabase, termName, termYear),
    ]);

    await validateCourseScheduleConflicts({
      supabase: access.supabase,
      academicTermId: academicTerm.id,
      scheduleSummary,
      teacherProfileId,
      classroom,
      status,
      excludeCourseId: courseId,
    });

    const updateCourse = await access.supabase
      .from("courses")
      .update({
        subject_id: subject.id,
        academic_term_id: academicTerm.id,
        teacher_profile_id: teacherProfileId,
        name: normalizeRequiredText(payload.name),
        commission: normalizeOptionalText(payload.commission),
        classroom,
        schedule_summary: scheduleSummary,
        status,
      })
      .eq("id", courseId);

    if (updateCourse.error) {
      throw new Error(updateCourse.error.message ?? "No se pudo actualizar el curso.");
    }

    const deleteTeacherLinks = await access.supabase
      .from("course_teachers")
      .delete()
      .eq("course_id", courseId);

    if (deleteTeacherLinks.error && !isMissingRelationError(deleteTeacherLinks.error)) {
      throw new Error(
        deleteTeacherLinks.error.message ?? "No se pudo actualizar el docente del curso.",
      );
    }

    if (teacherProfileId) {
      const teacherLink = await access.supabase
        .from("course_teachers")
        .insert({
          course_id: courseId,
          teacher_profile_id: teacherProfileId,
          role_in_course: "titular",
        });

      if (
        teacherLink.error &&
        teacherLink.error.code !== "23505" &&
        !isMissingRelationError(teacherLink.error)
      ) {
        throw new Error(teacherLink.error.message ?? "No se pudo asignar el docente al curso.");
      }
    }

    await syncCourseEnrollmentsDiff({
      supabase: access.supabase,
      courseId,
      studentProfileIds,
    });

    const actorProfile = await getProfileByAuthUserId(access.supabase, access.user.id);
    await insertAuditLog({
      supabase: access.supabase,
      actorProfileId: actorProfile?.id ?? null,
      entityName: "courses",
      entityId: String(courseId),
      action: "course_updated",
      newData: { teacherProfileId, studentProfileIds },
    });

    return NextResponse.json(await getCourses(access.supabase));
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el curso.";
    const statusCode = message.startsWith("Choque") ? 409 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
