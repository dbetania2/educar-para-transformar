import type { AppUserRole } from "@/lib/auth/roles";

export type StudentResponsibleType = "tutor" | "parents" | "";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  legajo: string | null;
  role: AppUserRole | "desconocido";
  createdAt: string | null;
  lastSignInAt: string | null;
};

export type AdminGuardianLink = {
  profileId: string;
  fullName: string;
  dni: string;
  email: string | null;
  relationshipType: "tutor" | "madre" | "padre" | "responsable" | "otro";
  isPrimary: boolean;
};

export type AdminUserDetail = AdminUser & {
  dni: string | null;
  requestStatus: string | null;
  requestStudentFullName: string | null;
  requestStudentDni: string | null;
  requestLevel: string | null;
  requestContactPhone: string | null;
  requestResponsibleType: Exclude<StudentResponsibleType, ""> | null;
  requestTutorFullName: string | null;
  requestTutorDni: string | null;
  requestFatherFullName: string | null;
  requestFatherDni: string | null;
  requestMotherFullName: string | null;
  requestMotherDni: string | null;
  linkedGuardians: AdminGuardianLink[];
  linkedStudents: AdminGuardianLink[];
};

export type CreateUserValues = {
  fullName: string;
  email: string;
  password: string;
  dni: string;
  role: AppUserRole;
  level: string;
  contactPhone: string;
  responsibleType: StudentResponsibleType;
  tutorFullName: string;
  tutorDni: string;
  fatherFullName: string;
  fatherDni: string;
  motherFullName: string;
  motherDni: string;
  tutorStudentDni: string;
};

export type EditUserValues = {
  fullName: string;
  email: string;
  dni: string;
  role: AppUserRole;
  reason: string;
  tutorStudentDni: string;
};

export type DeleteUserValues = {
  reason: string;
};

export type BootstrapAdminValues = {
  fullName: string;
  email: string;
  password: string;
  bootstrapSecret: string;
};

export type AdminBootstrapStatus = {
  enabled: boolean;
  requiresSecret: boolean;
  lockedReason: string | null;
};

export type UsersResponsePayload = {
  error?: string;
  code?: string;
  users?: AdminUser[];
  bootstrap?: AdminBootstrapStatus;
};

export type UserDetailResponsePayload = {
  error?: string;
  user?: AdminUserDetail;
  passwordHint?: string;
};

export type PendingRoleChange = {
  userId: string;
  userLabel: string;
  nextRole: AppUserRole;
};
