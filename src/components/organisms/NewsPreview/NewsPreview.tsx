"use client";

import {
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { IconNews } from "@tabler/icons-react";
import type { NewsRecord } from "@/lib/news";
import { NewsCard } from "@/components/molecules/NewsCard/NewsCard"; // O desde "@/components/molecules" si aplicaste el index
import { useStyles } from "./NewsPreview.style";

type NewsPreviewProps = {
  publishedNews: NewsRecord[];
};

export function NewsPreview({ publishedNews }: NewsPreviewProps) {
  const { classes } = useStyles();

  return (
    <Stack gap="xl">
      {/* CABECERA (Se mantiene igual) */}
      <Group gap="md">
        <IconNews size={40} className={classes.icon} />

        <Stack gap={4}>
          <Title order={2} className={classes.title}>
            Últimas novedades
          </Title>

          <Text className={classes.description}>
            Conoce las noticias y actividades más recientes de nuestra institución.
          </Text>
        </Stack>
      </Group>

      <Grid gutter="lg" align="stretch">
        {publishedNews.slice(0, 3).map((item) => (
          <GridCol key={item.id} span={{ base: 12, md: 6, lg: 4 }}>
            <NewsCard news={item} />
          </GridCol>
        ))}
      </Grid>
    </Stack>
  );
}