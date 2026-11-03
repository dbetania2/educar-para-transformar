import type {
  BootstrapAdminValues,
  CreateUserValues,
  EditUserValues,
  UserDetailResponsePayload,
  UsersResponsePayload,
} from "./types";

export async function fetchAdminUsersList(): Promise<{
  ok: boolean;
  payload: UsersResponsePayload | null;
}> {
  const response = await fetch("/api/admin/users");
  const payload = (await response.json().catch(() => null)) as UsersResponsePayload | null;
  return { ok: response.ok, payload };
}

export async function postBootstrapAdmin(values: BootstrapAdminValues) {
  const response = await fetch("/api/admin/bootstrap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const payload = (await response.json().catch(() => null)) as
    | { error?: string; user?: { email: string } }
    | null;
  return { ok: response.ok, payload };
}

export async function postCreateAdminUser(values: CreateUserValues) {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const payload = (await response.json().catch(() => null)) as
    | {
        error?: string;
        user?: { email: string; legajo?: string | null; dni?: string | null };
      }
    | null;
  return { ok: response.ok, payload };
}

export async function fetchAdminUserDetail(userId: string) {
  const response = await fetch(`/api/admin/users/${userId}`);
  const payload = (await response.json().catch(() => null)) as UserDetailResponsePayload | null;
  return { ok: response.ok, payload };
}

export async function postResetUserPasswordToDni(userId: string) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "request_dni" }),
  });
  const payload = (await response.json().catch(() => null)) as
    | { error?: string; passwordHint?: string }
    | null;
  return { ok: response.ok, payload };
}

export async function deleteAdminUserById(userId: string, reason: string) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: reason.trim() }),
  });
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return { ok: response.ok, payload };
}

export async function patchAdminUserDetail(userId: string, values: EditUserValues) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      dni: values.dni.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      specialty: values.specialty.trim(),
      sports: values.sports,
      transportRoute: values.transportRoute,
      diningService: values.diningService,
      role: values.role,
      reason: values.reason.trim(),
      tutorStudentDni: values.tutorStudentDni.trim(),
    }),
  });
  const payload = (await response.json().catch(() => null)) as UserDetailResponsePayload | null;
  return { ok: response.ok, payload };
}

export async function patchAdminUserRole(params: {
  userId: string;
  fullName: string;
  email: string;
  dni: string;
  role: string;
  reason: string;
}) {
  const response = await fetch(`/api/admin/users/${params.userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: params.fullName,
      email: params.email,
      dni: params.dni,
      role: params.role,
      reason: params.reason.trim(),
    }),
  });
  const payload = (await response.json().catch(() => null)) as UserDetailResponsePayload | null;
  return { ok: response.ok, payload };
}

