const RETURN_PATH_ORIGIN = "https://tezauksion.local";

export function safeReturnPath(value?: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return "/";
  }

  if (
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(decoded)
  ) {
    return "/";
  }

  try {
    const destination = new URL(value, RETURN_PATH_ORIGIN);
    const decodedDestination = new URL(decoded, RETURN_PATH_ORIGIN);
    const candidates = [destination, decodedDestination];
    for (const candidate of candidates) {
      let decodedPathname: string;
      try {
        decodedPathname = decodeURIComponent(candidate.pathname);
      } catch {
        return "/";
      }

      if (
        candidate.origin !== RETURN_PATH_ORIGIN ||
        candidate.pathname.startsWith("//") ||
        decodedPathname.startsWith("//")
      ) {
        return "/";
      }
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/";
  }
}
