import { useCallback, useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";

import { validateStudentSports } from "@/lib/extracurricular";
import type {
  AdminRequest,
  AvailableCourseOption,
  RequestsResponsePayload,
  RequestStatus,
} from "./types";

export const REQUEST_STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobada", label: "Aprobada" },
  { value: "rechazada", label: "Rechazada" },
] as const;

export function getResponsibleDisplay(request: AdminRequest) {
  if (request.responsible_type === "tutor") {
    return request.tutor_full_name || "Tutor";
  }

  return `${request.father_full_name || "Padre"} / ${request.mother_full_name || "Madre"}`;
}

export function getResponsibleLines(request: AdminRequest) {
  if (request.responsible_type === "tutor") {
    return [request.tutor_full_name || "Tutor"];
  }

  return [request.father_full_name || "Padre", request.mother_full_name || "Madre"];
}

export function useAdminRequests() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [schemaWarning, setSchemaWarning] = useState<string | null>(null);
  const [workflowEnabled, setWorkflowEnabled] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [draftStatus, setDraftStatus] = useState<RequestStatus>("pendiente");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftCourseIds, setDraftCourseIds] = useState<string[]>([]);
  const [draftSports, setDraftSports] = useState<string[]>([]);
  const [draftTransportRoute, setDraftTransportRoute] = useState<string>("No Registrado");
  const [draftDiningService, setDraftDiningService] = useState<string>("No Registrado");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | null>(null);

  const loadRequests = useCallback(async (notifyOnError = true) => {
    setIsLoading(true);
    setLoadError(null);
    setSchemaWarning(null);

    const response = await fetch("/api/admin/solicitudes");
    const payload = (await response.json().catch(() => null)) as RequestsResponsePayload | null;

    if (response.status === 409 && payload?.code === "ADMIN_REQUESTS_MIGRATION_REQUIRED") {
      setRequests(payload?.requests ?? []);
      setAvailableCourses(payload?.availableCourses ?? []);
      setSchemaWarning(payload?.schemaWarning ?? payload?.error ?? null);
      setWorkflowEnabled(false);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    if (!response.ok) {
      const errorMessage = payload?.error ?? "No se pudieron obtener las solicitudes.";
      setLoadError(errorMessage);
      setWorkflowEnabled(false);
      setIsLoading(false);

      if (notifyOnError) {
        notifications.show({
          title: "No se pudo cargar la tabla",
          message: errorMessage,
          color: "red",
        });
      }
      return;
    }

    setRequests(payload?.requests ?? []);
    setAvailableCourses(payload?.availableCourses ?? []);
    setSchemaWarning(payload?.schemaWarning ?? null);
    setWorkflowEnabled(payload?.workflowEnabled ?? true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrapRequests = async () => {
      const response = await fetch("/api/admin/solicitudes");
      const payload = (await response.json().catch(() => null)) as RequestsResponsePayload | null;

      if (cancelled) {
        return;
      }

      if (response.status === 409 && payload?.code === "ADMIN_REQUESTS_MIGRATION_REQUIRED") {
        setRequests(payload?.requests ?? []);
        setAvailableCourses(payload?.availableCourses ?? []);
        setSchemaWarning(payload?.schemaWarning ?? payload?.error ?? null);
        setWorkflowEnabled(false);
        setLoadError(null);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMessage = payload?.error ?? "No se pudieron obtener las solicitudes.";
        setLoadError(errorMessage);
        setSchemaWarning(null);
        setWorkflowEnabled(false);
        setIsLoading(false);
        return;
      }

      setRequests(payload?.requests ?? []);
      setAvailableCourses(payload?.availableCourses ?? []);
      setSchemaWarning(payload?.schemaWarning ?? null);
      setWorkflowEnabled(payload?.workflowEnabled ?? true);
      setLoadError(null);
      setIsLoading(false);
    };

    void bootstrapRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleTopBarRefresh = () => {
      void loadRequests();
    };

    window.addEventListener("admin-requests-refresh", handleTopBarRefresh);

    return () => {
      window.removeEventListener("admin-requests-refresh", handleTopBarRefresh);
    };
  }, [loadRequests]);

  const openRequest = useCallback((request: AdminRequest) => {
    setSelectedRequest(request);
    setDraftStatus(request.status);
    setDraftNotes(request.internal_notes ?? "");
    setDraftCourseIds([]);
    setDraftSports([]);
    setDraftTransportRoute("No Registrado");
    setDraftDiningService("No Registrado");
    setDeleteReason("");
  }, []);

  const handleSaveRequest = async () => {
    if (!selectedRequest || !workflowEnabled) {
      return;
    }

    if (draftStatus === "aprobada" && draftSports.length > 0) {
      const sportsError = validateStudentSports(draftSports);
      if (sportsError) {
        notifications.show({
          title: "Choque horario en deportes",
          message: sportsError,
          color: "red",
        });
        return;
      }
    }

    setIsUpdating(true);

    const response = await fetch(`/api/admin/solicitudes/${selectedRequest.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: draftStatus,
        internalNotes: draftNotes,
        ...(draftStatus === "aprobada"
          ? {
              courseIds: draftCourseIds.map((id) => Number(id)),
              sports: draftSports,
              transportRoute: draftTransportRoute,
              diningService: draftDiningService,
            }
          : {}),
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          request?: {
            status: RequestStatus;
            internal_notes: string | null;
            reviewed_at: string | null;
            reviewed_by?: string | null;
          };
        }
      | null;

    setIsUpdating(false);

    if (!response.ok || !payload?.request) {
      notifications.show({
        title: "No se pudo actualizar la solicitud",
        message: payload?.error ?? "Intentá nuevamente.",
        color: "red",
      });
      return;
    }

    notifications.show({
      title: "Solicitud actualizada",
      message:
        draftStatus === "aprobada"
          ? "Se aprobó la inscripción, se crearon las cuentas de alumno/responsables y se asignaron sus servicios."
          : `La solicitud quedó en estado ${draftStatus}.`,
      color: "green",
    });

    setRequests((current) =>
      current.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status: payload.request?.status ?? draftStatus,
              internal_notes: payload.request?.internal_notes ?? draftNotes,
              reviewed_at: payload.request?.reviewed_at ?? request.reviewed_at,
              reviewed_by: payload.request?.reviewed_by ?? request.reviewed_by,
            }
          : request,
      ),
    );

    setSelectedRequest(null);
  };

  const handleDeleteRequest = async () => {
    if (!selectedRequest || !workflowEnabled) {
      return;
    }

    if (deleteReason.trim().length < 3) {
      notifications.show({
        title: "Falta justificar la eliminación",
        message: "Ingresá un motivo breve para auditar la eliminación.",
        color: "yellow",
      });
      return;
    }

    setIsDeleting(true);

    const response = await fetch(`/api/admin/solicitudes/${selectedRequest.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: deleteReason.trim() }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    setIsDeleting(false);

    if (!response.ok) {
      notifications.show({
        title: "No se pudo eliminar la solicitud",
        message: payload?.error ?? "Intentá nuevamente.",
        color: "red",
      });
      return;
    }

    notifications.show({
      title: "Solicitud eliminada",
      message: `Se eliminó la solicitud de ${selectedRequest.student_full_name}.`,
      color: "green",
    });

    setRequests((current) => current.filter((request) => request.id !== selectedRequest.id));
    setSelectedRequest(null);
    setDeleteReason("");
  };

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        request.student_full_name.toLowerCase().includes(normalizedSearch) ||
        request.email.toLowerCase().includes(normalizedSearch) ||
        request.student_dni.toLowerCase().includes(normalizedSearch);

      const matchesStatus = !statusFilter || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  return {
    requests,
    availableCourses,
    isLoading,
    loadError,
    schemaWarning,
    workflowEnabled,
    selectedRequest,
    isUpdating,
    isDeleting,
    deleteReason,
    draftStatus,
    draftNotes,
    draftCourseIds,
    draftSports,
    draftTransportRoute,
    draftDiningService,
    search,
    statusFilter,
    filteredRequests,
    isInitialLoading: isLoading && requests.length === 0,
    emptyRequestsMessage:
      requests.length === 0
        ? "No hay solicitudes registradas."
        : "No hay resultados para los filtros actuales.",
    setSelectedRequest,
    setDraftStatus,
    setDraftNotes,
    setDraftCourseIds,
    setDraftSports,
    setDraftTransportRoute,
    setDraftDiningService,
    setDeleteReason,
    setSearch,
    setStatusFilter,
    loadRequests,
    openRequest,
    handleSaveRequest,
    handleDeleteRequest,
  };
}
