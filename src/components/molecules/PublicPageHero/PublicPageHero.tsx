import type { ReactNode } from "react";
import {
  Badge,
  Card,
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

type PublicPageHeroAsideItem = {
  icon: ReactNode;
  title?: string;
  description: string;
};

type PublicPageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  badges?: string[];
  titleMaxWidth?: number;
  asideItems?: PublicPageHeroAsideItem[];
};

export function PublicPageHero({
  eyebrow,
  title,
  description,
  badges = [],
  titleMaxWidth = 680,
  asideItems = [],
}: PublicPageHeroProps) {
  return (
    <Card
      radius="xl"
      p={{ base: "cardPadSm", md: "cardPadLg" }}
      bg="linear-gradient(135deg, var(--mantine-color-blue-2) 0%, var(--mantine-color-brand-7) 55%, var(--mantine-color-brand-6) 100%)"
    >
      <Grid gutter="xl" align="stretch">
        <GridCol span={{ base: 12, lg: 7 }}>
          <Stack gap="blockGapLg">
            <Badge variant="white" color="brand.7" radius="xl" size="lg" w="fit-content">
              {eyebrow}
            </Badge>

            <Title component="h1" c="white" maw={titleMaxWidth}>
              {title}
            </Title>

            <Text size="lg" c="blue.0" maw={760}>
              {description}
            </Text>

            {badges.length > 0 ? (
              <Group gap="sm">
                {badges.map((badge) => (
                  <Badge key={badge} variant="white" color="brand.7" radius="xl">
                    {badge}
                  </Badge>
                ))}
              </Group>
            ) : null}
          </Stack>
        </GridCol>

        {asideItems.length > 0 ? (
          <GridCol span={{ base: 12, lg: 5 }}>
            <Card
              radius="xl"
              p={{ base: "cardPadSm", md: "cardPadLg" }}
              bg="rgba(255,255,255,0.14)"
              h="100%"
            >
              <Stack gap="blockGapLg" h="100%" justify="space-between">
                {asideItems.map((item) => (
                  <Group key={(item.title ?? item.description)} align="flex-start" wrap="wrap" gap="sm">
                    <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                      {item.icon}
                    </ThemeIcon>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      {item.title ? (
                        <Text fw={700} c="white">
                          {item.title}
                        </Text>
                      ) : null}
                      <Text size="sm" c="blue.0" mt={item.title ? 4 : 0}>
                        {item.description}
                      </Text>
                    </div>
                  </Group>
                ))}
              </Stack>
            </Card>
          </GridCol>
        ) : null}
      </Grid>
    </Card>
  );
}

export default PublicPageHero;
