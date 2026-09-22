"use client";

import { Alert, Stack } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

export default function TeacherCourseMaterialsManager() {
  return (
    <Stack gap="md">
      <Alert icon={<IconInfoCircle size={18} />} title="Sección no disponible" color="blue">
        La gestión de materiales ha sido deshabilitada en el sistema.
      </Alert>
    </Stack>
  );
}
