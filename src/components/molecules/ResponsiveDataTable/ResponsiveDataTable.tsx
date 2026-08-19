"use client";

import type { ComponentProps, Key, ReactNode } from "react";
import { Table } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import { useStyles } from "./ResponsiveDataTable.style";

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
}: ResponsiveDataTableProps<T>) {
  const { classes } = useStyles();
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint})`);
  const resolvedMobileMinWidth =
    mobileMinWidth ?? columns.reduce((sum, column) => sum + (column.mobileMinWidth ?? 160), 0);

  const { style: tableStyle, ...tablePropsRest } = tableProps ?? {};

  const table = (
    <Table
      striped
      highlightOnHover
      withTableBorder
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
        {data.map((item) => {
          const resolvedRowKey = rowKey(item);

          return (
            <Table.Tr key={resolvedRowKey} className={classes.row}>
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
  );

  if (!isMobile) {
    return table;
  }

  return (
    <Table.ScrollContainer
      minWidth={resolvedMobileMinWidth}
      {...scrollContainerProps}
    >
      {table}
    </Table.ScrollContainer>
  );
}
