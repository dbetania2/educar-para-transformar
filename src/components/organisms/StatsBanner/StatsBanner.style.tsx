import { createStyles } from "@mantine/emotion";


export const useStyles = createStyles((theme)=>({

  root: {

    padding: "clamp(2rem,5vw,4rem)",

    borderRadius: theme.radius.xl,

    background: "white",

  },


  title: {

    color: theme.colors.brand[7],

  },


  description: {

    color: theme.colors.gray[6],

  },


  stats: {

    marginTop: theme.spacing.lg,

  },


  item: {

    alignItems:"center",

    textAlign:"center",

  },


}));