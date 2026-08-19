"use client";

import Link from "next/link";
import { Anchor } from "@mantine/core";

type BreadcrumbTrailLinkProps = {
  href: string;
  label: string;
};

export function BreadcrumbTrailLink({ href, label }: BreadcrumbTrailLinkProps) {
  return (
    <Anchor component={Link} href={href} size="sm" c="dimmed" underline="never" fw={500}>
      {label}
    </Anchor>
  );
}

export default BreadcrumbTrailLink;
