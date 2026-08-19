import { useEffect, useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import type { AdminNews, NewsFormValues, NewsResponsePayload } from "./types";

const initialValues: NewsFormValues = {
  title: "",
  descriptionHtml: "",
  file: null,
  isPublished: true,
};

function mapNewsToForm(news: AdminNews): NewsFormValues {
  return {
    title: news.title,
    descriptionHtml: news.descriptionHtml,
    file: null,
    isPublished: news.isPublished,
  };
}

function buildFormData(values: NewsFormValues, id?: string) {
  const formData = new FormData();
  if (id) formData.set("id", id);
  formData.set("title", values.title);
  formData.set("descriptionHtml", values.descriptionHtml);
  formData.set("isPublished", String(values.isPublished));
  if (values.file) formData.set("file", values.file);
  return formData;
}

export function useAdminNews() {
  const [news, setNews] = useState<AdminNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedNews, setSelectedNews] = useState<AdminNews | null>(null);

  const form = useForm<NewsFormValues>({
    initialValues,
    validate: {
      title: (value) => value.trim().length >= 3 ? null : "Ingresá un título.",
      descriptionHtml: (value) => value.replace(/<[^>]*>/g, " ").trim().length > 0 ? null : "Ingresá una descripción.",
    },
  });

  const filteredNews = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return news;
    return news.filter((item) => item.title.toLowerCase().includes(term));
  }, [news, search]);

  const loadNews = async (notifyOnError = true) => {
    setIsLoading(true);
    setLoadError(null);
    const response = await fetch("/api/admin/news");
    const payload = (await response.json().catch(() => null)) as NewsResponsePayload | null;

    if (!response.ok) {
      const message = payload?.error ?? "No se pudieron cargar las noticias.";
      setLoadError(message);
      setIsLoading(false);
      if (notifyOnError) notifications.show({ title: "No se pudo cargar noticias", message, color: "red" });
      return;
    }

    setNews(payload?.news ?? []);
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setSelectedNews(null);
    form.setValues(initialValues);
    form.resetDirty(initialValues);
    setModalOpened(true);
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrapNews = async () => {
      const response = await fetch("/api/admin/news");
      const payload = (await response.json().catch(() => null)) as NewsResponsePayload | null;

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        setLoadError(payload?.error ?? "No se pudieron cargar las noticias.");
        setIsLoading(false);
        return;
      }

      setNews(payload?.news ?? []);
      setIsLoading(false);
    };

    void bootstrapNews();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleRefresh = () => void loadNews();
    const handleCreate = () => openCreateModal();

    window.addEventListener("admin-news-refresh", handleRefresh);
    window.addEventListener("admin-news-create", handleCreate);

    return () => {
      window.removeEventListener("admin-news-refresh", handleRefresh);
      window.removeEventListener("admin-news-create", handleCreate);
    };
  });

  const openEditModal = (item: AdminNews) => {
    const values = mapNewsToForm(item);
    setSelectedNews(item);
    form.setValues(values);
    form.resetDirty(values);
    setModalOpened(true);
  };

  const closeModal = () => {
    setModalOpened(false);
    setSelectedNews(null);
    form.setValues(initialValues);
    form.resetDirty(initialValues);
  };

  const saveNews = async (values: NewsFormValues) => {
    setIsSaving(true);
    const isEditing = Boolean(selectedNews);
    const response = await fetch("/api/admin/news", {
      method: isEditing ? "PATCH" : "POST",
      body: buildFormData(values, selectedNews?.id),
    });
    const payload = (await response.json().catch(() => null)) as NewsResponsePayload | null;

    if (!response.ok) {
      notifications.show({
        title: isEditing ? "No se pudo actualizar la noticia" : "No se pudo crear la noticia",
        message: payload?.error ?? "Revisá los datos.",
        color: "red",
      });
      setIsSaving(false);
      return;
    }

    setNews(payload?.news ?? []);
    closeModal();
    setIsSaving(false);
    notifications.show({ title: isEditing ? "Noticia actualizada" : "Noticia creada", message: "El contenido quedó sincronizado.", color: "green" });
  };

  const deleteNews = async (item: AdminNews): Promise<boolean> => {
    setIsDeleting(true);
    const response = await fetch("/api/admin/news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    const payload = (await response.json().catch(() => null)) as NewsResponsePayload | null;

    if (!response.ok) {
      notifications.show({ title: "No se pudo eliminar la noticia", message: payload?.error ?? "Intentá nuevamente.", color: "red" });
      setIsDeleting(false);
      return false;
    }

    setNews(payload?.news ?? []);
    setIsDeleting(false);
    notifications.show({ title: "Noticia eliminada", message: "La grilla pública se actualizó.", color: "green" });
    return true;
  };

  return {
    news,
    filteredNews,
    isLoading,
    isSaving,
    isDeleting,
    loadError,
    search,
    modalOpened,
    selectedNews,
    form,
    setSearch,
    openCreateModal,
    openEditModal,
    closeModal,
    saveNews,
    deleteNews,
    loadNews,
  };
}
