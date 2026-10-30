/**
 * Input Sanitization Utilities (Anti-XSS & Injection Defense)
 * Strips HTML tags, script payloads, event handlers, and dangerous URI schemes
 * before storing user input in Firestore or forwarding to backend APIs.
 */

export function stripHtmlTags(input: unknown, maxLength = 2000): string {
  if (input === null || input === undefined) return '';
  const raw = String(input);

  const cleaned = raw
    // Remove <script> and <style> blocks completely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Strip all HTML/XML tags while preserving mathematical inequalities like "x < 5" when followed by space/digit
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    // Also remove any stray angle-bracket tag fragments
    .replace(/[<>]/g, '')
    // Strip dangerous URI schemes
    .replace(/\b(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, '')
    // Remove inline event handler patterns
    .replace(/\bon[a-z]+\s*=/gi, '')
    // Strip null bytes and non-printable control characters (except \n, \r, \t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  return cleaned.slice(0, maxLength);
}

/**
 * Sanitizes math/tutor text while preserving LaTeX '<' and '>' inequalities,
 * stripping only actual HTML tags, script blocks, and event handlers.
 */
export function sanitizeMathInput(input: unknown, maxLength = 4000): string {
  if (input === null || input === undefined) return '';
  const raw = String(input);

  const cleaned = raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?[a-zA-Z!/?][^>]*>/g, '')
    .replace(/\b(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, '')
    .replace(/\bon[a-z]+\s*=/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  return cleaned.slice(0, maxLength);
}

export function sanitizeEmail(email: unknown): string {
  const stripped = stripHtmlTags(email, 254).toLowerCase();
  // Allow only valid email characters
  return stripped.replace(/[^a-z0-9._%+\-@]/g, '');
}

export function sanitizeId(id: unknown, maxLength = 128): string {
  const stripped = stripHtmlTags(id, maxLength);
  return stripped.replace(/[^a-zA-Z0-9_\-.]/g, '');
}
