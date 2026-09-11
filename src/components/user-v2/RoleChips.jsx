"use client";

import { Chip } from "@mui/material";
import { useIntl } from "react-intl";
import { getRoleMessageId, normalizeRoles } from "@/features/user-v2/roles.mjs";

export default function RoleChips({ roles = [], size = "small" }) {
  const intl = useIntl();
  const normalizedRoles = normalizeRoles(roles);

  if (normalizedRoles.length === 0) {
    return (
      <span className="text-sm text-gray-500">
        {intl.formatMessage({ id: "roles.empty" })}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1" aria-label={intl.formatMessage({ id: "roles.assigned" })}>
      {normalizedRoles.map((role) => (
        <Chip
          key={role.id ?? role.name}
          size={size}
          label={intl.formatMessage({
            id: getRoleMessageId(role.name),
            defaultMessage: role.name,
          })}
        />
      ))}
    </div>
  );
}
