export type AdminNews = {
  id: string;
  title: string;
  descriptionHtml: string;
  imageUrl: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: "image" | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NewsFormValues = {
  title: string;
  descriptionHtml: string;
  file: File | null;
  isPublished: boolean;
};

export type NewsResponsePayload = {
  news?: AdminNews[];
  error?: string;
};
