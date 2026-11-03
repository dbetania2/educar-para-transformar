import { roleUsesLegajo } from "@/lib/auth/legajo";
import type { AppUserRole } from "@/lib/auth/roles";
import { validateStudentSports } from "@/lib/extracurricular";

import type {
  AdminBootstrapStatus,
  AdminUserDetail,
  CreateUserValues,
  DeleteUserValues,
  EditUserValues,
} from "./types";

export const initialCreateUserValues: CreateUserValues = {
  fullName: "",
  email: "",
  password: "",
  dni: "",
  role: "alumno",
  level: "",
  contactPhone: "",
  address: "",
  specialty: "",
  sports: [],
  transportRoute: "No Registrado",
  diningService: "No Registrado",
  responsibleType: "tutor",
  tutorFullName: "",
  tutorDni: "",
  fatherFullName: "",
  fatherDni: "",
  motherFullName: "",
  motherDni: "",
  tutorStudentDni: "",
};

export const detailInitialValues: EditUserValues = {
  fullName: "",
  email: "",
  dni: "",
  phone: "",
  address: "",
  specialty: "",
  sports: [],
  transportRoute: "No Registrado",
  diningService: "No Registrado",
  role: "alumno",
  reason: "",
  tutorStudentDni: "",
};

export const deleteInitialValues: DeleteUserValues = {
  reason: "",
};

function isManualStudentRole(role: AppUserRole) {
  return role === "alumno";
}

export const createUserFormValidate = {
  fullName: (value: string) =>
    value.trim().length >= 3 ? null : "Ingresá el nombre completo.",
  email: (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "Ingresá un correo válido.",
  dni: (value: string, values: CreateUserValues) =>
    roleUsesLegajo(values.role)
      ? /^\d{8}$/.test(value.trim())
        ? null
        : "Ingresá un DNI válido."
      : null,
  password: (value: string, values: CreateUserValues) =>
    !roleUsesLegajo(values.role) && value.trim().length < 6
      ? "Ingresá una contraseña de al menos 6 caracteres."
      : null,
  level: (value: string, values: CreateUserValues) =>
    isManualStudentRole(values.role) && value.trim().length < 3
      ? "Ingresá el nivel del alumno."
      : null,
  contactPhone: (value: string, values: CreateUserValues) =>
    isManualStudentRole(values.role)
      ? /^\d{8,15}$/.test(value.trim())
        ? null
        : "Ingresá un teléfono de contacto válido."
      : null,
  responsibleType: (value: string, values: CreateUserValues) =>
    isManualStudentRole(values.role) && value !== "tutor" && value !== "parents"
      ? "Seleccioná quién queda como responsable."
      : null,
  tutorFullName: (value: string, values: CreateUserValues) =>
    isManualStudentRole(values.role) && values.responsibleType === "tutor" && value.trim().length < 3
      ? "Ingresá el nombre del tutor."
      : null,
  tutorDni: (value: string, values: CreateUserValues) =>
    isManualStudentRole(values.role) && values.responsibleType === "tutor"
      ? /^\d{8}$/.test(value.trim())
        ? null
        : "Ingresá un DNI válido para el tutor."
      : null,
  fatherFullName: (value: string, values: CreateUserValues) =>
    isManualStudentRole(values.role) && values.responsibleType === "parents" && value.trim().length < 3
      ? "Ingresá el nombre del padre."
      : null,
  fatherDni: (value: string, values: CreateUserValues) =>
    isManualStudentRole(values.role) && values.responsibleType === "parents"
      ? /^\d{8}$/.test(value.trim())
        ? null
        : "Ingresá un DNI válido para el padre."
      : null,
  motherFullName: (value: string, values: CreateUserValues) =>
    isManualStudentRole(values.role) && values.responsibleType === "parents" && value.trim().length < 3
      ? "Ingresá el nombre de la madre."
      : null,
  motherDni: (value: string, values: CreateUserValues) =>
    isManualStudentRole(values.role) && values.responsibleType === "parents"
      ? /^\d{8}$/.test(value.trim())
        ? null
        : "Ingresá un DNI válido para la madre."
      : null,
  tutorStudentDni: (value: string, values: CreateUserValues) =>
    values.role === "tutor"
      ? /^\d{8}$/.test(value.trim())
        ? null
        : "Ingresá el DNI del alumno a vincular."
      : null,
  sports: (value: string[], values: CreateUserValues) =>
    values.role === "alumno" ? validateStudentSports(value) : null,
};

export const editUserFormValidate = {
  fullName: (value: string) =>
    value.trim().length >= 3 ? null : "Ingresá el nombre completo.",
  email: (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "Ingresá un correo válido.",
  dni: (value: string, values: EditUserValues) =>
    roleUsesLegajo(values.role)
      ? /^\d{8}$/.test(value.trim())
        ? null
        : "Ingresá un DNI válido."
      : null,
  tutorStudentDni: (value: string, values: EditUserValues) =>
    values.role === "tutor" && value.trim().length > 0
      ? /^\d{8}$/.test(value.trim())
        ? null
        : "Ingresá un DNI válido para el alumno."
      : null,
  sports: (value: string[], values: EditUserValues) =>
    values.role === "alumno" ? validateStudentSports(value) : null,
};

export const deleteUserFormValidate = {
  reason: (value: string) =>
    value.trim().length >= 3 ? null : "Ingresá una justificación para eliminar.",
};

export function getBootstrapFormValidate(bootstrapStatus: AdminBootstrapStatus | null) {
  return {
    fullName: (value: string) =>
      value.trim().length >= 3 ? null : "Ingresá el nombre completo.",
    email: (value: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "Ingresá un correo válido.",
    password: (value: string) =>
      value.trim().length >= 6 ? null : "Ingresá una contraseña de al menos 6 caracteres.",
    bootstrapSecret: (value: string) =>
      bootstrapStatus?.requiresSecret && value.trim().length === 0
        ? "Ingresá la clave de bootstrap."
        : null,
  };
}

export function mapUserDetailToEditValues(user: AdminUserDetail): EditUserValues {
  return {
    fullName: user.fullName,
    email: user.email,
    dni: user.dni ?? "",
    phone: user.phone ?? user.requestContactPhone ?? "",
    address: user.address ?? "",
    specialty: user.specialty ?? "",
    sports: user.sports ?? [],
    transportRoute: user.transportRoute ?? "No Registrado",
    diningService: user.diningService ?? "No Registrado",
    role: user.role === "desconocido" ? "alumno" : user.role,
    reason: "",
    tutorStudentDni: user.linkedStudents[0]?.dni ?? "",
  };
}

