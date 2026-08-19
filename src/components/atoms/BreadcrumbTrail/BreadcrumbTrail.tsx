import {
  Breadcrumbs as MantineBreadcrumbs,
  Text,
  type BreadcrumbsProps,
} from "@mantine/core";

import { BreadcrumbTrailLink } from "./BreadcrumbTrailLink";

export type BreadcrumbTrailItem = {
  label: string;
  href?: string;
};

export type BreadcrumbTrailProps = Omit<BreadcrumbsProps, "children"> & {
  items: BreadcrumbTrailItem[];
};

export function BreadcrumbTrail({ items, ...props }: BreadcrumbTrailProps) {
  return (
    <MantineBreadcrumbs {...props}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.href) {
          return (
            <Text
              key={`${item.label}-${index}`}
              size="sm"
              c={isLast ? "brand.7" : "dimmed"}
              fw={isLast ? 600 : 500}
            >
              {item.label}
            </Text>
          );
        }

        return (
          <BreadcrumbTrailLink
            key={`${item.label}-${index}`}
            href={item.href}
            label={item.label}
          />
        );
      })}
    </MantineBreadcrumbs>
  );
}

export default BreadcrumbTrail;
