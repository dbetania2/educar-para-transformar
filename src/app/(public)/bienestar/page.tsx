import BienestarTemplate from "@/components/templates/BienestarTemplate";
import { useStaticData } from "@/hooks/useStaticData";
import React from "react";

export default function Bienestar() {
  const { defaultData } = useStaticData();

  return <BienestarTemplate {...defaultData.bienestarPage} />;
}