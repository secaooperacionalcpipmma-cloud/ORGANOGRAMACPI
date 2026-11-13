/**
 * Returns the current date formatted as DD/MM/YYYY (e.g., 13/11/2026)
 * Automatically updates every day whenever the user views or generates reports.
 */
export function getCurrentDateBR(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}
