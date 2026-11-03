"use client";

import { useState, type ComponentProps, type Key, type ReactNode } from "react";
import { Table, LoadingOverlay, Box, Stack, Text, Loader } from "@mantine/core";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { useMediaQuery } from "@mantine/hooks";

import { useStyles } from "./ResponsiveDataTable.style";
import { TablePaginationFooter } from "./TablePaginationFooter";

type ResponsiveTableProps = Omit<ComponentProps<typeof Table>, "children">;
type ResponsiveTableHeaderProps = Omit<ComponentProps<typeof Table.Th>, "children">;
type ResponsiveTableCellProps = Omit<ComponentProps<typeof Table.Td>, "children">;
type ResponsiveScrollContainerProps = Omit<
  ComponentProps<typeof Table.ScrollContainer>,
  "children" | "minWidth"
>;

export type ResponsiveDataTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  mobileMinWidth?: number;
  noWrap?: boolean;
  headerProps?: ResponsiveTableHeaderProps;
  cellProps?: ResponsiveTableCellProps | ((item: T) => ResponsiveTableCellProps);
};

type ResponsiveDataTableProps<T> = {
  data: T[];
  columns: ResponsiveDataTableColumn<T>[];
  rowKey: (item: T) => Key;
  emptyMessage: ReactNode;
  loading?: boolean;
  mobileBreakpoint?: string;
  mobileMinWidth?: number;
  tableProps?: ResponsiveTableProps;
  scrollContainerProps?: ResponsiveScrollContainerProps;
  /**
   * Activa la paginación del lado del cliente. Evita montar cientos de filas
   * (y sus menús/badges) en el DOM cuando el listado crece.
   */
  pageSize?: number;
  /**
   * Callback opcional al hacer clic en una fila (permite abrir el detalle sin botón de acciones).
   */
  onRowClick?: (item: T) => void;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function ResponsiveDataTable<T>({
  data,
  columns,
  rowKey,
  emptyMessage,
  loading = false,
  mobileBreakpoint = "48em",
  mobileMinWidth,
  tableProps,
  scrollContainerProps,
  pageSize,
  onRowClick,
}: ResponsiveDataTableProps<T>) {
  const { classes } = useStyles();
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint})`);
  const resolvedMobileMinWidth =
    mobileMinWidth ?? columns.reduce((sum, column) => sum + (column.mobileMinWidth ?? 160), 0);

  // Si cambia el dataset (filtros, búsqueda, recarga) se vuelve a la página 1.
  // Ajuste durante el render (patrón recomendado por React) en lugar de un useEffect.
  const [pagination, setPagination] = useState({ page: 1, source: data });
  if (pagination.source !== data) {
    setPagination({ page: 1, source: data });
  }

  const isPaginated = typeof pageSize === "number" && pageSize > 0;
  const totalPages = isPaginated ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const currentPage = Math.min(pagination.page, totalPages);
  const visibleData = isPaginated
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;
  const showPagination = isPaginated && data.length > pageSize;

  const { style: tableStyle, ...tablePropsRest } = tableProps ?? {};

  const table = (
    <Box pos="relative" style={{ width: "100%" }}>
      <LoadingOverlay
        visible={loading}
        zIndex={10}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{
          children: (
            <Stack align="center" justify="center" gap="md">
              <Box style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
                <Image
                  src={logo}
                  alt="Cargando..."
                  width={100}
                  height={76}
                  priority
                  style={{
                    width: "clamp(70px, 6vw, 100px)",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>
              <Text size="xs" fw={500} c="brand.7" ta="center">
                Actualizando datos...
              </Text>
              <Loader color="brand.7" size="sm" type="dots" />
            </Stack>
          ),
        }}
      />
      <Table
        highlightOnHover
        {...tablePropsRest}
        className={classes.table}
        style={{ width: "100%", tableLayout: isMobile ? undefined : "auto", ...tableStyle }}
      >
      <Table.Thead>
        <Table.Tr>
          {columns.map((column) => {
            const headerProps = column.headerProps ?? {};
            const { className, ...headerPropsRest } = headerProps;

            return (
              <Table.Th
                key={column.key}
                {...headerPropsRest}
                miw={headerProps.miw ?? (isMobile ? column.mobileMinWidth : undefined)}
                className={joinClassNames(
                  classes.headCell,
                  column.noWrap && classes.noWrap,
                  className,
                )}
              >
                {column.header}
              </Table.Th>
            );
          })}
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {visibleData.map((item) => {
          const resolvedRowKey = rowKey(item);

          return (
            <Table.Tr
              key={resolvedRowKey}
              className={joinClassNames(classes.row, Boolean(onRowClick) && classes.clickableRow)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column) => {
                const cellProps =
                  typeof column.cellProps === "function"
                    ? column.cellProps(item)
                    : (column.cellProps ?? {});
                const { className, ...cellPropsRest } = cellProps;

                return (
                  <Table.Td
                    key={`${String(resolvedRowKey)}-${column.key}`}
                    {...cellPropsRest}
                    miw={cellProps.miw ?? (isMobile ? column.mobileMinWidth : undefined)}
                    className={joinClassNames(
                      classes.cell,
                      column.noWrap && classes.noWrap,
                      className,
                    )}
                  >
                    {column.render(item)}
                  </Table.Td>
                );
              })}
            </Table.Tr>
          );
        })}

        {!loading && data.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={columns.length} className={classes.emptyCell}>
              {emptyMessage}
            </Table.Td>
          </Table.Tr>
        ) : null}
      </Table.Tbody>
    </Table>
    </Box>
  );

  const footer = showPagination ? (
    <TablePaginationFooter
      page={currentPage}
      totalPages={totalPages}
      totalItems={data.length}
      pageSize={pageSize ?? data.length}
      onPageChange={(page) => setPagination({ page, source: data })}
    />
  ) : null;

  if (!isMobile) {
    return (
      <>
        {table}
        {footer}
      </>
    );
  }

  return (
    <>
      <Table.ScrollContainer
        minWidth={resolvedMobileMinWidth}
        {...scrollContainerProps}
      >
        {table}
      </Table.ScrollContainer>
      {footer}
    </>
  );
}
