import { Container, type ContainerProps } from "@mantine/core";

type PaddingContainerProps = ContainerProps;

const defaultHorizontalPadding = {
  base: "layoutInsetXs",
  md: "layoutInsetMd",
} as const;

export function PaddingContainer({
  children,
  size = "xl",
  px = defaultHorizontalPadding,
  ...props
}: PaddingContainerProps) {
  return (
    <Container size={size} px={px} w="100%" miw={0} {...props}>
      {children}
    </Container>
  );
}

export default PaddingContainer;
