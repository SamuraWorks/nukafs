/** Client-side output sanitization — complement server-side encoding in production */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char)
}

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "")
}

export function sanitizeText(input: string, maxLength = 500): string {
  return escapeHtml(stripHtml(input.trim()).slice(0, maxLength))
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120)
}
