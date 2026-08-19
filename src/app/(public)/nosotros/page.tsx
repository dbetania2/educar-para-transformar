import NosotrosTemplate from "@/components/templates/NosotrosTemplate";
import { useStaticData } from "@/hooks/useStaticData";
import React from "react";

export default function Nosotros() {
  const { defaultData } = useStaticData();

  return <NosotrosTemplate {...defaultData.nosotrosPage} />;
}

