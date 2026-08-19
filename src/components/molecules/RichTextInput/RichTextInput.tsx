"use client";

import { useEffect } from "react";
import { Box, Input } from "@mantine/core";
import { Link, RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useStyles } from "./RichTextInput.style";

type RichTextInputProps = {
  label?: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  minHeight?: number;
};

export function RichTextInput({
  label,
  description,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  minHeight = 180,
}: RichTextInputProps) {
  const { classes } = useStyles({ minHeight });
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ link: false }), Link],
    content: value || "",
    editorProps: {
      attributes: {
        class: classes.content,
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      onChange(activeEditor.isEmpty ? "" : activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentValue = editor.isEmpty ? "" : editor.getHTML();
    if (currentValue !== (value || "")) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <Input.Wrapper label={label} description={description} error={error} required={required}>
      <Box mt={label || description ? 6 : 0}>
        <RichTextEditor editor={editor} className={classes.root}>
          <RichTextEditor.Toolbar sticky={false} className={classes.toolbar}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Blockquote />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content />
        </RichTextEditor>
      </Box>
    </Input.Wrapper>
  );
}

export default RichTextInput;
