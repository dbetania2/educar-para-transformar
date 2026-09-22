"use client";

import { useEffect, useMemo, useState } from "react";
import NotificationsBell, { type NotificationItem } from "@/components/organisms/NotificationsBell";

type TeacherMessagePreview = {
  id: number;
  message: string;
  created_at: string;
  read_at: string | null;
  tutor_name: string;
  student_name: string;
  course_name: string;
};

type TeacherMessagesBellProps = {
  messages: TeacherMessagePreview[];
  messagesHref: string;
};

export default function TeacherMessagesBell({ messages, messagesHref }: TeacherMessagesBellProps) {
  const initiallyReadIds = useMemo(
    () => messages.filter((message) => message.read_at).map((message) => message.id),
    [messages],
  );
  const [readMessageIds, setReadMessageIds] = useState(() => new Set(initiallyReadIds));

  useEffect(() => {
    const handleMessagesRead = (event: Event) => {
      const detail = (event as CustomEvent<{ messageIds?: number[]; markAll?: boolean }>).detail;

      if (detail?.markAll) {
        setReadMessageIds(new Set(messages.map((message) => message.id)));
        return;
      }

      if (!detail?.messageIds?.length) return;

      setReadMessageIds((current) => {
        const next = new Set(current);
        detail.messageIds?.forEach((messageId) => next.add(messageId));
        return next;
      });
    };

    window.addEventListener("teacher-messages-read", handleMessagesRead);
    return () => window.removeEventListener("teacher-messages-read", handleMessagesRead);
  }, [messages]);

  const persistReadState = (payload: { messageIds?: number[]; markAll?: boolean }) => {
    void fetch("/api/docente/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const handleMarkAsRead = (id: string | number) => {
    const numId = typeof id === "number" ? id : parseInt(String(id), 10);
    if (isNaN(numId)) return;

    setReadMessageIds((current) => new Set(current).add(numId));
    persistReadState({ messageIds: [numId] });
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = messages
      .filter((message) => !readMessageIds.has(message.id))
      .map((message) => message.id);

    if (unreadIds.length === 0) return;

    setReadMessageIds(new Set(messages.map((m) => m.id)));
    persistReadState({ markAll: true });
  };

  const notifications: NotificationItem[] = useMemo(() => {
    return messages.map((msg) => ({
      id: msg.id,
      title: `Consulta de ${msg.tutor_name}`,
      description: `${msg.student_name} (${msg.course_name}): "${msg.message}"`,
      created_at: msg.created_at,
      read_at: readMessageIds.has(msg.id) ? new Date().toISOString() : msg.read_at,
      type: "message",
      category: "Mensaje de Tutor",
      sender: msg.tutor_name,
      href: messagesHref,
    }));
  }, [messages, readMessageIds, messagesHref]);

  return (
    <NotificationsBell
      notifications={notifications}
      messagesHref={messagesHref}
      roleTitle="Docente"
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  );
}
