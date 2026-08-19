import { NextResponse } from "next/server";

import { getAdminClientWithGuard } from "@/lib/auth/adminAccess";
import { sanitizeRichText, stripRichText } from "@/lib/richText";
import { getProfileByAuthUserId } from "@/lib/supabase/academicAdmin";
import type { createAdminClient } from "@/lib/supabase/admin";

const NEWS_BUCKET = "news-assets";
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

type NewsRow = {
  id: string;
  title: string;
  description_html: string;
  image_url: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: "image" | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

function mapNews(row: NewsRow) {
  return {
    id: row.id,
    title: row.title,
    descriptionHtml: row.description_html,
    imageUrl: row.image_url,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileType: row.file_type,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getNews(supabase: AdminSupabaseClient) {
  const { data, error } = await supabase
    .from("news")
    .select("id, title, description_html, image_url, file_url, file_name, file_type, is_published, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "No se pudieron obtener las noticias.");
  }

  return ((data ?? []) as NewsRow[]).map(mapNews);
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  return getString(formData, key) === "true";
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

async function uploadAsset(supabase: AdminSupabaseClient, file: File) {
  if (file.size <= 0) return null;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo no puede superar 8 MB.");
  }

  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    throw new Error("Subí una imagen JPG, PNG, WEBP o GIF.");
  }

  const extension = getFileExtension(file);
  const path = crypto.randomUUID() + "." + extension;
  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await supabase.storage.from(NEWS_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (upload.error) {
    throw new Error(upload.error.message ?? "No se pudo subir el archivo.");
  }

  const { data } = supabase.storage.from(NEWS_BUCKET).getPublicUrl(path);
  return {
    image_url: data.publicUrl,
    file_url: data.publicUrl,
    file_name: file.name,
    file_type: "image" as const,
  };
}

function validatePayload(title: string, descriptionHtml: string) {
  if (title.trim().length < 3) {
    return "Ingresá un título de al menos 3 caracteres.";
  }

  if (stripRichText(descriptionHtml).length < 1) {
    return "Ingresá una descripción para la noticia.";
  }

  return null;
}

export async function GET() {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  try {
    return NextResponse.json({ news: await getNews(access.supabase) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron obtener las noticias." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Payload inválido para crear noticia." }, { status: 400 });
  }

  const title = getString(formData, "title");
  const descriptionHtml = sanitizeRichText(getString(formData, "descriptionHtml"));
  const validationError = validatePayload(title, descriptionHtml);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const file = formData.get("file");
    const uploadedAsset = file instanceof File ? await uploadAsset(access.supabase, file) : null;
    const actorProfile = await getProfileByAuthUserId(access.supabase, access.user.id);

    const insert = await access.supabase
      .from("news")
      .insert({
        title,
        description_html: descriptionHtml,
        is_published: getBoolean(formData, "isPublished"),
        created_by: actorProfile?.id ?? null,
        ...(uploadedAsset ?? {}),
      })
      .select("id")
      .single();

    if (insert.error) {
      throw new Error(insert.error.message ?? "No se pudo crear la noticia.");
    }

    return NextResponse.json({ news: await getNews(access.supabase) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear la noticia." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Payload inválido para actualizar noticia." }, { status: 400 });
  }

  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const descriptionHtml = sanitizeRichText(getString(formData, "descriptionHtml"));
  const validationError = validatePayload(title, descriptionHtml);

  if (!id || validationError) {
    return NextResponse.json({ error: validationError ?? "Falta identificar la noticia." }, { status: 400 });
  }

  try {
    const file = formData.get("file");
    const uploadedAsset = file instanceof File ? await uploadAsset(access.supabase, file) : null;

    const update = await access.supabase
      .from("news")
      .update({
        title,
        description_html: descriptionHtml,
        is_published: getBoolean(formData, "isPublished"),
        ...(uploadedAsset ?? {}),
      })
      .eq("id", id);

    if (update.error) {
      throw new Error(update.error.message ?? "No se pudo actualizar la noticia.");
    }

    return NextResponse.json({ news: await getNews(access.supabase) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar la noticia." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  const body = await request.json().catch(() => null);
  const id = body && typeof body === "object" ? (body as Record<string, unknown>).id : null;

  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "Falta identificar la noticia." }, { status: 400 });
  }

  try {
    const deletion = await access.supabase.from("news").delete().eq("id", id);

    if (deletion.error) {
      throw new Error(deletion.error.message ?? "No se pudo eliminar la noticia.");
    }

    return NextResponse.json({ news: await getNews(access.supabase) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo eliminar la noticia." },
      { status: 500 },
    );
  }
}
