"use client";

import { useMemo, useState } from "react";
import { ActionIcon, Alert, Button, Card, Drawer, FileInput, Group, Modal, Stack, Switch, Text, TextInput, Tooltip } from "@mantine/core";
import { IconAlertCircle, IconEye, IconPencil, IconTrash } from "@tabler/icons-react";

import { CTAButton, StatusToneBadge } from "@/components/atoms";
import { AdminPageLoader, ResponsiveDataTable, RichTextInput, RichTextViewer, type ResponsiveDataTableColumn } from "@/components/molecules";
import { AdminListTemplate } from "@/components/templates/AdminListTemplate/AdminListTemplate";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import type { AdminNews } from "./types";
import { useAdminNews } from "./useAdminNews";

const breadcrumbs = [
  { label: "Admin", href: "/admin/usuarios" },
  { label: "Noticias" },
];

export default function AdminNewsFeature() {
  const {
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
  } = useAdminNews();
  const [previewNews, setPreviewNews] = useState<AdminNews | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminNews | null>(null);

  const confirmDeleteNews = async () => {
    if (!deleteTarget) return;
    const deleted = await deleteNews(deleteTarget);
    if (deleted) setDeleteTarget(null);
  };

  const columns: ResponsiveDataTableColumn<AdminNews>[] = useMemo(
    () => [
      {
        key: "title",
        header: <Text fw={700}>Noticia</Text>,
        mobileMinWidth: 280,
        render: (item) => (
          <Stack gap={4}>
            <Text fw={700} c="brand.7" style={{ overflowWrap: "anywhere" }}>{item.title}</Text>
            <Text size="sm" c="dimmed">{item.fileName ?? "Sin archivo"}</Text>
          </Stack>
        ),
      },
      {
        key: "status",
        header: <Text fw={700}>Estado</Text>,
        mobileMinWidth: 140,
        noWrap: true,
        render: (item) => (
          <StatusToneBadge tone={item.isPublished ? "success" : "pending"}>
            {item.isPublished ? "Publicada" : "Borrador"}
          </StatusToneBadge>
        ),
      },
      {
        key: "file",
        header: <Text fw={700}>Archivo</Text>,
        mobileMinWidth: 140,
        render: (item) => <Text size="sm">{item.imageUrl ? "Imagen" : "Sin imagen"}</Text>,
      },
      {
        key: "created",
        header: <Text fw={700}>Alta</Text>,
        mobileMinWidth: 170,
        noWrap: true,
        render: (item) => <Text size="sm">{formatDateTime(item.createdAt)}</Text>,
      },
    ],
    [],
  );

  if (isLoading) {
    return <AdminPageLoader title="Noticias" description="Gestioná las noticias públicas." breadcrumbs={breadcrumbs} loadingLabel="Cargando noticias..." />;
  }

  return (
    <Stack gap="pageGapLg">
      <AdminListTemplate
        title="Noticias"
        description="Gestioná las noticias públicas, sus imágenes y la descripción enriquecida."
        breadcrumbs={[
          { label: "Admin", href: "/admin/usuarios" },
          { label: "Noticias" },
        ]}
        createButtonLabel="Nueva noticia"
        onCreate={() => openCreateModal()}
        searchProps={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por título de noticia...",
        }}
        statsSlot={
          loadError ? (
            <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
              {loadError}
            </Alert>
          ) : null
        }
      >
        <ResponsiveDataTable
          data={filteredNews}
          columns={columns}
          rowKey={(item) => item.id}
          pageSize={25}
          onRowClick={(item) => setPreviewNews(item)}
          emptyMessage="Todavía no hay noticias cargadas."
        />
      </AdminListTemplate>

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        title="Eliminar noticia"
        centered
        radius="xl"
      >
        <Stack gap="lg">
          <Text c="dimmed">
            Vas a eliminar la noticia {deleteTarget ? `"${deleteTarget.title}"` : "seleccionada"}. Esta accion no se puede deshacer.
          </Text>

          <Stack gap="sm" mt="xs">
            <Button
              leftSection={<IconTrash size={18} />}
              color="adminDanger"
              radius="xl"
              size="xl"
              fullWidth
              onClick={() => void confirmDeleteNews()}
              loading={isDeleting}
              style={{ minHeight: 56, fontWeight: 700 }}
            >
              Si, eliminar noticia
            </Button>
            <CTAButton
              ctaVariant="secondary"
              fullWidth
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancelar
            </CTAButton>
          </Stack>
        </Stack>
      </Modal>

      <Drawer
        opened={Boolean(previewNews)}
        onClose={() => setPreviewNews(null)}
        title="Vista previa"
        position="right"
        size="min(100vw, 720px)"
        radius="lg"
        padding="xl"
      >
        {previewNews ? (
          <Stack gap="blockGapLg">
            <Group>
              <StatusToneBadge tone={previewNews.isPublished ? "success" : "pending"}>
                {previewNews.isPublished ? "Publicada" : "Borrador"}
              </StatusToneBadge>
            </Group>
            <Text component="h2" fw={800} c="brand.7" size="xl" lh={1.15}>
              {previewNews.title}
            </Text>
            {previewNews.imageUrl ? (
              <Card p={0} radius="lg" withBorder style={{ overflow: "hidden" }}>
                <div
                  style={{
                    aspectRatio: "16 / 9",
                    backgroundImage: `url(${previewNews.imageUrl})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                />
              </Card>
            ) : null}
            <RichTextViewer value={previewNews.descriptionHtml} />
            <Group justify="flex-end" gap="sm" mt="md" pt="md" style={{ borderTop: "1px solid #f1f5f9" }}>
              <Button
                variant="subtle"
                color="red"
                size="sm"
                radius="md"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  const target = previewNews;
                  setPreviewNews(null);
                  setDeleteTarget(target);
                }}
              >
                Eliminar noticia
              </Button>
              <Button
                variant="filled"
                color="blue"
                size="sm"
                radius="md"
                leftSection={<IconPencil size={16} />}
                onClick={() => {
                  const target = previewNews;
                  setPreviewNews(null);
                  openEditModal(target);
                }}
              >
                Editar noticia
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Drawer>

      <Drawer
        opened={modalOpened}
        onClose={closeModal}
        title={selectedNews ? "Editar noticia" : "Nueva noticia"}
        position="right"
        size="min(100vw, 640px)"
        radius="lg"
        padding="xl"
      >
        <form onSubmit={form.onSubmit((values) => void saveNews(values))}>
          <Stack gap="blockGapLg">
            <TextInput label="Título" placeholder="Título de la noticia" withAsterisk {...form.getInputProps("title")} />

            <FileInput
              label="Imagen"
              description={selectedNews?.fileName ? "Si subís una imagen nueva, reemplaza a la anterior: " + selectedNews.fileName : "JPG, PNG, WEBP o GIF hasta 8 MB."}
              placeholder="Seleccionar archivo"
              accept="image/png,image/jpeg,image/webp,image/gif"
              clearable
              {...form.getInputProps("file")}
            />

            <RichTextInput
              label="Descripción"
              required
              minHeight={240}
              value={form.values.descriptionHtml}
              onChange={(value) => form.setFieldValue("descriptionHtml", value)}
              error={typeof form.errors.descriptionHtml === "string" ? form.errors.descriptionHtml : undefined}
              placeholder="Escribí el contenido de la noticia..."
            />

            <Switch
              label="Publicada"
              description="Si está desactivada, queda como borrador y no aparece en /noticias."
              checked={form.values.isPublished}
              onChange={(event) => form.setFieldValue("isPublished", event.currentTarget.checked)}
            />

            <Stack gap="sm">
              <CTAButton type="submit" disabled={isSaving} fullWidth>
                {isSaving ? "Guardando..." : selectedNews ? "Guardar cambios" : "Crear noticia"}
              </CTAButton>
              <CTAButton type="button" ctaVariant="secondary" onClick={closeModal} disabled={isSaving} fullWidth>
                Cancelar
              </CTAButton>
            </Stack>
          </Stack>
        </form>
      </Drawer>
    </Stack>
  );
}
