"use client";

import { Box, Button, Menu, Stack, Text, TextInput } from "@mantine/core";
import { IconChevronDown, IconPlus, IconRefresh, IconSearch } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { PageHeader, type PageHeaderBreadcrumbItem } from "@/components/molecules/PageHeader/PageHeader";
import { useStyles } from "./AdminListTemplate.style";

export type AdminListTemplateProps = {
  title: string;
  description: string;
  breadcrumbs?: PageHeaderBreadcrumbItem[];
  createButtonLabel?: string;
  onCreate?: () => void;
  onRefresh?: () => void;
  searchProps?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filtersSlot?: ReactNode;
  statsSlot?: ReactNode;
  tableFooterSlot?: ReactNode;
  children: ReactNode;
};

export function AdminListTemplate({
  title,
  description,
  breadcrumbs,
  createButtonLabel = "Nuevo",
  onCreate,
  onRefresh,
  searchProps,
  filtersSlot,
  statsSlot,
  tableFooterSlot,
  children,
}: AdminListTemplateProps) {
  const { classes } = useStyles();

  return (
    <Stack gap="pageGapSm" className={classes.page}>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      />

      {statsSlot}

      <Box className={classes.rainbowCard}>
        <Box className={classes.filterRow}>
          {searchProps ? (
            <TextInput
              label="Buscar"
              placeholder={searchProps.placeholder ?? "Buscar..."}
              value={searchProps.value}
              onChange={(event) => searchProps.onChange(event.currentTarget.value)}
              leftSection={<IconSearch size={16} color="#94a3b8" />}
              className={classes.searchInput}
            />
          ) : null}

          {filtersSlot}

          {onCreate ? (
            <Button
              className={classes.createBtn}
              leftSection={<IconPlus size={16} />}
              onClick={onCreate}
            >
              {createButtonLabel}
            </Button>
          ) : null}
        </Box>
      </Box>

      <Box className={classes.tableCard}>
        {children}
        {tableFooterSlot}
      </Box>
    </Stack>
  );
}
