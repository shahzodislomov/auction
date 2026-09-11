export const SUPPORTED_ROLE_NAMES = [
  "USER",
  "DEALER",
  "MODERATOR",
  "ADMIN",
];

export function normalizeRoles(roles = []) {
  const seen = new Set();

  return roles
    .filter(Boolean)
    .map((role) =>
      typeof role === "string"
        ? { id: role, name: role }
        : { ...role, name: String(role.name || "").toUpperCase() }
    )
    .filter((role) => role.name)
    .filter((role) => {
      const key = role.id ?? role.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function hasAnyRole(userOrRoles, roleNames = []) {
  const roles = Array.isArray(userOrRoles)
    ? userOrRoles
    : userOrRoles?.roles || [];
  const allowed = new Set(roleNames.map((role) => String(role).toUpperCase()));

  return normalizeRoles(roles).some((role) => allowed.has(role.name));
}

export function hasUserRole(userOrRoles) {
  return hasAnyRole(userOrRoles, ["USER"]);
}

export function getAssignableRoles(roleCatalog = [], currentRoles = []) {
  const current = new Set(normalizeRoles(currentRoles).map((role) => role.name));

  return normalizeRoles(roleCatalog).filter(
    (role) => SUPPORTED_ROLE_NAMES.includes(role.name) && !current.has(role.name)
  );
}

export function getRoleMessageId(roleName) {
  const name = String(roleName || "").toUpperCase();
  return SUPPORTED_ROLE_NAMES.includes(name) ? `role.${name}` : "role.UNKNOWN";
}
