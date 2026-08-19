import { NextResponse } from "next/server";

import { requireTeacherCourseAccess } from "@/lib/teacherCourseAccess";
import type { createAdminClient } from "@/lib/supabase/admin";

const MATERIALS_BUCKET = "course-materials";
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.rar",
  "application/x-7z-compressed",
  "application/x-rar-compressed",
  "application/zip",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/plain",
]);
const ALLOWED_FILE_EXTENSIONS = new Set([
  "7z",
  "csv",
  "doc",
  "docx",
  "gif",
  "jpg",
  "jpeg",
  "pdf",
  "png",
  "ppt",
  "pptx",
  "rar",
  "rtf",
  "txt",
  "webp",
  "xls",
  "xlsx",
  "zip",
]);

const MATERIAL_LABELS: Record<string, string> = {
  "7z": "Archivo comprimido",
  csv: "CSV",
  doc: "Documento Word",
  docx: "Documento Word",
  gif: "Imagen",
  jpg: "Imagen",
  jpeg: "Imagen",
  pdf: "PDF",
  png: "Imagen",
  ppt: "Presentación",
  pptx: "Presentación",
  rar: "Archivo comprimido",
  rtf: "Documento",
  txt: "Texto",
  webp: "Imagen",
  xls: "Planilla",
  xlsx: "Planilla",
  zip: "Archivo comprimido",
};

type MaterialPayload = {
  materialId?: number;
  title?: string;
  description?: string | null;
  resourceUrl?: string | null;
  materialType?: string | null;
  resourceKind?: string | null;
};

type ParsedPayload = MaterialPayload & {
  file: File | null;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function numberOrUndefined(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(text(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function urlOrNull(value: unknown) {
  const rawUrl = text(value);
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : "";
}

function getMaterialTypeFromFile(file: File) {
  return MATERIAL_LABELS[getFileExtension(file.name)] ?? "Archivo";
}

function validateFile(file: File) {
  if (file.size <= 0) return "El archivo está vacío.";
  if (file.size > MAX_FILE_SIZE) return "El archivo no puede superar 50 MB.";

  const extension = getFileExtension(file.name);
  if (!ALLOWED_FILE_EXTENSIONS.has(extension)) {
    return "Formato no permitido. Subí PDF, Word, Excel, PowerPoint, imagen, TXT, CSV, ZIP, RAR o 7Z.";
  }

  if (file.type && !ALLOWED_FILE_TYPES.has(file.type)) {
    return "Formato no permitido. Subí PDF, Word, Excel, PowerPoint, imagen, TXT, CSV, ZIP, RAR o 7Z.";
  }

  return null;
}

async function parsePayload(request: Request): Promise<ParsedPayload | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);
    if (!formData) return null;

    const file = formData.get("file");
    return {
      materialId: numberOrUndefined(formData.get("materialId")),
      title: text(formData.get("title")) ?? undefined,
      description: text(formData.get("description")),
      resourceUrl: text(formData.get("resourceUrl")),
      materialType: text(formData.get("materialType")),
      resourceKind: text(formData.get("resourceKind")),
      file: file instanceof File && file.size > 0 ? file : null,
    };
  }

  const body = (await request.json().catch(() => null)) as MaterialPayload | null;
  if (!body) return null;

  return {
    ...body,
    materialId: numberOrUndefined(body.materialId),
    file: null,
  };
}

type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

async function uploadMaterialFile(courseId: number, file: File, supabase: AdminSupabaseClient) {
  const validationError = validateFile(file);
  if (validationError) throw new Error(validationError);

  const extension = getFileExtension(file.name);
  const path = "courses/" + courseId + "/" + crypto.randomUUID() + (extension ? "." + extension : "");
  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await supabase.storage.from(MATERIALS_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (upload.error) {
    throw new Error(upload.error.message ?? "No se pudo subir el archivo.");
  }

  const { data } = supabase.storage.from(MATERIALS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const access = await requireTeacherCourseAccess(Number(courseId));
  if ("error" in access) return access.error;

  const body = await parsePayload(request);
  const title = text(body?.title);
  if (!title) return NextResponse.json({ error: "Ingresá un título." }, { status: 400 });

  const resourceKind = text(body?.resourceKind) === "file" ? "file" : "link";
  const submittedResourceUrl = text(body?.resourceUrl);
  const externalResourceUrl = urlOrNull(submittedResourceUrl);

  if (resourceKind === "link" && !externalResourceUrl) {
    return NextResponse.json({ error: "Ingresá una URL válida con http o https." }, { status: 400 });
  }

  if (resourceKind === "file" && !body?.file && !body?.materialId) {
    return NextResponse.json({ error: "Seleccioná un archivo para descargar." }, { status: 400 });
  }

  if (resourceKind === "file" && submittedResourceUrl && body?.file) {
    return NextResponse.json({ error: "Elegí archivo descargable o enlace externo, no ambos." }, { status: 400 });
  }

  try {
    const uploadedResourceUrl = resourceKind === "file" && body?.file ? await uploadMaterialFile(access.courseId, body.file, access.supabase) : null;
    const materialType = text(body?.materialType) ?? (body?.file ? getMaterialTypeFromFile(body.file) : resourceKind === "link" ? "Enlace externo" : "Archivo descargable");
    const resourceUrl = resourceKind === "file" ? uploadedResourceUrl : externalResourceUrl;

    const payload = {
      course_id: access.courseId,
      title,
      description: text(body?.description),
      resource_url: resourceUrl,
      material_type: materialType,
      created_by: access.teacherProfileId,
    };

    const query = body?.materialId
      ? await access.supabase.from("course_materials").update(payload).eq("id", body.materialId).eq("course_id", access.courseId).select("id").single()
      : await access.supabase.from("course_materials").insert(payload).select("id").single();

    if (query.error) return NextResponse.json({ error: query.error.message }, { status: 500 });

    return NextResponse.json({ ok: true, materialId: query.data.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo guardar el material." },
      { status: 500 },
    );
  }
}
