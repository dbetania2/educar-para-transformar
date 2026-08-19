import type { ReactNode } from "react";
import { Box, Group, Text, Title } from "@mantine/core";

import {
  BreadcrumbTrail,
  type BreadcrumbTrailItem,
} from "@/components/atoms";

export type PageHeaderBreadcrumbItem = BreadcrumbTrailItem;

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: PageHeaderBreadcrumbItem[];
  action?: ReactNode;
};

export function PageHeader({ title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <Box>
      {breadcrumbs?.length ? (
        <BreadcrumbTrail
          items={breadcrumbs}
          separator="/"
          separatorMargin="xs"
          mb={4}
        />
      ) : null}

      <Group justify="space-between" align="flex-start" gap="lg" wrap="wrap">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Title component="h1">{title}</Title>

          {description ? (
            <Text size="md" mt={4} c="dimmed">
              {description}
            </Text>
          ) : null}
        </Box>

        {action ? <Box>{action}</Box> : null}
      </Group>
    </Box>
  );
}

export default PageHeader;
