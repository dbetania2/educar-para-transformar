const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "a",
]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeAttributes(tagName: string, attributes: string) {
  if (tagName !== "a") return "";

  const hrefMatch = attributes.match(/href=["']([^"']+)["']/i);
  const href = hrefMatch?.[1]?.trim();
  if (!href || !/^(https?:\/\/|mailto:)/i.test(href)) return "";

  return ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
}

export function sanitizeRichText(value: string | null | undefined) {
  if (!value) return "";

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, rawTagName: string, rawAttributes: string) => {
      const tagName = rawTagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tagName)) return "";
      if (match.startsWith("</")) return `</${tagName}>`;
      if (tagName === "br") return "<br>";
      return `<${tagName}${sanitizeAttributes(tagName, rawAttributes ?? "")}>`;
    });
}

export function stripRichText(value: string | null | undefined) {
  return sanitizeRichText(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
