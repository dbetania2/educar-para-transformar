import { NextResponse } from "next/server";

import { normalizeEmail } from "@/lib/academicProfiles";
import { ensureAdministrativeAccess } from "@/lib/auth/adminAccess";
import { listAllAuthUsers } from "@/lib/auth/authUsers";
import {
  collectExistingLegajos,
  generateLegajoFromSet,
  roleUsesLegajo,
} from "@/lib/auth/legajo";
import { getRoleFromUser, normalizeRole, type AppUserRole } from "@/lib/auth/roles";
import { validateStudentSports } from "@/lib/extracurricular";
import {
  buildInternalStudentEmail,
  enrollStudentInCourses,
  ensureProfileRole,
  ensureStudentRecord,
  ensureTeacherRecord,
  getProfileByAuthUserId,
  getProfileFullName,
  getProfilesByAuthUserIds,
  insertAuditLog,
  linkGuardianToStudentByDni,
  upsertProfile,
} from "@/lib/supabase/academicAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseSecretKey } from "@/lib/supabase/env";

import {
  ensureListedUserLegajo,
  getStudentDossierPayload,
  isValidPayload,
  syncManualStudentDossier,
} from "./userCreationHelpers";

async function hasAdministrativeUsers() {
  if (!supabaseSecretKey) {
    return {
      error: NextResponse.json(
        { error: "Falta configurar SUPABASE_SECRET_KEY para la gestión administrativa." },
        { status: 500 },
      ),
    };
  }

  const supabase = createAdminClient();

  try {
    // listUsers() sin paginar devuelve solo los primeros 50 usuarios: se listan todas las páginas.
    const users = await listAllAuthUsers(supabase);

    return {
      supabase,
      users,
      hasAdministrativeUser: users.some((user) => getRoleFromUser(user) === "administrativo"),
    };
  } catch (listError) {
    return {
      error: NextResponse.json(
        {
          error:
            listError instanceof Error
              ? listError.message
              : "No se pudo validar el estado administrativo.",
        },
        { status: 500 },
      ),
    };
  }
}

export async function GET() {
  const startedAt = performance.now();
  const access = await ensureAdministrativeAccess();
  if ("error" in access) return access.error;

  const adminState = await hasAdministrativeUsers();
  if ("error" in adminState) return adminState.error;
  const authListedAt = performance.now();

  const authUserIds = adminState.users.map((user) => user.id);
  const [profilesByAuthUserId, requestsResult] = await Promise.all([
    getProfilesByAuthUserIds(adminState.supabase, authUserIds),
    adminState.supabase
      .from("inscription_requests")
      .select("auth_user_id, resolved_auth_user_id, status, student_full_name, student_dni, email"),
  ]);

  if (requestsResult.error) {
    return NextResponse.json(
      { error: requestsResult.error.message ?? "No se pudo sincronizar el estado de solicitudes." },
      { status: 500 },
    );
  }

  const requestsByAuthUserId = new Map(
    (requestsResult.data ?? []).flatMap((request) => {
      const ids = [request.auth_user_id, request.resolved_auth_user_id].filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      );
      return ids.map((id) => [id, request] as const);
    }),
  );

  const existingLegajos = collectExistingLegajos(adminState.users);
  const users = await Promise.all(
    adminState.users
      .filter((user) => {
        const request = requestsByAuthUserId.get(user.id);
        return !request || request.status === "aprobada";
      })
      .map(async (user) => {
        const request = requestsByAuthUserId.get(user.id);
        const profile = profilesByAuthUserId.get(user.id) ?? null;
        const fullName =
          getProfileFullName(profile) ||
          request?.student_full_name ||
          (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
          "";
        const role = getRoleFromUser(user);
        const legajo = await ensureListedUserLegajo({
          supabase: adminState.supabase,
          user,
          profile,
          fullName,
          role,
          existingLegajos,
        });

        const isActive =
          profile?.is_active !== false &&
          user.user_metadata?.is_active !== false &&
          user.user_metadata?.status !== "inactivo";
        const status = isActive ? "activo" : "inactivo";

        const rawAuthEmail = user.email ?? "";
        const contactEmail =
          typeof user.user_metadata?.contact_email === "string" &&
          user.user_metadata.contact_email.trim().length > 0
            ? user.user_metadata.contact_email.trim()
            : request?.email ?? null;
        const displayEmail =
          rawAuthEmail.endsWith(".educar.test") && contactEmail ? contactEmail : rawAuthEmail;

        return {
          id: user.id,
          email: displayEmail,
          fullName,
          legajo,
          role,
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at,
          status,
          isActive,
        };
      }),
  );

  const finishedAt = performance.now();

  return NextResponse.json(
    { users },
    {
      headers: {
        // Visible en DevTools → Network → Timing para medir el costo real del listado.
        "Server-Timing": [
          `auth;desc="Auth listUsers";dur=${(authListedAt - startedAt).toFixed(1)}`,
          `total;desc="Total";dur=${(finishedAt - startedAt).toFixed(1)}`,
        ].join(", "),
      },
    },
  );
}

export async function POST(request: Request) {
  const access = await ensureAdministrativeAccess();
  if ("error" in access) return access.error;

  const adminState = await hasAdministrativeUsers();
  if ("error" in adminState) return adminState.error;

  const body = await request.json().catch(() => null);
  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Payload inválido para crear usuario." }, { status: 400 });
  }

  const role = normalizeRole(body.role) as AppUserRole;
  const email = normalizeEmail(body.email) ?? body.email.trim().toLowerCase();
  const fullName = body.fullName.trim();
  const dni = typeof body.dni === "string" ? body.dni.trim() : null;
  const needsLegajo = roleUsesLegajo(role);
  const legajo = needsLegajo
    ? generateLegajoFromSet(collectExistingLegajos(adminState.users), role)
    : null;
  const password = needsLegajo ? (dni as string) : (body.password as string);
  const studentDossier =
    role === "alumno" ? getStudentDossierPayload(body as Record<string, unknown>) : null;
  const authEmail = role === "alumno" && legajo ? buildInternalStudentEmail(legajo) : email;
  const sportsList =
    role === "alumno" && Array.isArray(body.sports)
      ? body.sports.filter((s): s is string => typeof s === "string")
      : [];

  if (role === "alumno" && sportsList.length > 0) {
    const sportsError = validateStudentSports(sportsList);
    if (sportsError) {
      return NextResponse.json({ error: sportsError }, { status: 400 });
    }
  }

  const transportRoute =
    role === "alumno" &&
    typeof body.transportRoute === "string" &&
    body.transportRoute.trim().length > 0
      ? body.transportRoute.trim()
      : "No Registrado";
  const diningService =
    role === "alumno" &&
    typeof body.diningService === "string" &&
    body.diningService.trim().length > 0
      ? body.diningService.trim()
      : "No Registrado";

    const { data, error } = await adminState.supabase.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    app_metadata: {
      role,
      ...(legajo ? { legajo } : {}),
    },
    user_metadata: {
      role,
      full_name: fullName,
      contact_email: email,
      ...(legajo ? { legajo } : {}),
      ...(role === "alumno"
        ? {
            sports: sportsList,
            transport_route: transportRoute,
            dining_service: diningService,
          }
        : {}),
    },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo crear el usuario." },
      { status: 500 },
    );
  }

  try {
    if (needsLegajo && dni) {
      const contactPhoneValue =
        typeof body.contactPhone === "string" && body.contactPhone.trim().length > 0
          ? body.contactPhone.trim()
          : (studentDossier?.contactPhone ?? null);
      const addressValue =
        typeof body.address === "string" && body.address.trim().length > 0
          ? body.address.trim()
          : null;
      const specialtyValue =
        typeof body.specialty === "string" && body.specialty.trim().length > 0
          ? body.specialty.trim()
          : null;

      const profile = await upsertProfile({
        supabase: adminState.supabase,
        authUserId: data.user.id,
        fullName,
        dni,
        email: authEmail,
        phone: contactPhoneValue,
        address: addressValue,
      });

      await ensureProfileRole({
        supabase: adminState.supabase,
        profileId: profile.id,
        roleCode: role,
      });

      if (role === "alumno") {
        await ensureStudentRecord({
          supabase: adminState.supabase,
          profileId: profile.id,
          studentCode: legajo as string,
        });

        if (studentDossier) {
          await syncManualStudentDossier({
            supabase: adminState.supabase,
            actorUserId: access.user.id,
            authUserId: data.user.id,
            studentProfileId: profile.id,
            studentFullName: fullName,
            studentDni: dni,
            email,
            studentLegajo: legajo as string,
            dossier: studentDossier,
          });
        }

        if (Array.isArray(body.courseIds) && body.courseIds.length > 0) {
          await enrollStudentInCourses({
            supabase: adminState.supabase,
            studentProfileId: profile.id,
            courseIds: body.courseIds.map((id) => Number(id)),
          });
        }
      }

      if (role === "docente") {
        await ensureTeacherRecord({
          supabase: adminState.supabase,
          profileId: profile.id,
          teacherCode: legajo as string,
          title: specialtyValue ?? "Docente General",
          hireDate: new Date().toISOString().slice(0, 10),
        });
      }

      if (role === "tutor" && typeof body.tutorStudentDni === "string") {
        const linkedStudent = await linkGuardianToStudentByDni({
          supabase: adminState.supabase,
          guardianProfileId: profile.id,
          studentDni: body.tutorStudentDni,
          relationshipType: "tutor",
          isPrimary: true,
        });

        await insertAuditLog({
          supabase: adminState.supabase,
          actorProfileId:
            (await getProfileByAuthUserId(adminState.supabase, access.user.id))?.id ?? null,
          entityName: "student_guardian",
          entityId: `${linkedStudent.id}:${profile.id}`,
          action: "guardian_link_created",
          newData: {
            student_profile_id: linkedStudent.id,
            guardian_profile_id: profile.id,
            relationship_type: "tutor",
          },
        });
      }
    }
  } catch (syncError) {
    await adminState.supabase.auth.admin.deleteUser(data.user.id);

    return NextResponse.json(
      {
        error:
          syncError instanceof Error
            ? syncError.message
            : "No se pudo completar el alta manual del usuario.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? authEmail,
      fullName,
      legajo,
      dni,
      role,
    },
  });
}
