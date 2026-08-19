import Link from "next/link";
import { forwardRef, type Ref } from "react";
import { Box, Group, Text } from "@mantine/core";
import { IconChevronRight, type Icon } from "@tabler/icons-react";

type AdminDrawerItemProps = {
  href?: string;
  label: string;
  icon: Icon;
  isActive?: boolean;
  onClick?: () => void;
  className: string;
  activeClassName?: string;
  iconClassName: string;
  labelClassName: string;
  chevronClassName: string;
  chevronIcon?: Icon;
};

export const AdminDrawerItem = forwardRef<HTMLAnchorElement | HTMLButtonElement, AdminDrawerItemProps>(function AdminDrawerItem({
  href,
  label,
  icon: IconComponent,
  isActive = false,
  onClick,
  className,
  activeClassName,
  iconClassName,
  labelClassName,
  chevronClassName,
  chevronIcon: ChevronIcon = IconChevronRight,
}, ref) {
  const itemClassName = isActive && activeClassName ? `${className} ${activeClassName}` : className;

  const content = (
    <Group justify="space-between" wrap="nowrap" gap="sm">
      <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
        <Box className={iconClassName}>
          <IconComponent size={18} stroke={1.9} />
        </Box>
        <Text fw={700} className={labelClassName} style={{ whiteSpace: "nowrap" }}>
          {label}
        </Text>
      </Group>
      <ChevronIcon size={18} stroke={1.8} className={chevronClassName} />
    </Group>
  );

  if (href) {
    return (
      <Link ref={ref as Ref<HTMLAnchorElement>} href={href} onClick={onClick} className={itemClassName}>
        {content}
      </Link>
    );
  }

  return (
    <Box ref={ref as Ref<HTMLButtonElement>} component="button" type="button" onClick={onClick} className={itemClassName}>
      {content}
    </Box>
  );
});

export default AdminDrawerItem;
