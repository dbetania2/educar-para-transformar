"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Box,
  Burger,
  Button,
  Collapse,
  Drawer,
  Group,
  List,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronDown, type Icon, type IconLogout } from "@tabler/icons-react";

import { AdminDrawerItem, CTAButton, PaddingContainer } from "@/components/atoms";
import { ActionsMenu, type ActionsMenuItem } from "@/components/molecules";

import { useStyles } from "./RoleDashboardShell.style";

export type RoleDashboardNavigationChild = {
  href: string;
  label: string;
};

export type RoleDashboardNavigationItem = {
  href: string;
  label: string;
  icon: Icon;
  exact?: boolean;
  children?: RoleDashboardNavigationChild[];
};

type RoleDashboardShellProps = {
  children: React.ReactNode;
  footer?: ReactNode;
  title: string;
  subtitle: string;
  menuAriaLabel: string;
  navigation: RoleDashboardNavigationItem[];
  logoutAction: {
    label: string;
    confirmLabel: string;
    description: string;
    redirectPath: string;
    icon: typeof IconLogout;
  };
  topBarActions?: ActionsMenuItem[];
  topBarActionsLabel?: string;
  topBarSlot?: ReactNode;
};

function isActivePath(currentPathname: string, href: string, exact = false) {
  if (exact) {
    return currentPathname === href;
  }

  return currentPathname === href || currentPathname.startsWith(`${href}/`);
}

export default function RoleDashboardShell({
  children,
  footer,
  title,
  subtitle,
  menuAriaLabel,
  navigation,
  logoutAction,
  topBarActions = [],
  topBarActionsLabel,
  topBarSlot,
}: RoleDashboardShellProps) {
  const { classes } = useStyles();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpened, setMenuOpened] = useState(false);
  const [expandedNavItems, setExpandedNavItems] = useState<Record<string, boolean>>({});
  const [logoutModalOpened, setLogoutModalOpened] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/logout", { method: "POST" }).catch(() => null);
    setLogoutModalOpened(false);
    setMenuOpened(false);
    router.push(logoutAction.redirectPath);
    router.refresh();
    setIsLoggingOut(false);
  };

  const resolvedTopBarActions: ActionsMenuItem[] = [...topBarActions];

  if (resolvedTopBarActions.length > 0) {
    resolvedTopBarActions.push({ key: "divider-main", divider: true });
  }

  resolvedTopBarActions.push({
    key: "logout",
    label: logoutAction.label,
    icon: logoutAction.icon,
    onClick: () => setLogoutModalOpened(true),
    danger: true,
  });

  return (
    <Box className={classes.shell}>
      <Modal
        opened={logoutModalOpened}
        onClose={() => !isLoggingOut && setLogoutModalOpened(false)}
        title={logoutAction.label}
        centered
        radius="xl"
      >
        <Stack gap="lg">
          <Text c="dimmed">{logoutAction.description}</Text>

          <Stack gap="sm" className={classes.logoutActions}>
            <Button
              leftSection={<logoutAction.icon size={18} />}
              color="adminDanger"
              radius="xl"
              size="xl"
              fullWidth
              onClick={handleLogout}
              loading={isLoggingOut}
              className={classes.logoutDangerButton}
            >
              {logoutAction.confirmLabel}
            </Button>
            <CTAButton
              ctaVariant="secondary"
              fullWidth
              onClick={() => setLogoutModalOpened(false)}
              disabled={isLoggingOut}
            >
              Cancelar
            </CTAButton>
          </Stack>
        </Stack>
      </Modal>

      <Drawer
        opened={menuOpened}
        onClose={() => setMenuOpened(false)}
        title="Menú"
        position="left"
        size={320}
        padding="md"
      >
        <Stack className={classes.drawerBody}>
          <Box className={classes.navPanel}>
            {navigation.map((item) => {
              const isActive = isActivePath(pathname, item.href, item.exact);
              const childItems = item.children ?? [];

              if (childItems.length > 0) {
                const isExpanded = expandedNavItems[item.href] ?? isActive;

                return (
                  <Box key={item.href} className={classes.navGroup}>
                    <AdminDrawerItem
                      label={item.label}
                      icon={item.icon}
                      isActive={isActive}
                      onClick={() => setExpandedNavItems((current) => ({
                        ...current,
                        [item.href]: !(current[item.href] ?? isActive),
                      }))}
                      className={classes.navButton}
                      activeClassName={classes.navButtonActive}
                      iconClassName={classes.navIconWrap}
                      labelClassName={classes.navItemTitle}
                      chevronClassName={isExpanded ? `${classes.navChevron} ${classes.navChevronOpen}` : classes.navChevron}
                      chevronIcon={IconChevronDown}
                    />
                    <Collapse in={isExpanded}>
                      <List listStyleType="none" spacing={0} className={classes.navChildren}>
                        {childItems.map((child) => (
                          <List.Item key={child.href} className={classes.navChildItem}>
                            <Box
                              component="a"
                              href={child.href}
                              onClick={() => setMenuOpened(false)}
                              className={isActivePath(pathname, child.href, true) ? `${classes.navChildLink} ${classes.navChildLinkActive}` : classes.navChildLink}
                            >
                              {child.label}
                            </Box>
                          </List.Item>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                );
              }

              return (
                <AdminDrawerItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive}
                  onClick={() => setMenuOpened(false)}
                  className={classes.navButton}
                  activeClassName={classes.navButtonActive}
                  iconClassName={classes.navIconWrap}
                  labelClassName={classes.navItemTitle}
                  chevronClassName={classes.navChevron}
                />
              );
            })}
          </Box>
        </Stack>
      </Drawer>

      <Box component="header" className={classes.topBar}>
        <PaddingContainer size="xl" className={classes.topBarInner}>
          <Group justify="space-between" w="100%" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Burger
                opened={menuOpened}
                onClick={() => setMenuOpened((current) => !current)}
                size="sm"
                aria-label={menuAriaLabel}
              />
              <Box>
                <Title order={4} className={classes.brand}>
                  {title}
                </Title>
                <Text size="sm" className={classes.brandSubtle}>
                  {subtitle}
                </Text>
              </Box>
            </Group>

            <Group gap="xs" wrap="nowrap">
              {topBarSlot}
              <ActionsMenu label={topBarActionsLabel} items={resolvedTopBarActions} />
            </Group>
          </Group>
        </PaddingContainer>
      </Box>

      <Box className={classes.content}>
        <PaddingContainer size="xl" className={classes.contentInner}>
          {children}
        </PaddingContainer>
      </Box>

      {footer ? <Box component="footer">{footer}</Box> : null}
    </Box>
  );
}
