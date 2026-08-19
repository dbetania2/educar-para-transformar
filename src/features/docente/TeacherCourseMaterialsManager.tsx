"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Drawer, FileInput, Group, SegmentedControl, Stack, Text, Textarea, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconExternalLink, IconPencil } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { ActionsMenu, ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import type { TeacherCourseMaterialRecord } from "@/lib/teacherDashboard";

type Props = { courseId: number; materials: TeacherCourseMaterialRecord[] };
type MaterialResourceKind = "link" | "file";
type MaterialForm = { materialId?: number; title: string; description: string; resourceUrl: string; materialType: string; file: File | null; resourceKind: MaterialResourceKind };

const emptyForm: MaterialForm = { title: "", description: "", resourceUrl: "", materialType: "", file: null, resourceKind: "link" };

function stripHtml(value: string | null) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " " ).replace(/&nbsp;/g, " " ).replace(/\s+/g, " " ).trim();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function getResourceKind(material: TeacherCourseMaterialRecord): MaterialResourceKind {
  return material.resource_url?.includes("/storage/v1/object/public/course-materials/") ? "file" : "link";
}

export default function TeacherCourseMaterialsManager({ courseId, materials }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState<MaterialForm>(emptyForm);

  const openNewMaterial = () => {
    setForm(emptyForm);
    setOpened(true);
  };

  const openEditMaterial = (material: TeacherCourseMaterialRecord) => {
    setForm({
      materialId: material.id,
      title: material.title,
      description: material.description ?? "",
      resourceUrl: material.resource_url ?? "",
      materialType: material.material_type ?? "",
      file: null,
      resourceKind: getResourceKind(material),
    });
    setOpened(true);
  };

  const closeDrawer = () => {
    setOpened(false);
    setForm(emptyForm);
  };

  const save = async () => {
    const formData = new FormData();
    if (form.materialId) formData.set("materialId", String(form.materialId));
    formData.set("title", form.title);
    formData.set("description", form.description);
    formData.set("resourceKind", form.resourceKind);
    formData.set("resourceUrl", form.resourceKind === "link" ? form.resourceUrl : "");
    formData.set("materialType", form.materialType);
    if (form.resourceKind === "file" && form.file) formData.set("file", form.file);

    const response = await fetch(`/api/docente/courses/${courseId}/materials`, {
      method: "POST",
      body: formData,
    });
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      notifications.show({ title: "No se pudo guardar material", message: payload?.error ?? "Revisá los datos.", color: "red" });
      return;
    }
    closeDrawer();
    notifications.show({ title: "Material guardado", message: "El recurso quedó disponible.", color: "green" });
    startTransition(() => router.refresh());
  };

  const columns: ResponsiveDataTableColumn<TeacherCourseMaterialRecord>[] = [
    {
      key: "material",
      header: <Text fw={700}>Material</Text>,
      mobileMinWidth: 280,
      render: (material) => (
        <Stack gap={4}>
          <Text fw={700} c="brand.7">{material.title}</Text>
          <Text size="sm" c="dimmed">{stripHtml(material.description) || "Sin descripción"}</Text>
        </Stack>
      ),
    },
    {
      key: "type",
      header: <Text fw={700}>Tipo</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (material) => <Badge variant="light" color="brand.7" radius="xl">{material.material_type || "Recurso"}</Badge>,
    },
    {
      key: "created",
      header: <Text fw={700}>Alta</Text>,
      mobileMinWidth: 130,
      noWrap: true,
      render: (material) => <Text size="sm">{formatDate(material.created_at)}</Text>,
    },
    {
      key: "resource",
      header: <Text fw={700}>Enlace</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (material) => <Text size="sm" c={material.resource_url ? "brand.7" : "dimmed"}>{material.resource_url ? "Disponible" : "Sin enlace"}</Text>,
    },
    {
      key: "actions",
      header: <Text fw={700}>Acciones</Text>,
      mobileMinWidth: 150,
      noWrap: true,
      render: (material) => (
        <ActionsMenu
          items={[
            { key: "open", label: getResourceKind(material) === "file" ? "Descargar archivo" : "Abrir enlace", icon: IconExternalLink, onClick: () => material.resource_url ? window.open(material.resource_url, "_blank", "noopener,noreferrer") : undefined, disabled: !material.resource_url },
            { key: "edit", label: "Editar material", icon: IconPencil, onClick: () => openEditMaterial(material) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <Group justify="space-between" align="center">
        <div>
          <Title order={3} c="brand.7">Materiales</Title>
          <Text size="sm" c="dimmed" mt={4}>Publicá y editá recursos desde acciones.</Text>
        </div>
        <CTAButton onClick={openNewMaterial}>Nuevo material</CTAButton>
      </Group>

      <ResponsiveDataTable
        data={materials}
        columns={columns}
        rowKey={(material) => material.id}
        emptyMessage="Todavía no hay materiales cargados para este curso."
      />

      <Drawer opened={opened} onClose={closeDrawer} title={form.materialId ? "Editar material" : "Nuevo material"} position="right" size="min(100vw, 560px)" padding="xl">
        <Stack gap="md">
          <TextInput label="Título" required value={form.title} onChange={(event) => setForm({ ...form, title: event.currentTarget.value })} />
          <Textarea label="Descripción" minRows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.currentTarget.value })} />
          <SegmentedControl
            value={form.resourceKind}
            onChange={(value) => setForm({ ...form, resourceKind: value as MaterialResourceKind, file: null, resourceUrl: "" })}
            data={[
              { value: "link", label: "Enlace externo" },
              { value: "file", label: "Archivo descargable" },
            ]}
            fullWidth
          />

          {form.resourceKind === "file" ? (
            <FileInput
              label="Archivo descargable"
              description={form.materialId ? "Si subís otro archivo, reemplaza el recurso anterior. PDF, Word, Excel, PowerPoint, imágenes, TXT, CSV, ZIP, RAR o 7Z hasta 50 MB." : "PDF, Word, Excel, PowerPoint, imágenes, TXT, CSV, ZIP, RAR o 7Z hasta 50 MB."}
              placeholder="Seleccionar archivo"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.txt,.csv,.zip,.rar,.7z,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/png,image/jpeg,image/webp,image/gif,text/plain,text/csv,application/zip,application/vnd.rar,application/x-rar-compressed,application/x-7z-compressed,application/rtf"
              clearable
              value={form.file}
              onChange={(file) => setForm({ ...form, file })}
            />
          ) : (
            <TextInput label="Enlace externo" value={form.resourceUrl} onChange={(event) => setForm({ ...form, resourceUrl: event.currentTarget.value })} />
          )}
          <TextInput label="Tipo" placeholder="PDF, guía, imagen, archivo comprimido..." value={form.materialType} onChange={(event) => setForm({ ...form, materialType: event.currentTarget.value })} />
          <CTAButton onClick={() => void save()} disabled={pending} fullWidth>{form.materialId ? "Guardar cambios" : "Guardar material"}</CTAButton>
        </Stack>
      </Drawer>
    </>
  );
}
