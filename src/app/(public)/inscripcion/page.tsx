import InscripcionTemplate from "@/components/templates/InscripcionTemplate";
import { useStaticData } from "@/hooks/useStaticData";

export default function Inscripcion() {
  const { defaultData } = useStaticData();

  return <InscripcionTemplate {...defaultData.inscripcionPage} />;
}
