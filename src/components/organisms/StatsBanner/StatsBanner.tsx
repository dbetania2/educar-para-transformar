"use client";


import { Group, Stack, Text, Title } from "@mantine/core";


import { useStyles } from "./StatsBanner.style";



const stats = [
  {
    value: "30+",
    label: "Años educando",
  },
  {
    value: "1000+",
    label: "Alumnos",
  },
  {
    value: "50+",
    label: "Docentes",
  },
];



export function StatsBanner() {


  const { classes } = useStyles();



  return (

    <Stack
      gap="sectionGapLg"
      className={classes.root}
    >


      <Stack gap="xs">

        <Title
          order={2}
          className={classes.title}
        >
          Nuestra comunidad en números
        </Title>


        <Text className={classes.description}>
          Una institución comprometida con la formación integral.
        </Text>


      </Stack>



      <Group
        grow
        className={classes.stats}
      >

        {
          stats.map((item)=>(
            
            <Stack
              key={item.label}
              gap={4}
              className={classes.item}
            >

              <Title order={2}>
                {item.value}
              </Title>


              <Text c="dimmed">
                {item.label}
              </Text>


            </Stack>

          ))
        }


      </Group>


    </Stack>

  );

}


export default StatsBanner;