export type AuthenticatedProfileIdentity = {
  id?: string | number | null;
  userId?: string | number | null;
};

export function resolveProfileIdentity(
  profile: AuthenticatedProfileIdentity | null | undefined,
): number | null {
  if (!profile) return null;

  const normalize = (candidate: string | number | null | undefined) => {
    if (typeof candidate === "string") {
      const normalized = candidate.trim();
      if (!/^\d+$/.test(normalized)) return null;
      const parsed = Number(normalized);
      return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
    }

    return typeof candidate === "number" &&
      Number.isSafeInteger(candidate) &&
      candidate > 0
      ? candidate
      : null;
  };

  const hasId = Object.prototype.hasOwnProperty.call(profile, "id");
  const hasUserId = Object.prototype.hasOwnProperty.call(profile, "userId");

  if (hasId && hasUserId) {
    const id = normalize(profile.id);
    const userId = normalize(profile.userId);
    return id !== null && userId !== null && id === userId ? id : null;
  }

  return normalize(hasId ? profile.id : profile.userId);
}

export function isSameAccountIdentity(
  authoritative: number,
  supplied: string | number,
): boolean {
  return resolveProfileIdentity({ id: supplied }) === authoritative;
}
