"use client";

import { useState } from "react";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";

import { createEmotionCache } from "./cache";

interface RegistryProps {
  children: React.ReactNode;
}

interface EmotionRegistryState {
  cache: EmotionCache;
  flush: () => string[];
}

function createRegistry(): EmotionRegistryState {
  const cache = createEmotionCache();
  cache.compat = true;

  const prevInsert = cache.insert;
  let inserted: string[] = [];

  cache.insert = (...args) => {
    const serialized = args[1];

    if (cache.inserted[serialized.name] === undefined) {
      inserted.push(serialized.name);
    }

    return prevInsert(...args);
  };

  return {
    cache,
    flush: () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    },
  };
}

export function EmotionRegistry({ children }: RegistryProps) {
  const [{ cache, flush }] = useState(createRegistry);

  useServerInsertedHTML(() => {
    const names = flush();

    if (names.length === 0) {
      return null;
    }

    let styles = "";

    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
