/** Shown on restaurant tablet app settings & merchant dashboard — keep in sync across apps. */
export const OWNMENU_SUPPORT_PHONES = {
  customerSupport: "4707983732",
  ownMenu: "8888738885",
};

export function formatUsPhone10(digits) {
  const d = String(digits ?? "").replace(/\D/g, "");
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return String(digits ?? "");
}
