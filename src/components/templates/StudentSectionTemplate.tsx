import type { CSSProperties, ReactNode } from "react";
import type { TablerIcon } from "@tabler/icons-react";
import { Box, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";

import { PageHeader } from "@/components/molecules";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Highlight = {
  label: string;
  value: string;
  description: string;
  icon: TablerIcon;
};

type SectionBlock = {
  title: string;
  description: string;
  items: string[];
};

type StudentSectionTemplateProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description: string;
  highlights: Highlight[];
  sections: SectionBlock[];
  children?: ReactNode;
};

export default function StudentSectionTemplate({
  breadcrumbs,
  title,
  description,
  highlights,
  sections,
  children,
}: StudentSectionTemplateProps) {
  const useTwoColumns = sections.length > 1;

  return (
    <Stack gap="pageGapLg">
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
              <Stack gap="sm">
                <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
                  <Icon size={22} stroke={1.8} />
                </ThemeIcon>
                <Text size="sm" fw={700} c="dimmed">{item.label}</Text>
                <Title order={2} c="brand.7">{item.value}</Title>
                <Text size="sm" c="dimmed">{item.description}</Text>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>

      {sections.length > 0 ? (
        <SimpleGrid cols={{ base: 1, md: useTwoColumns ? 2 : 1 }} spacing="lg">
          {sections.map((section, index) => {
            const isOddLastItem = useTwoColumns && sections.length % 2 !== 0 && index === sections.length - 1;
            const cardStyle: CSSProperties | undefined = isOddLastItem ? { gridColumn: "1 / -1" } : undefined;

            return (
              <Card
                key={section.title}
                withBorder
                radius="xl"
                p={{ base: "cardPadSm", md: "cardPadLg" }}
                bg="white"
                style={cardStyle}
              >
                <Stack gap="md">
                  <Box>
                    <Title order={3} c="brand.7">{section.title}</Title>
                    <Text size="sm" c="dimmed" mt={4}>{section.description}</Text>
                  </Box>
                  <Stack gap="xs">
                    {section.items.map((item) => (
                      <Group key={item} gap="sm" align="flex-start" wrap="nowrap">
                        <ThemeIcon size={24} radius="xl" variant="light" color="brand.1" c="brand.7">
                          <span>•</span>
                        </ThemeIcon>
                        <Text>{item}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      ) : null}

      {children}
    </Stack>
  );
}
