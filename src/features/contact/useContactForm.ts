import { useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import type { StaticData } from "@/hooks/useStaticData";

export type ContactFormValues = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialValues: ContactFormValues = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

type UseContactFormOptions = Pick<
  StaticData["contactoPage"]["quickMessageForm"],
  "notifications"
>;

export function useContactForm({ notifications: notificationCopy }: UseContactFormOptions) {
  const [opened, setOpened] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    mode: "controlled",
    initialValues,
    validate: {
      fullName: (value) =>
        value.trim().length < 3 ? "Ingresá tu nombre completo." : null,
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "Ingresá un email válido.",
      phone: (value) =>
        /^\d{8,15}$/.test(value.trim()) ? null : "Ingresá un teléfono válido.",
      subject: (value) =>
        value.trim().length < 4 ? "Ingresá un asunto más descriptivo." : null,
      message: (value) =>
        value.trim().length < 10
          ? "Escribí un mensaje un poco más completo."
          : null,
    },
  });

  const handleReview = () => {
    setOpened(true);
  };

  const handleConfirmSend = async () => {
    const values = form.getValues();
    setIsSubmitting(true);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      notifications.show({
        title: "No se pudo enviar el mensaje",
        message: "Intentá nuevamente en unos minutos.",
        color: "red",
      });

      return;
    }

    notifications.show({
      title: notificationCopy.successTitle,
      message: notificationCopy.successMessage.replace("{subject}", values.subject),
      color: "green",
    });

    setOpened(false);
    form.reset();
  };

  return {
    opened,
    isSubmitting,
    form,
    setOpened,
    handleReview,
    handleConfirmSend,
  };
}
