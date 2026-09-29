"use client";

import { Card, Loader, Stack, Text, Box } from "@mantine/core";
import Image from "next/image";
import logo from "@/assets/logo.png";

import { PageHeader, type PageHeaderBreadcrumbItem } from "@/components/molecules/PageHeader/PageHeader";

type AdminPageLoaderProps = {
  title?: string;
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
    <Stack gap="pageGapSm" h="100%" flex={1}>
      {title ? (
        <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />
      ) : null}

      <Card withBorder radius="xl" p={{ base: "cardPadCompactLg", md: "cardPadSm" }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack align="center" justify="center" mih={280} gap="md">
          <Box style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
            <Image
              src={logo}
              alt="Cargando panel..."
              width={140}
              height={106}
              priority
              style={{
                width: "clamp(90px, 8vw, 120px)",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>
          <Text size="sm" fw={500} c="dimmed" ta="center" mt="xs">
            {loadingLabel}
          </Text>
          <style>{`
            @keyframes load-bar-gradient {
              0% { background-position: 0% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
          <Box
            w={160}
            h={4}
            mt={8}
            style={{
              borderRadius: 4,
              background: "linear-gradient(90deg, #7dd3fc, #6ee7b7, #fde047, #fdba74, #fca5a5, #f9a8d4, #c4b5fd, #7dd3fc)",
              backgroundSize: "200% 100%",
              animation: "load-bar-gradient 2.5s linear infinite",
            }}
          />
        </Stack>
      </Card>
    </Stack>
  );
}

export default AdminPageLoader;
