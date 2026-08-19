import { createStyles } from "@mantine/emotion";


export const useStyles = createStyles((theme) => ({

  title: {
    color: theme.colors.brand[7],
  },


  description: {
    color: theme.colors.gray[6],
  },


  icon: {
    color: theme.colors.brand[7],
  },



  newsCard: {

    display: "flex",

    flexDirection: "column",

    overflow: "hidden",

    color: "inherit",

    textDecoration: "none",

    transition:
      "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",


    "--title-color": theme.colors.brand[7],

    "--image-opacity": 1,


    "&:hover": {

      transform: "translateY(-2px)",

      backgroundColor: theme.colors.brand[7],

      borderColor: theme.colors.brand[7],

      boxShadow: theme.shadows.md,


      "--title-color": theme.white,

      "--image-opacity": 0.62,

    },

  },



  newsImageWrap: {

    aspectRatio: "16 / 10",

    backgroundColor: theme.colors.gray[1],

    overflow: "hidden",

  },



  newsImage: {

    width: "100%",

    height: "100%",

    backgroundPosition: "center",

    backgroundSize: "cover",

    opacity: "var(--image-opacity)",

    transition: "opacity 180ms ease",

  },



  newsImagePlaceholder: {

    display: "grid",

    placeItems: "center",

    height: "100%",

    color: theme.colors.brand[7],

    backgroundColor: theme.colors.brand[0],

  },



  newsCardBody: {

    minWidth: 0,

    flex: 1,

  },



  newsTitle: {

    color: "var(--title-color)",

    fontSize: theme.fontSizes.xl,

    lineHeight: 1.25,

    overflowWrap: "break-word",

    transition: "color 180ms ease",

  },


}));