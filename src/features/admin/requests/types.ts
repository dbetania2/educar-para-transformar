export type RequestStatus = "pendiente" | "en_revision" | "aprobada" | "rechazada";

export type AdminRequest = {
  id: number;
  student_full_name: string;
  student_dni: string;
  level: string;
  responsible_type: "tutor" | "parents";
  tutor_full_name: string | null;
  tutor_dni: string | null;
  father_full_name: string | null;
  father_dni: string | null;
  mother_full_name: string | null;
  mother_dni: string | null;
  contact_phone: string;
  email: string;
  status: RequestStatus;
  internal_notes: string | null;
  reviewed_at: string | null;
  reviewed_by?: string | null;
  created_at: string;
};

export type RequestsResponsePayload = {
  error?: string;
  code?: string;
  requests?: AdminRequest[];
  schemaWarning?: string;
  workflowEnabled?: boolean;
};
