/**
 * Formats a date into Bangladesh Standard Time (Asia/Dhaka, UTC+6) string.
 */
export function formatBdTime(date: Date | string | number | null | undefined): string {
  if (!date) return "Recently";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Recently";

  return d.toLocaleTimeString("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
