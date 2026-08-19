import { Card, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";

import { PageHeader, type PageHeaderBreadcrumbItem } from "@/components/molecules";

type RouteSectionLoaderProps = {
  title: string;
  description?: string;
  loadingLabel: string;
  breadcrumbs?: PageHeaderBreadcrumbItem[];
};

export function RouteSectionLoader({
  title,
  description,
  loadingLabel,
  breadcrumbs,
}: RouteSectionLoaderProps) {
  return (
    <Stack gap="pageGapLg">
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
            <Stack gap="sm">
              <Skeleton height={46} circle width={46} />
              <Skeleton height={16} width="32%" radius="xl" />
              <Skeleton height={34} width="48%" radius="md" />
              <Skeleton height={12} width="88%" radius="xl" />
              <Skeleton height={12} width="72%" radius="xl" />
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="md">
            <Skeleton height={26} width="42%" radius="md" />
            <Skeleton height={12} width="82%" radius="xl" />
            <Skeleton height={12} width="74%" radius="xl" />
            <Skeleton height={52} radius="lg" />
            <Skeleton height={52} radius="lg" />
            <Skeleton height={52} radius="lg" />
          </Stack>
        </Card>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="md">
            <Skeleton height={26} width="46%" radius="md" />
            <Skeleton height={12} width="78%" radius="xl" />
            <Skeleton height={12} width="68%" radius="xl" />
            <Skeleton height={14} width="90%" radius="xl" />
            <Skeleton height={14} width="84%" radius="xl" />
            <Skeleton height={14} width="72%" radius="xl" />
          </Stack>
        </Card>
      </SimpleGrid>

      <Text c="dimmed">{loadingLabel}</Text>
    </Stack>
  );
}

export default RouteSectionLoader;
