import { createAdminClient } from "@/lib/supabase/admin";
import { stripRichText } from "@/lib/richText";

export type NewsRecord = {
  id: string;
  title: string;
  descriptionHtml: string;
  excerpt: string;
  imageUrl: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: "image" | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

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

function mapNews(row: NewsRow): NewsRecord {
  const plain = stripRichText(row.description_html);

  return {
    id: row.id,
    title: row.title,
    descriptionHtml: row.description_html,
    excerpt: plain.length > 150 ? `${plain.slice(0, 147)}...` : plain,
    imageUrl: row.image_url,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileType: row.file_type,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPublishedNews() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("news")
    .select("id, title, description_html, image_url, file_url, file_name, file_type, is_published, created_at, updated_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "No se pudieron obtener las noticias.");
  }

  return ((data ?? []) as NewsRow[]).map(mapNews);
}

export async function getPublishedNewsById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("news")
    .select("id, title, description_html, image_url, file_url, file_name, file_type, is_published, created_at, updated_at")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? "No se pudo obtener la noticia.");
  }

  return data ? mapNews(data as NewsRow) : null;
}
