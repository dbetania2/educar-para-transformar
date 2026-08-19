import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import type { StaticData } from "@/hooks/useStaticData";

export type InscripcionFormValues = {
  studentFirstName: string;
  studentLastName: string;
  studentDni: string | number;
  level: string;
  responsibleType: "tutor" | "parents" | "";
  tutorFullName: string;
  tutorDni: string | number;
  fatherFullName: string;
  fatherDni: string | number;
  motherFullName: string;
  motherDni: string | number;
  contactPhone: string | number;
  email: string;
};

const initialValues: InscripcionFormValues = {
  studentFirstName: "",
  studentLastName: "",
  studentDni: "",
  level: "",
  responsibleType: "tutor",
  tutorFullName: "",
  tutorDni: "",
  fatherFullName: "",
  fatherDni: "",
  motherFullName: "",
  motherDni: "",
  contactPhone: "",
  email: "",
};

type UseInscripcionFormOptions = Pick<
  StaticData["inscripcionPage"]["form"],
  "notifications"
>;

export function useInscripcionForm({ notifications: notificationCopy }: UseInscripcionFormOptions) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [finalStepAttempted, setFinalStepAttempted] = useState(false);
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const previousStepRef = useRef(currentStep);

  const form = useForm<InscripcionFormValues>({
    mode: "controlled",
    initialValues,
    validate: {
      studentFirstName: (value) =>
        value.trim().length < 2 ? "Ingresá el nombre del alumno." : null,
      studentLastName: (value) =>
        value.trim().length < 2 ? "Ingresá el apellido del alumno." : null,
      studentDni: (value) =>
        /^\d{8}$/.test(String(value).trim()) ? null : "Ingresá un DNI válido.",
      level: (value) => (value ? null : "Seleccioná un nivel."),
      responsibleType: (value) =>
        value ? null : "Seleccioná quién realiza la inscripción.",
      tutorFullName: (value, values) =>
        values.responsibleType !== "tutor"
          ? null
          : value.trim().length < 3
            ? "Ingresá el nombre y apellido del tutor."
            : null,
      tutorDni: (value, values) =>
        values.responsibleType !== "tutor"
          ? null
          : /^\d{8}$/.test(String(value).trim())
            ? null
            : "Ingresá un DNI válido para el tutor.",
      fatherFullName: (value, values) =>
        values.responsibleType !== "parents"
          ? null
          : value.trim().length < 3
            ? "Ingresá el nombre y apellido del padre."
            : null,
      fatherDni: (value, values) =>
        values.responsibleType !== "parents"
          ? null
          : /^\d{8}$/.test(String(value).trim())
            ? null
            : "Ingresá un DNI válido para el padre.",
      motherFullName: (value, values) =>
        values.responsibleType !== "parents"
          ? null
          : value.trim().length < 3
            ? "Ingresá el nombre y apellido de la madre."
            : null,
      motherDni: (value, values) =>
        values.responsibleType !== "parents"
          ? null
          : /^\d{8}$/.test(String(value).trim())
            ? null
            : "Ingresá un DNI válido para la madre.",
      contactPhone: (value) =>
        /^\d{8,15}$/.test(String(value).trim()) ? null : "Ingresá un teléfono válido.",
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "Ingresá un email válido.",
    },
  });
  const studentFullName = `${form.values.studentFirstName} ${form.values.studentLastName}`.trim();

  useEffect(() => {
    if (previousStepRef.current === currentStep) {
      return;
    }

    previousStepRef.current = currentStep;
    formCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [currentStep]);

  const clearStepErrors = (step: number) => {
    getFieldsForStep(step).forEach((field) => form.clearFieldError(field));
  };

  const clearResponsibleErrors = () => {
    (["tutorFullName", "tutorDni", "fatherFullName", "fatherDni", "motherFullName", "motherDni"] as const)
      .forEach((field) => form.clearFieldError(field));
  };

  const handleResponsibleTypeChange = (value: InscripcionFormValues["responsibleType"]) => {
    form.setFieldValue("responsibleType", value);
    clearResponsibleErrors();
    setFinalStepAttempted(false);

    if (value === "tutor") {
      form.setValues({
        fatherFullName: "",
        fatherDni: "",
        motherFullName: "",
        motherDni: "",
      });
    }

    if (value === "parents") {
      form.setValues({
        tutorFullName: "",
        tutorDni: "",
      });
    }
  };

  const totalSteps = 3;
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  const getFieldsForStep = (step: number): (keyof InscripcionFormValues)[] => {
    switch (step) {
      case 0:
        return [
          "studentFirstName",
          "studentLastName",
          "studentDni",
          "email",
          "contactPhone",
        ];
      case 1:
        return ["level", "responsibleType"];
      case 2:
        return form.values.responsibleType === "tutor"
          ? ["tutorFullName", "tutorDni"]
          : ["fatherFullName", "fatherDni", "motherFullName", "motherDni"];
      default:
        return [];
    }
  };

  const validateStep = (step: number) => {
    const fieldsToValidate = getFieldsForStep(step);

    let hasErrors = false;

    fieldsToValidate.forEach((field) => {
      const result = form.validateField(field);

      if (result.hasError) {
        hasErrors = true;
      }
    });

    return !hasErrors;
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }


    const nextStep = Math.min(currentStep + 1, totalSteps - 1);
    clearStepErrors(nextStep);
    setFinalStepAttempted(false);
    setCurrentStep(nextStep);
  };

  const handlePreviousStep = () => {
    setFinalStepAttempted(false);
    setCurrentStep((value) => Math.max(value - 1, 0));
  };

  const handleReviewRequest = () => {
    setFinalStepAttempted(true);

    if (!validateStep(currentStep)) {
      return;
    }

    setOpened(true);
  };

  const handleConfirmSend = async () => {
    const values = form.getValues();
    setIsSubmitting(true);

    const response = await fetch("/api/inscripcion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentFullName: `${values.studentFirstName} ${values.studentLastName}`.trim(),
        studentDni: String(values.studentDni).trim(),
        level: values.level,
        responsibleType: values.responsibleType,
        tutorFullName: values.tutorFullName.trim(),
        tutorDni: String(values.tutorDni).trim(),
        fatherFullName: values.fatherFullName.trim(),
        fatherDni: String(values.fatherDni).trim(),
        motherFullName: values.motherFullName.trim(),
        motherDni: String(values.motherDni).trim(),
        contactPhone: String(values.contactPhone).trim(),
        email: values.email.trim(),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      notifications.show({
        title: "No se pudo enviar la solicitud",
        message: payload?.error ?? "Intentá nuevamente en unos minutos.",
        color: "red",
      });

      return;
    }

    notifications.show({
      title: notificationCopy.successTitle,
      message: notificationCopy.successMessage.replace(
        "{studentFullName}",
        `${values.studentFirstName} ${values.studentLastName}`.trim(),
      ),
      color: "green",
    });

    setOpened(false);
    form.reset();
    setFinalStepAttempted(false);
    setCurrentStep(0);
    router.push("/");
  };

  return {
    opened,
    isSubmitting,
    currentStep,
    totalSteps,
    progressValue,
    finalStepAttempted,
    formCardRef,
    form,
    studentFullName,
    setOpened,
    setCurrentStep,
    handleResponsibleTypeChange,
    handleNextStep,
    handlePreviousStep,
    handleReviewRequest,
    handleConfirmSend,
  };
}
