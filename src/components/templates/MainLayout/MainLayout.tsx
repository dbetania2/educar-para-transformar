"use client";

import { Box } from "@mantine/core";
import { Footer } from "@/components/organisms/Footer/Footer";
import { Header } from "@/components/organisms/Header/Header";
import { useStaticData } from "@/hooks/useStaticData";
import { useStyles } from "./MainLayout.style";

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const { defaultData } = useStaticData();
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      <Header {...defaultData.layout.header} />
      <Box component="main" className={classes.main}>
        {children}
      </Box>
      <Footer {...defaultData.layout.footer} />
    </Box>
  );
}

export default MainLayout;
