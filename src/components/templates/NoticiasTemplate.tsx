"use client";



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


import {
  IconArticle,
  IconHeartHandshake,
  IconNews,
} from "@tabler/icons-react";


import { PaddingContainer } from "@/components/atoms";

import { NewsCard } from "@/components/molecules/NewsCard/NewsCard";


import type { StaticData } from "@/hooks/useStaticData";

import type { NewsRecord } from "@/lib/news";


import { useStyles } from "./NoticiasTemplate.style";



type NoticiasTemplateProps = StaticData["noticiasPage"] & {
  publishedNews: NewsRecord[];
};



export default function NoticiasTemplate({

  hero,

  featuredCategories,

  news,

  publishedNews,

}: NoticiasTemplateProps) {



  const { classes } = useStyles();



  const featuredNews = publishedNews.slice(0, 3);
  const remainingNews = publishedNews.slice(3);



  return (


    <PaddingContainer
      py={{
        base:"pagePadSm",
        md:"pagePadLg"
      }}
    >


      <Stack gap="pageGapLg">





        {/* hero */}

        <Card

          radius="xl"

          p={{
            base:"cardPadSm",
            md:"cardPadLg"
          }}

          bg="linear-gradient(135deg, var(--mantine-color-blue-2) 0%, var(--mantine-color-brand-7) 55%, var(--mantine-color-brand-6) 100%)"

        >



          <Grid
            gutter="xl"
            align="stretch"
          >



            <GridCol
              span={{
                base:12,
                lg:7
              }}
            >



              <Stack gap="blockGapLg">


                <Badge

                  variant="white"

                  color="brand.7"

                  radius="xl"

                  size="lg"

                  w="fit-content"

                >

                  Actualidad institucional

                </Badge>




                <Title

                  component="h1"

                  c="white"

                  maw={720}

                >

                  {hero.title}

                </Title>




                <Text

                  size="lg"

                  c="blue.0"

                  maw={760}

                >

                  {hero.description}

                </Text>




                <Group gap="sm">


                  {featuredCategories.map((category)=>(


                    <Badge

                      key={category}

                      variant="white"

                      color="brand.7"

                      radius="xl"

                    >

                      {category}

                    </Badge>


                  ))}



                </Group>



              </Stack>


            </GridCol>





            <GridCol

              span={{
                base:12,
                lg:5
              }}

            >



              <Card

                radius="xl"

                p={{
                  base:"cardPadSm",
                  md:"cardPadLg"
                }}

                bg="rgba(255,255,255,0.14)"

                h="100%"

              >



                <Stack

                  gap="blockGapLg"

                  h="100%"

                  justify="space-between"

                >



                  <Group

                    align="flex-start"

                    wrap="wrap"

                    gap="sm"

                  >



                    <ThemeIcon

                      size={44}

                      radius="xl"

                      variant="white"

                      color="brand.7"

                    >

                      <IconNews
                        size={22}
                        stroke={1.8}
                      />

                    </ThemeIcon>



                    <div className={classes.flexibleCopy}>


                      <Text

                        fw={700}

                        c="white"

                      >

                        Novedades que acompañan el crecimiento

                      </Text>



                      <Text

                        size="sm"

                        c="blue.0"

                        mt={4}

                      >

                        Compartimos avances institucionales, convocatorias y acciones que fortalecen la experiencia educativa.

                      </Text>


                    </div>



                  </Group>





                  <Group

                    align="flex-start"

                    wrap="wrap"

                    gap="sm"

                  >



                    <ThemeIcon

                      size={44}

                      radius="xl"

                      variant="white"

                      color="brand.7"

                    >

                      <IconHeartHandshake
                        size={22}
                        stroke={1.8}
                      />

                    </ThemeIcon>




                    <Text

                      size="sm"

                      c="blue.0"

                      className={classes.flexibleCopy}

                    >

                      El bienestar estudiantil forma parte central de nuestra propuesta: acompañamos lo académico, lo emocional y lo humano.

                    </Text>



                  </Group>




                </Stack>



              </Card>



            </GridCol>




          </Grid>



        </Card>







        {/* noticias */}


        <Card

          withBorder

          radius="xl"

          p={{
            base:"cardPadSm",
            md:"cardPadLg"
          }}

        >



          <Stack gap="sectionGapLg">





            <Group

              align="flex-start"

              wrap="wrap"

              gap="md"

            >



              <ThemeIcon

                size={48}

                radius="xl"

                variant="light"

                color="brand.6"

              >

                <IconArticle
                  size={24}
                  stroke={1.8}
                />

              </ThemeIcon>





              <div className={classes.flexibleCopy}>


                <Title

                  order={3}

                  c="brand.7"

                >

                  {news.title}

                </Title>



                <Text

                  size="sm"

                  c="dimmed"

                  mt={6}

                >

                  {news.description}

                </Text>



              </div>



            </Group>







            {publishedNews.length > 0 ? (



              <Stack gap="xl">



                <Grid

                  gutter="lg"

                  align="stretch"

                >



                  {featuredNews.map((item)=>(



                    <GridCol

                      key={item.id}

                      span={{
                        base:12,
                        md:6,
                        lg:4
                      }}

                    >


                      <NewsCard

                        news={item}

                      />



                    </GridCol>




                  ))}



                </Grid>





                {remainingNews.length > 0 ? (



                  <Stack gap="md">



                    <Title order={4} c="brand.7">

                      Más noticias

                    </Title>



                    <Grid

                      gutter="lg"

                      align="stretch"

                    >



                      {remainingNews.map((item)=>(



                        <GridCol

                          key={item.id}

                          span={{
                            base:12,
                            md:6,
                            lg:4
                          }}

                        >


                          <NewsCard

                            news={item}

                          />



                        </GridCol>




                      ))}



                    </Grid>



                  </Stack>



                ) : null}



              </Stack>



            ) : (



              <Card

                radius="lg"

                p={{
                  base:"cardPadCompactSm",
                  md:"cardPadCompactLg"
                }}

                bg="var(--mantine-color-neutral-1)"

              >



                <Text c="dimmed">

                  Todavía no hay noticias publicadas.

                </Text>



              </Card>



            )}





          </Stack>



        </Card>





      </Stack>



    </PaddingContainer>



  );

}