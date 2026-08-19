import EmpleosTemplate from "@/components/templates/EmpleosTemplate";
import { defaultData } from "@/hooks/useStaticData";

export default function Empleos() {
  return (
    <EmpleosTemplate
      {...defaultData.empleosPage}
    />
  );
}