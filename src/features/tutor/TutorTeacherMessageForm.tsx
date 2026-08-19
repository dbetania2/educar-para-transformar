"use client";

import { useState, useTransition } from "react";
import { Alert, Card, Stack, Text, Textarea } from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

import { AppModal, CTAButton } from "@/components/atoms";

type TutorTeacherMessageFormProps = {
  studentProfileId: string;
  courseId: number;
};

export default function TutorTeacherMessageForm({
  studentProfileId,
  courseId,
}: TutorTeacherMessageFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [reviewOpened, setReviewOpened] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const nextMessage = message.trim();

    if (nextMessage.length < 3) {
      setStatus({ type: "error", text: "Escribí un comentario de al menos 3 caracteres." });
      return;
    }

    setPendingMessage(nextMessage);
    setReviewOpened(true);
  };

  const handleConfirmSend = () => {
    const nextMessage = pendingMessage.trim();

    if (nextMessage.length < 3) {
      setReviewOpened(false);
      setStatus({ type: "error", text: "Escribí un comentario de al menos 3 caracteres." });
      return;
    }

    startTransition(async () => {
      setStatus(null);
      const response = await fetch("/api/tutor/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentProfileId, courseId, message: nextMessage }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = payload?.error ?? "No se pudo enviar el comentario.";
        setStatus({ type: "error", text: errorMessage });
        notifications.show({ title: "No se pudo enviar", message: errorMessage, color: "red" });
        return;
      }

      setMessage("");
      setPendingMessage("");
      setReviewOpened(false);
      setStatus({ type: "success", text: "Comentario enviado al docente del curso." });
      notifications.show({ title: "Comentario enviado", message: "El docente ya puede verlo en su bandeja.", color: "green" });
    });
  };

  return (
    <>
      <AppModal
        opened={reviewOpened}
        onClose={() => !isPending && setReviewOpened(false)}
        title="Revisar comentario"
        description="Confirmá que la información sea correcta antes de enviarla al docente."
        size={680}
        primaryAction={{ label: "Enviar comentario", onClick: handleConfirmSend, disabled: isPending }}
        secondaryAction={{ label: "Volver a editar", onClick: () => setReviewOpened(false), disabled: isPending }}
      >
        <Card withBorder radius="md" p={{ base: "cardPadCompactSm", md: "cardPadCompactLg" }}>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">Comentario para el docente</Text>
            <Text>{pendingMessage}</Text>
          </Stack>
        </Card>
      </AppModal>

      <Stack gap="md">
      {status ? (
        <Alert color={status.type === "success" ? "green" : "red"} icon={<IconMessageCircle size={18} />} radius="lg">
          {status.text}
        </Alert>
      ) : null}
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.currentTarget.value)}
        label="Comentario para el docente"
        placeholder="Escribí una consulta u observación sobre el seguimiento del alumno"
        minRows={4}
        maxRows={8}
        autosize
        radius="lg"
        maxLength={2000}
      />
      <CTAButton
        type="button"
        ctaVariant="primary"
        size="md"
        onClick={handleSubmit}
        loading={isPending}
        fullWidth
      >
        Enviar comentario
      </CTAButton>
      </Stack>
    </>
  );
}
