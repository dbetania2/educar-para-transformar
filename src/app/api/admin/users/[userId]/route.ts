import { NextResponse } from "next/server";

import { normalizeEmail } from "@/lib/academicProfiles";
import { ensureAdministrativeAccess } from "@/lib/auth/adminAccess";
import { getLegajoFromUser, generateUniqueLegajo, roleUsesLegajo } from "@/lib/auth/legajo";
import { getRoleFromUser, normalizeRole, type AppUserRole } from "@/lib/auth/roles";
import { validateStudentSports } from "@/lib/extracurricular";
import {
  ensureProfileRole,
  ensureStudentRecord,
  ensureTeacherRecord,
  getProfileByAuthUserId,
  getProfileFullName,
  insertAuditLog,
  linkGuardianToStudentByDni,
  syncProfileNameAndEmail,
  upsertProfile,
} from "@/lib/supabase/academicAdmin";

import {
  buildAdminUserDetail,
  ensureCanChangeRole,
  getAdminSupabase,
  getDniFromUser,
  getProfileByUserOrLegajo,
  getUserRequestInfo,
  isValidDeleteUserPayload,
  isValidPayload,
  isValidResetPasswordPayload,
} from "./userDetailHelpers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const access = await ensureAdministrativeAccess();
  if ("error" in access) return access.error;

  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) return adminResult.error;

  const { userId } = await context.params;
  const user = await buildAdminUserDetail(adminResult.supabase, userId);

  if (!user) {
    return NextResponse.json({ error: "No se encontró el usuario." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const access = await ensureAdministrativeAccess();
  if ("error" in access) return access.error;

  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) return adminResult.error;

  const body = await request.json().catch(() => null);
  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Payload inválido para actualizar el usuario." },
      { status: 400 },
    );
  }

  const { userId } = await context.params;
  const supabase = adminResult.supabase;
  const { data: userResult, error: getUserError } = await supabase.auth.admin.getUserById(userId);

  if (getUserError || !userResult.user) {
    return NextResponse.json(
      { error: getUserError?.message ?? "No se encontró el usuario." },
      { status: 404 },
    );
  }

  const currentMetadata = userResult.user.user_metadata ?? {};
  const currentAppMetadata = userResult.user.app_metadata ?? {};
  const currentRole = getRoleFromUser(userResult.user);
  const nextRole = normalizeRole(body.role) as AppUserRole;
  const nextFullName = body.fullName.trim();
  const nextEmail = normalizeEmail(body.email) ?? body.email.trim().toLowerCase();
  const nextDni = typeof body.dni === "string" && body.dni.trim().length > 0 ? body.dni.trim() : null;
  const reason = body.reason?.trim() || null;
  const roleChanged = currentRole !== nextRole;

  if (roleChanged && (!reason || reason.length < 3)) {
    return NextResponse.json(
      { error: "Ingresá un motivo breve para auditar el cambio de rol." },
      { status: 400 },
    );
  }

  if (roleChanged) {
    const roleError = await ensureCanChangeRole({
      accessUserId: access.user.id,
      supabase,
      userId,
      currentRole,
      nextRole,
    });
    if (roleError) return roleError;
  }

  const currentLegajo = getLegajoFromUser(userResult.user);
  const needsLegajo = roleUsesLegajo(nextRole);
  const nextLegajo = needsLegajo
    ? currentLegajo ?? (await generateUniqueLegajo(supabase, nextRole))
    : currentLegajo;

  const sportsList =
    nextRole === "alumno" && Array.isArray(body.sports)
      ? body.sports.filter((s): s is string => typeof s === "string")
      : undefined;

  if (nextRole === "alumno" && sportsList) {
    const sportsError = validateStudentSports(sportsList);
    if (sportsError) {
      return NextResponse.json({ error: sportsError }, { status: 400 });
    }
  }

  const transportRoute =
    nextRole === "alumno" && typeof body.transportRoute === "string"
      ? body.transportRoute.trim() || "No Registrado"
      : undefined;
  const diningService =
    nextRole === "alumno" && typeof body.diningService === "string"
      ? body.diningService.trim() || "No Registrado"
      : undefined;

  // Si la cuenta Auth usa un correo interno (.educar.test) para evitar colisión con el email familiar,
  // mantenemos el email de Auth interno y guardamos el correo real de contacto en contact_email.
  const currentAuthEmail = userResult.user.email ?? "";
  const usesInternalAuthEmail = currentAuthEmail.endsWith(".educar.test");

  const updatePayload: Parameters<typeof supabase.auth.admin.updateUserById>[1] = {
    ...(usesInternalAuthEmail ? {} : { email: nextEmail }),
    email_confirm: true,
    app_metadata: {
      ...currentAppMetadata,
      role: nextRole,
      ...(nextLegajo ? { legajo: nextLegajo } : {}),
      ...(roleChanged
        ? {
            role_changed_by: access.user.email ?? access.user.id,
            role_changed_at: new Date().toISOString(),
            role_change_reason: reason,
            previous_role: currentRole,
          }
        : {}),
    },
    user_metadata: {
      ...currentMetadata,
      role: nextRole,
      full_name: nextFullName,
      contact_email: nextEmail,
      ...(nextLegajo ? { legajo: nextLegajo } : {}),
      ...(sportsList !== undefined ? { sports: sportsList } : {}),
      ...(transportRoute !== undefined ? { transport_route: transportRoute } : {}),
      ...(diningService !== undefined ? { dining_service: diningService } : {}),
    },
  };

  // IMPORTANTE: NUNCA sobrescribir updatePayload.password al editar datos del usuario.
  // La contraseña solo se restablece mediante la acción explícita POST /api/admin/users/[userId].

  const { error } = await supabase.auth.admin.updateUserById(userId, updatePayload);

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "No se pudo actualizar el usuario." },
      { status: 500 },
    );
  }

  const [existingProfile, actorProfile] = await Promise.all([
    getProfileByUserOrLegajo({
      supabase,
      userId,
      legajo: currentLegajo,
      dni: getDniFromUser(userResult.user),
      role: currentRole,
    }),
    getProfileByAuthUserId(supabase, access.user.id),
  ]);

  let profile = existingProfile;
  const phoneValue = typeof body.phone === "string" ? body.phone.trim() || null : undefined;
  const addressValue = typeof body.address === "string" ? body.address.trim() || null : undefined;
  const specialtyValue =
    typeof body.specialty === "string" && body.specialty.trim().length > 0
      ? body.specialty.trim()
      : undefined;

  if (needsLegajo) {
    // REQ-ALU-01.3 / REQ-PRF-01.3: Bloquear edición de DNI si ya está registrado en el perfil
    const effectiveDni = existingProfile?.dni ?? nextDni ?? null;

    if (!(typeof effectiveDni === "string" && /^\d{8}$/.test(effectiveDni.trim()))) {
      return NextResponse.json(
        { error: "Este rol necesita un DNI válido de 8 dígitos para poder acceder con legajo." },
        { status: 400 },
      );
    }

    profile = await upsertProfile({
      supabase,
      authUserId: userId,
      fullName: nextFullName,
      dni: effectiveDni,
      email: usesInternalAuthEmail ? currentAuthEmail : nextEmail,
      phone: phoneValue ?? null,
      address: addressValue ?? null,
    });

    await ensureProfileRole({
      supabase,
      profileId: profile.id,
      roleCode: nextRole,
      previousRoleCode: roleChanged && currentRole !== "desconocido" ? currentRole : null,
    });

    if (nextRole === "alumno" && nextLegajo) {
      await ensureStudentRecord({
        supabase,
        profileId: profile.id,
        studentCode: nextLegajo,
      });
    }

    if (nextRole === "docente" && nextLegajo) {
      await ensureTeacherRecord({
        supabase,
        profileId: profile.id,
        teacherCode: nextLegajo,
        title: specialtyValue,
      });
    }

    if (
      nextRole === "tutor" &&
      typeof body.tutorStudentDni === "string" &&
      body.tutorStudentDni.trim().length > 0
    ) {
      const linkedStudent = await linkGuardianToStudentByDni({
        supabase,
        guardianProfileId: profile.id,
        studentDni: body.tutorStudentDni.trim(),
        relationshipType: "tutor",
        isPrimary: true,
      });

      await insertAuditLog({
        supabase,
        actorProfileId: actorProfile?.id ?? null,
        entityName: "student_guardian",
        entityId: `${linkedStudent.id}:${profile.id}`,
        action: "guardian_link_updated",
        newData: {
          student_profile_id: linkedStudent.id,
          guardian_profile_id: profile.id,
          relationship_type: "tutor",
        },
      });
    }
  } else {
    const syncedProfile = await syncProfileNameAndEmail({
      supabase,
      authUserId: userId,
      fullName: nextFullName,
      email: nextEmail,
      phone: phoneValue,
      address: addressValue,
    });

    if (syncedProfile) {
      profile = syncedProfile;

      await ensureProfileRole({
        supabase,
        profileId: syncedProfile.id,
        roleCode: nextRole,
        previousRoleCode: roleChanged && currentRole !== "desconocido" ? currentRole : null,
      });
    }
  }

  if (roleChanged) {
    await insertAuditLog({
      supabase,
      actorProfileId: actorProfile?.id ?? null,
      entityName: "auth_user",
      entityId: userId,
      action: "role_changed",
      oldData: { role: currentRole },
      newData: { role: nextRole, reason },
    });
  }

  const updatedUser = await buildAdminUserDetail(supabase, userId);

  if (!updatedUser) {
    return NextResponse.json(
      { error: "El usuario se actualizó pero no se pudo recargar su detalle." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, user: updatedUser });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const access = await ensureAdministrativeAccess();
  if ("error" in access) return access.error;

  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) return adminResult.error;

  const body = await request.json().catch(() => null);
  if (!isValidResetPasswordPayload(body)) {
    return NextResponse.json({ error: "Payload inválido para restablecer la contraseña." }, { status: 400 });
  }

  const { userId } = await context.params;
  const { data: userResult, error: getUserError } = await adminResult.supabase.auth.admin.getUserById(userId);
  if (getUserError || !userResult.user) {
    return NextResponse.json({ error: getUserError?.message ?? "No se encontró el usuario." }, { status: 404 });
  }

  const [requestInfo, profile] = await Promise.all([
    getUserRequestInfo(adminResult.supabase, userId),
    getProfileByUserOrLegajo({
      supabase: adminResult.supabase,
      userId,
      legajo: getLegajoFromUser(userResult.user),
      dni: getDniFromUser(userResult.user),
      role: getRoleFromUser(userResult.user),
    }),
  ]);

  const passwordHint = profile?.dni ?? requestInfo.requestStudentDni;
  if (!passwordHint) {
    return NextResponse.json(
      { error: "Este usuario no tiene un DNI asociado para restablecer la contraseña." },
      { status: 409 },
    );
  }

  const { error } = await adminResult.supabase.auth.admin.updateUserById(userId, {
    password: passwordHint,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "No se pudo restablecer la contraseña del usuario." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, passwordHint });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const access = await ensureAdministrativeAccess();
  if ("error" in access) return access.error;

  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) return adminResult.error;

  const body = await request.json().catch(() => null);
  if (!isValidDeleteUserPayload(body)) {
    return NextResponse.json(
      { error: "Ingresá una justificación de al menos 3 caracteres para eliminar el usuario." },
      { status: 400 },
    );
  }

  const { userId } = await context.params;
  const supabase = adminResult.supabase;
  if (userId === access.user.id) {
    return NextResponse.json({ error: "No podés eliminar tu propio usuario administrativo." }, { status: 409 });
  }

  const { data: userResult, error: getUserError } = await supabase.auth.admin.getUserById(userId);
  if (getUserError || !userResult.user) {
    return NextResponse.json({ error: getUserError?.message ?? "No se encontró el usuario." }, { status: 404 });
  }

  const currentRole = getRoleFromUser(userResult.user);
  if (currentRole === "administrativo") {
    const roleError = await ensureCanChangeRole({
      accessUserId: access.user.id,
      supabase,
      userId,
      currentRole,
      nextRole: "alumno",
    });
    if (roleError) return roleError;
  }

  const [profile, actorProfile] = await Promise.all([
    getProfileByUserOrLegajo({
      supabase,
      userId,
      legajo: getLegajoFromUser(userResult.user),
      dni: getDniFromUser(userResult.user),
      role: currentRole,
    }),
    getProfileByAuthUserId(supabase, access.user.id),
  ]);
  const reason = body.reason.trim();

  await insertAuditLog({
    supabase,
    actorProfileId: actorProfile?.id ?? null,
    entityName: "auth_user",
    entityId: userId,
    action: "user_deactivated",
    oldData: {
      id: userResult.user.id,
      email: userResult.user.email ?? null,
      role: currentRole,
      legajo: getLegajoFromUser(userResult.user),
      profile_id: profile?.id ?? null,
      full_name: getProfileFullName(profile) || userResult.user.user_metadata?.full_name || null,
      status: "activo",
    },
    newData: { reason, status: "inactivo" },
  });

  if (profile?.id) {
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", profile.id);

    if (updateProfileError) {
      return NextResponse.json(
        { error: updateProfileError.message ?? "No se pudo desactivar el perfil relacional del usuario." },
        { status: 500 },
      );
    }

    await supabase
      .from("students")
      .update({ current_status: "baja" })
      .eq("profile_id", profile.id);
  }

  const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...(userResult.user.user_metadata || {}),
      status: "inactivo",
      is_active: false,
      deactivation_reason: reason,
      deactivated_at: new Date().toISOString(),
    },
    ban_duration: "876000h",
  });

  if (updateAuthError) {
    return NextResponse.json(
      { error: updateAuthError.message ?? "No se pudo desactivar el usuario en Autenticación." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, status: "inactivo" });
}
