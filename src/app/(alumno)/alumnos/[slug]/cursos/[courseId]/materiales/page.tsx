import { notFound } from "next/navigation";
import { Badge, Button, Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconDownload, IconExternalLink, IconFileText } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { PageHeader, RichTextViewer } from "@/components/molecules";
import {
  formatDate,
  formatStudentCoursePath,
  formatStudentHomePath,
  formatStudentSectionPath,
  getStudentCourseMaterials,
  getStudentCourses,
  requireStudentRouteContext,
} from "@/lib/studentDashboard";

type StudentCourseMaterialsPageProps = {
  params: Promise<{
    slug: string;
    courseId: string;
  }>;
};

function isStorageMaterial(value: string | null) {
  return Boolean(value?.includes("/storage/v1/object/public/course-materials/"));
}

function getSafeResourceUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async function StudentCourseMaterialsPage({
  params,
}: StudentCourseMaterialsPageProps) {
  const { slug, courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (!Number.isInteger(parsedCourseId)) {
    notFound();
  }

  const [context, coursesResult, materialsResult] = await Promise.all([
    requireStudentRouteContext(slug),
    getStudentCourses(slug),
    getStudentCourseMaterials(slug, parsedCourseId),
  ]);

  const course = coursesResult.data.find((item) => item.id === parsedCourseId);

  if (!course) {
    notFound();
  }

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatStudentHomePath(context.slug) },
          { label: "Cursos", href: formatStudentSectionPath(context.slug, "cursos") },
          { label: course.course_name, href: formatStudentCoursePath(context.slug, course.id) },
          { label: "Materiales" },
        ]}
        title={`Materiales de ${course.course_name}`}
        description="Recursos publicados por el equipo docente para esta materia."
        action={
          <CTAButton href={formatStudentCoursePath(context.slug, course.id)} ctaVariant="secondary" size="md">
            ← Volver al curso
          </CTAButton>
        }
      />

      {materialsResult.data.length > 0 ? (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          {materialsResult.data.map((material) => {
            const resourceUrl = getSafeResourceUrl(material.resource_url);
            const isDownloadableFile = isStorageMaterial(resourceUrl);

            return (
              <Card key={material.id} withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
                <Stack gap="md">
                <Stack gap="xs">
                  <Badge variant="light" color="brand.7" radius="xl" leftSection={<IconFileText size={14} />}>
                    {material.material_type || "Recurso"}
                  </Badge>
                  <Title order={3} c="brand.7">{material.title}</Title>
                  <Text size="sm" c="dimmed">
                    Publicado {formatDate(material.created_at) ?? "sin fecha"}
                  </Text>
                </Stack>

                <RichTextViewer value={material.description} />

                  {resourceUrl ? (
                    <Button
                      component="a"
                      href={resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      color="brand.7"
                      radius="xl"
                      leftSection={isDownloadableFile ? <IconDownload size={18} /> : <IconExternalLink size={18} />}
                    >
                      {isDownloadableFile ? "Descargar archivo" : "Abrir enlace externo"}
                    </Button>
                  ) : null}
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      ) : (
        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="md" align="flex-start">
            <Title order={3} c="brand.7">Todavía no hay materiales</Title>
            <Text c="dimmed">Cuando el docente publique recursos, van a aparecer en esta sección.</Text>
            <CTAButton href={formatStudentCoursePath(context.slug, course.id)} ctaVariant="secondary">
              Volver al curso
            </CTAButton>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
