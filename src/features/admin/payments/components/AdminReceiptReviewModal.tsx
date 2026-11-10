"use client";

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconExternalLink,
  IconFileText,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";

import { AppModal, PastelBadge, StatusToneBadge } from "@/components/atoms";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import {
  CONCEPTO_TIPO_COLOR_HEX,
  CONCEPTO_TIPO_LABELS,
  formatArs,
} from "../constants";
import type { ComprobantePendienteRow } from "../types";

type AdminReceiptReviewModalProps = {
  selectedReceipt: ComprobantePendienteRow | null;
  observaciones: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onChangeObservaciones: (value: string) => void;
  onReviewDecision: (aprobar: boolean) => Promise<void>;
};

function renderEstadoBadge(
  estado: ComprobantePendienteRow["estado_validacion"],
) {
  if (estado === "Aprobado") {
    return <StatusToneBadge tone="success">Aprobado</StatusToneBadge>;
  }
  if (estado === "Rechazado") {
    return <StatusToneBadge tone="danger">Rechazado</StatusToneBadge>;
  }
  return <StatusToneBadge tone="review">En Revisión</StatusToneBadge>;
}

export function AdminReceiptReviewModal({
  selectedReceipt,
  observaciones,
  isSubmitting,
  errorMessage,
  onClose,
  onChangeObservaciones,
  onReviewDecision,
}: AdminReceiptReviewModalProps) {
  const isPendingReview =
    selectedReceipt?.estado_validacion === "En Revisión";
  const isImage = selectedReceipt?.mime_type.startsWith("image/");

  return (
    <AppModal
      opened={Boolean(selectedReceipt)}
      onClose={onClose}
      title={
        selectedReceipt
          ? `Comprobante de Pago #${selectedReceipt.comprobante_id}`
          : "Detalle de comprobante"
      }
      description="Verificá el archivo adjunto por el tutor, controlá los conceptos incluidos y aprobá o rechazá la acreditación."
      size={760}
      footer={
        selectedReceipt ? (
          <Group justify="space-between" w="100%" wrap="wrap" gap="sm">
            <Button
              variant="default"
              radius="xl"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cerrar
            </Button>

            {isPendingReview ? (
              <Group gap="sm">
                <Button
                  color="red"
                  variant="light"
                  radius="xl"
                  leftSection={<IconX size={16} />}
                  loading={isSubmitting}
                  onClick={() => void onReviewDecision(false)}
                >
                  Rechazar comprobante
                </Button>
                <Button
                  color="green"
                  radius="xl"
                  leftSection={<IconCheck size={16} />}
                  loading={isSubmitting}
                  onClick={() => void onReviewDecision(true)}
                >
                  Aprobar e imputar pago
                </Button>
              </Group>
            ) : null}
          </Group>
        ) : null
      }
    >
      {selectedReceipt ? (
        <Stack gap="md">
          {errorMessage ? (
            <Alert
              variant="light"
              color="red"
              radius="md"
              icon={<IconAlertCircle size={18} />}
            >
              {errorMessage}
            </Alert>
          ) : null}

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Card withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Padre / Tutor Responsable
                </Text>
                <Text fw={700} c="#0f172a">
                  {selectedReceipt.tutor_nombre}
                </Text>
                <Text size="xs" c="#64748b">
                  {selectedReceipt.tutor_email || "Sin correo"}
                  {selectedReceipt.tutor_dni
                    ? ` · DNI ${selectedReceipt.tutor_dni}`
                    : ""}
                </Text>
              </Stack>
            </Card>

            <Card withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Importe Total Declarado
                </Text>
                <Text fz={20} fw={900} c="#103b66">
                  {formatArs(selectedReceipt.total)}
                </Text>
                <Text size="xs" c="#64748b">
                  Enviado {formatDateTime(selectedReceipt.created_at)}
                </Text>
              </Stack>
            </Card>

            <Card withBorder radius="md" p="md">
              <Stack gap={6}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Estado de Validación
                </Text>
                {renderEstadoBadge(selectedReceipt.estado_validacion)}
                <Text size="xs" c="#64748b">
                  {selectedReceipt.conceptos.length} concepto(s) asociado(s)
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          <Card withBorder radius="md" p="md" bg="#f8fafc">
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="wrap">
                <Group gap="xs">
                  {isImage ? (
                    <IconPhoto size={18} color="#2563eb" />
                  ) : (
                    <IconFileText size={18} color="#2563eb" />
                  )}
                  <Stack gap={0}>
                    <Text size="sm" fw={700} c="#0f172a">
                      {selectedReceipt.archivo_nombre}
                    </Text>
                    <Text size="xs" c="#64748b">
                      {selectedReceipt.mime_type} ·{" "}
                      {(selectedReceipt.tamano_bytes / 1024).toFixed(1)} KB
                    </Text>
                  </Stack>
                </Group>

                {selectedReceipt.archivo_url ? (
                  <Button
                    component="a"
                    href={selectedReceipt.archivo_url}
                    target="_blank"
                    rel="noreferrer"
                    variant="light"
                    color="blue"
                    size="xs"
                    radius="xl"
                    leftSection={<IconExternalLink size={14} />}
                  >
                    Abrir comprobante en pestaña nueva
                  </Button>
                ) : (
                  <Badge color="gray" variant="light">
                    Vista previa no disponible
                  </Badge>
                )}
              </Group>

              {selectedReceipt.archivo_url && isImage ? (
                <Box
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    maxHeight: 280,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={selectedReceipt.archivo_url}
                    alt={`Comprobante #${selectedReceipt.comprobante_id}`}
                    fit="contain"
                    mah={270}
                  />
                </Box>
              ) : null}
            </Stack>
          </Card>

          <Stack gap="xs">
            <Text size="sm" fw={700} c="#0f172a">
              Conceptos incluidos en este comprobante
            </Text>
            <Card withBorder radius="md" p={0}>
              <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Alumno</Table.Th>
                    <Table.Th>Rubro</Table.Th>
                    <Table.Th>Concepto</Table.Th>
                    <Table.Th>Período</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>Importe</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedReceipt.conceptos.map((item) => (
                    <Table.Tr key={item.factura_id}>
                      <Table.Td>
                        <Text size="sm" fw={600} c="#0f172a">
                          {item.alumno}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <PastelBadge
                          label={
                            CONCEPTO_TIPO_LABELS[item.concepto_tipo] ??
                            item.concepto_tipo
                          }
                          colorHex={
                            CONCEPTO_TIPO_COLOR_HEX[item.concepto_tipo] ??
                            "#2563eb"
                          }
                        />
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="#334155">
                          {item.concepto}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="#64748b">
                          {item.periodo}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        <Text size="sm" fw={700} c="#0f172a">
                          {formatArs(item.importe)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Stack>

          <Divider />

          <Textarea
            label="Observaciones administrativas / Motivo de rechazo"
            description={
              isPendingReview
                ? "Obligatorio en caso de rechazar el comprobante (el tutor verá este mensaje en la app móvil)."
                : undefined
            }
            placeholder="Ej. El monto transferido no coincide con el total de las cuotas seleccionadas o la imagen es ilegible..."
            minRows={3}
            value={observaciones}
            onChange={(event) =>
              onChangeObservaciones(event.currentTarget.value)
            }
            disabled={!isPendingReview || isSubmitting}
          />
        </Stack>
      ) : null}
    </AppModal>
  );
}

