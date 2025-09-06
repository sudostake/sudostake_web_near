// Lightweight toast utility without external deps.
// Creates a bottom-right stack of toasts using a portal-like root div.

export type ToastOptions = {
  variant?: "success" | "error" | "info";
  duration?: number; // ms
};

const ROOT_ID = "toast-root";

function setStyles(el: HTMLElement, styles: Record<string, string | number>) {
  const style = el.style as CSSStyleDeclaration;
  for (const [k, v] of Object.entries(styles)) {
    // Index signature isn't defined on CSSStyleDeclaration; cast key to any safely here.
    (style as unknown as Record<string, string>)[k] = String(v);
  }
}

function ensureRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = ROOT_ID;
    setStyles(root, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: 60000,
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      pointerEvents: "none",
    });
    document.body.appendChild(root);
  }
  return root;
}

export function showToast(message: string, opts: ToastOptions = {}): void {
  const root = ensureRoot();
  if (!root) return;

  const { variant = "success", duration = 3000 } = opts;
  const toast = document.createElement("div");
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const palette: Record<string, { bg: string; fg: string; border: string }> = {
    // Border colors precomputed with 25% alpha
    success: { bg: "#DCFCE7", fg: "#065F46", border: "rgba(52, 211, 153, 0.25)" }, // #34D399
    error: { bg: "#FEE2E2", fg: "#991B1B", border: "rgba(248, 113, 113, 0.25)" },   // #F87171
    info: { bg: "#DBEAFE", fg: "#1E3A8A", border: "rgba(96, 165, 250, 0.25)" },     // #60A5FA
  };
  const colors = palette[variant] ?? palette.success;

  setStyles(toast, {
    background: colors.bg,
    color: colors.fg,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    padding: "10px 12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
    fontSize: "14px",
    lineHeight: "20px",
    pointerEvents: "auto",
    opacity: "0",
    transform: "translateY(8px)",
    transition: "opacity 120ms ease, transform 120ms ease",
    maxWidth: "320px",
  });

  toast.textContent = message;
  root.appendChild(toast);

  requestAnimationFrame(() => {
    setStyles(toast, { opacity: "1", transform: "translateY(0)" });
  });

  const remove = () => {
    setStyles(toast, { opacity: "0", transform: "translateY(8px)" });
    window.setTimeout(() => {
      toast.remove();
    }, 140);
  };

  const timeout = window.setTimeout(remove, duration);
  toast.addEventListener("click", () => {
    window.clearTimeout(timeout);
    remove();
  });
}
