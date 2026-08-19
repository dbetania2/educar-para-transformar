"use client";


import {
  Card,
  Stack,
  Title,
} from "@mantine/core";

import { IconNews } from "@tabler/icons-react";

import type { NewsRecord } from "@/lib/news";

import { useStyles } from "./NewsCard.style";


type NewsCardProps = {
  news: NewsRecord;
};



export function NewsCard({
  news,
}: NewsCardProps) {


const { classes } = useStyles();



return (

<Card

component="a"

href={"/noticias/" + news.id}

withBorder

radius="lg"

p={0}

className={classes.newsCard}

>


<div className={classes.newsImageWrap}>


{
news.imageUrl ? (

<div

className={classes.newsImage}

style={{
backgroundImage:`url(${news.imageUrl})`
}}

/>

)

:

(

<div className={classes.newsImagePlaceholder}>

<IconNews size={34}/>

</div>

)

}


</div>




<Stack

gap="sm"

p="lg"

className={classes.newsCardBody}

>


<Title

order={4}

className={classes.newsTitle}

>

{news.title}

</Title>



</Stack>



</Card>


);

}