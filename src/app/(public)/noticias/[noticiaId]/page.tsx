import { Card, Stack, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { notFound } from "next/navigation";

import { CTAButton, PaddingContainer } from "@/components/atoms";
import { RichTextViewer } from "@/components/molecules";
import { getPublishedNewsById } from "@/lib/news";

export const dynamic = "force-dynamic";

type NewsDetailPageProps = {
  params: Promise<{
    noticiaId: string;
  }>;
};

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { noticiaId } = await params;
  const news = await getPublishedNewsById(noticiaId);

  if (!news) {
    notFound();
  }

  return (
    <PaddingContainer py={{ base: "pagePadSm", md: "pagePadLg" }}>
      <Stack gap="pageGapLg">
        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sectionGapLg">
            <Title order={1} c="brand.7">{news.title}</Title>

            {news.imageUrl ? (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  maxHeight: 520,
                  borderRadius: 16,
                  backgroundImage: "url(" + news.imageUrl + ")",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
            ) : null}

            <RichTextViewer value={news.descriptionHtml} />

            <CTAButton href="/noticias" ctaVariant="secondary" icon={<IconArrowLeft size={18} />} size="md" w="fit-content">
              Volver
            </CTAButton>
          </Stack>
        </Card>
      </Stack>
    </PaddingContainer>
  );
}
