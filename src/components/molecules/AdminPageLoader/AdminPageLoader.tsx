"use client";

import { Card, Loader, Stack, Text } from "@mantine/core";

import { PageHeader, type PageHeaderBreadcrumbItem } from "@/components/molecules/PageHeader/PageHeader";

type AdminPageLoaderProps = {
  title: string;
  loadingLabel: string;
  description?: string;
  breadcrumbs?: PageHeaderBreadcrumbItem[];
};

export function AdminPageLoader({
  title,
  loadingLabel,
  description,
  breadcrumbs,
}: AdminPageLoaderProps) {
  return (
    <Stack gap="pageGapSm">
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />

      <Card withBorder radius="xl" p={{ base: "cardPadCompactLg", md: "cardPadSm" }}>
        <Stack align="center" justify="center" mih={200} gap="sm">
          <Loader color="brand.7" size="md" />
          <Text c="dimmed">{loadingLabel}</Text>
        </Stack>
      </Card>
    </Stack>
  );
}

export default AdminPageLoader;
