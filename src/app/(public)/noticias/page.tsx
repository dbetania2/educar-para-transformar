import NoticiasTemplate from "@/components/templates/NoticiasTemplate";
import { defaultData } from "@/hooks/useStaticData";
import { getPublishedNews } from "@/lib/news";

export const dynamic = "force-dynamic";

export default async function Noticias() {
  const publishedNews = await getPublishedNews();

  return <NoticiasTemplate {...defaultData.noticiasPage} publishedNews={publishedNews} />;
}
