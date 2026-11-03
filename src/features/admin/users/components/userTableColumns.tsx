"use client";

import { Box, Stack, Text } from "@mantine/core";
import { IconCalendar, IconClock } from "@tabler/icons-react";

import { StatusToneBadge } from "@/components/atoms";
import { RoleBadge, type ResponsiveDataTableColumn } from "@/components/molecules";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import type { AdminUser } from "../types";

type AdminUsersTableClasses = Record<string, string>;

export function getAdminUserTableColumns(params: {
  classes: AdminUsersTableClasses;
}): ResponsiveDataTableColumn<AdminUser>[] {
  const { classes } = params;

  return [
    {
      key: "name",
      header: <Text className={classes.tableHeader}>USUARIO</Text>,
      mobileMinWidth: 260,
      render: (user) => {
        return (
          <Box className={classes.userCell}>
            <Stack gap={2} className={classes.userTextStack}>
              <Text className={classes.userPrimary}>{user.fullName || "Sin nombre"}</Text>
              <Text className={classes.userSecondary}>{user.email}</Text>
              <Text className={classes.userId}>{user.legajo ?? user.id}</Text>
            </Stack>
          </Box>
        );
      },
    },
    {
      key: "role",
      header: <Text className={classes.tableHeader}>ROL</Text>,
      mobileMinWidth: 150,
      noWrap: true,
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: "status",
      header: <Text className={classes.tableHeader}>ESTADO</Text>,
      mobileMinWidth: 130,
      noWrap: true,
      render: (user) => {
        const isInactive = user.status === "inactivo" || user.isActive === false;
        return (
          <StatusToneBadge tone={isInactive ? "danger" : "success"}>
            {isInactive ? "Inactivo" : "Activo"}
          </StatusToneBadge>
        );
      },
    },
    {
      key: "created",
      header: <Text className={classes.tableHeader}>ALTA</Text>,
      mobileMinWidth: 180,
      noWrap: true,
      render: (user) => (
        <Box className={classes.dateCell}>
          <IconCalendar size={15} style={{ color: "#94a3b8" }} />
          <span>{formatDateTime(user.createdAt)}</span>
        </Box>
      ),
    },
    {
      key: "last-sign-in",
      header: <Text className={classes.tableHeader}>ÚLTIMO ACCESO</Text>,
      mobileMinWidth: 180,
      noWrap: true,
      render: (user) => {
        if (!user.lastSignInAt) {
          return (
            <Box className={classes.noRecordCell}>
              <span className={classes.greenDot} />
              <span>Sin registro</span>
            </Box>
          );
        }

        return (
          <Box className={classes.dateCell}>
            <IconClock size={15} style={{ color: "#94a3b8" }} />
            <span>{formatDateTime(user.lastSignInAt)}</span>
          </Box>
        );
      },
    },
  ];
}

