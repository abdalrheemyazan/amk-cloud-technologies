export type LegalPageContext = "documents" | "portal" | null;

export function resolveLegalPageContext(value: string | string[] | undefined): LegalPageContext {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "documents" || candidate === "portal" ? candidate : null;
}
