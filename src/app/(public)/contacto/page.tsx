import ContactoTemplate from "@/components/templates/ContactoTemplate";
import { useStaticData } from "@/hooks/useStaticData";

export default function Contacto() {
  const { defaultData } = useStaticData();

  return <ContactoTemplate {...defaultData.contactoPage} />;
}
