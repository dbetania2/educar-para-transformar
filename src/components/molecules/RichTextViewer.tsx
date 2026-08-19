import { Box } from "@mantine/core";

import { sanitizeRichText } from "@/lib/richText";

type RichTextViewerProps = {
  value: string | null | undefined;
};

export function RichTextViewer({ value }: RichTextViewerProps) {
  return <Box className="rich-text-viewer" dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) || "<p>Sin contenido.</p>" }} />;
}
