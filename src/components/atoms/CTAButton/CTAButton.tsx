"use client";

import type {
  ComponentProps,
  MouseEventHandler,
  ReactNode,
} from "react";
import Link from "next/link";
import { Button, type ButtonProps } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";

import { useStyles } from "./CTAButton.style";

type CTAButtonVariant = "primary" | "secondary" | "outline";
type CTAButtonIconPosition = "left" | "right";
type LinkHref = string;

type CTAButtonBaseProps = Omit<
  ButtonProps,
  "leftSection" | "rightSection"
> & {
  ctaVariant?: CTAButtonVariant;
  icon?: ReactNode;
  iconPosition?: CTAButtonIconPosition;
  className?: string;
  children?: ReactNode;
};

type CTAButtonLinkProps = CTAButtonBaseProps & {
  href: LinkHref;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type CTAButtonActionProps = CTAButtonBaseProps & {
  href?: LinkHref;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: ComponentProps<"button">["type"];
};

type CTAButtonProps = CTAButtonLinkProps | CTAButtonActionProps;

const variantConfig: Record<
  CTAButtonVariant,
  Pick<ButtonProps, "variant" | "color" | "radius" | "size">
> = {
  primary: {
    variant: "filled",
    color: "brand.7",
    radius: "xl",
    size: "xl",
  },
  secondary: {
    variant: "subtle",
    color: "brand.8",
    radius: "xl",
    size: "xl",
  },
  outline: {
    variant: "outline",
    color: "brand.7",
    radius: "xl",
    size: "xl",
  },
};

export function CTAButton({
  ctaVariant = "primary",
  icon,
  iconPosition = "left",
  className,
  children,
  href,
  onClick,
  ...props
}: CTAButtonProps) {
  const { classes, cx } = useStyles();
  const resolvedIcon = icon ?? (ctaVariant === "primary" ? <IconSend size={16} /> : null);
  const buttonClassName = cx(
    classes.root,
    props.fullWidth && classes.fullWidth,
    ctaVariant === "primary"
      ? classes.primary
      : ctaVariant === "outline"
        ? classes.outline
        : classes.secondary,
    resolvedIcon && classes.withIcon,
    className,
  );
  const content = (
    <span
      className={cx(
        classes.content,
        iconPosition === "right" ? classes.contentRight : classes.contentLeft,
      )}
    >
      {resolvedIcon ? <span className={classes.icon}>{resolvedIcon}</span> : null}
      <span className={classes.label}>{children}</span>
    </span>
  );

  if (href) {
    const linkOnClick = onClick as MouseEventHandler<HTMLAnchorElement> | undefined;

    if (href.startsWith("/") || href.startsWith("#")) {
      return (
        <Button
          {...variantConfig[ctaVariant]}
          component={Link}
          href={href}
          onClick={linkOnClick}
          {...props}
          className={buttonClassName}
        >
          {content}
        </Button>
      );
    }

    return (
      <Button
        {...variantConfig[ctaVariant]}
        component="a"
        href={href}
        onClick={linkOnClick}
        {...props}
        className={buttonClassName}
      >
        {content}
      </Button>
    );
  }

  const buttonOnClick = onClick as MouseEventHandler<HTMLButtonElement> | undefined;

  return (
    <Button
      {...variantConfig[ctaVariant]}
      onClick={buttonOnClick}
      {...props}
      className={buttonClassName}
    >
      {content}
    </Button>
  );
}

export default CTAButton;
