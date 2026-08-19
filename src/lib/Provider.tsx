"use client";

import { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { MantineEmotionProvider, emotionTransform } from "@mantine/emotion";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { NavigationProgress } from "@mantine/nprogress";

import { sgaTheme } from "./theme";

interface Props {
  children: ReactNode;
}

export function AppProvider({ children }: Props) {
  return (
    <MantineProvider
      theme={sgaTheme}
      forceColorScheme="light"
      stylesTransform={emotionTransform}
    >
      <MantineEmotionProvider>
        <ModalsProvider>
          <NavigationProgress zIndex={9999} />
          <Notifications position="top-right" zIndex={1000} />
          {children}
        </ModalsProvider>
      </MantineEmotionProvider>
    </MantineProvider>
  );
}
