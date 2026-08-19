"use client";

import Link from "next/link";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { Button, Divider, Menu } from "@mantine/core";
import { IconChevronDown, type IconProps } from "@tabler/icons-react";

import { useStyles } from "./ActionsMenu.style";

type ActionsMenuItem = {
  key: string;
  label?: string;
  icon?: ComponentType<IconProps>;
  href?: ComponentProps<typeof Link>["href"];
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  section?: ReactNode;
  divider?: boolean;
};

type ActionsMenuProps = {
  label?: string;
  items: ActionsMenuItem[];
};

export function ActionsMenu({ label = "Acciones", items }: ActionsMenuProps) {
  const { classes, cx } = useStyles();

  const visibleItems = items.filter((item) => item.divider || item.section || item.label);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <Menu position="bottom-end" withArrow shadow="md" withinPortal>
      <Menu.Target>
        <Button
          type="button"
          variant="subtle"
          radius="xl"
          rightSection={<IconChevronDown size={16} stroke={1.8} />}
          className={classes.trigger}
        >
          {label}
        </Button>
      </Menu.Target>

      <Menu.Dropdown className={classes.dropdown}>
        {visibleItems.map((item) => {
          if (item.divider) {
            return <Divider key={item.key} my="xs" />;
          }

          if (item.section) {
            return <Menu.Label key={item.key}>{item.section}</Menu.Label>;
          }

          const Icon = item.icon;

          if (item.href) {
            return (
              <Menu.Item
                key={item.key}
                component={Link}
                href={item.href}
                leftSection={Icon ? <Icon size={16} stroke={1.9} /> : null}
                onClick={item.onClick}
                disabled={item.disabled}
                className={cx(classes.item, item.danger && classes.itemDanger)}
              >
                {item.label}
              </Menu.Item>
            );
          }

          return (
            <Menu.Item
              key={item.key}
              leftSection={Icon ? <Icon size={16} stroke={1.9} /> : null}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cx(classes.item, item.danger && classes.itemDanger)}
            >
              {item.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}

export type { ActionsMenuItem, ActionsMenuProps };

export default ActionsMenu;
