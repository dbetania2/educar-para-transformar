import { HomePage } from "@/components/templates/HomeTemplate";

import { getPublishedNews } from "@/lib/news";


export const dynamic = "force-dynamic";

export default async function Home() {


  const publishedNews = await getPublishedNews();



  return (

    <HomePage
      publishedNews={publishedNews}
    />

  );

}