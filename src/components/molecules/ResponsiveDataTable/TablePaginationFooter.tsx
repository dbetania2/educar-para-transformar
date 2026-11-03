"use client";

import { Group, Pagination, Text } from "@mantine/core";

import { useStyles } from "./ResponsiveDataTable.style";

type TablePaginationFooterProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function TablePaginationFooter({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: TablePaginationFooterProps) {
  const { classes } = useStyles();
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <Group justify="space-between" wrap="wrap" gap="xs" className={classes.paginationFooter}>
      <Text size="sm" c="#64748b" aria-live="polite">
        Mostrando {firstItem}–{lastItem} de {totalItems}
      </Text>
      <Pagination
        value={page}
        onChange={onPageChange}
        total={totalPages}
        size="sm"
        radius="md"
        siblings={1}
        withEdges
        getControlProps={(control) => ({
          "aria-label":
            control === "first"
              ? "Primera página"
              : control === "last"
                ? "Última página"
                : control === "next"
                  ? "Página siguiente"
                  : "Página anterior",
        })}
      />
    </Group>
  );
}

