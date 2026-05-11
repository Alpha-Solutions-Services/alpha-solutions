/**
 * Fire-and-forget: notify ops + user after password / session login (cookies sent automatically).
 */
export function notifyAuthActivityClient(
  kind: "login" | "signup" = "login",
  detail?: string,
): void {
  if (typeof window === "undefined") return;
  void fetch("/api/auth/notify-activity", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, detail }),
  }).catch(() => {});
}
