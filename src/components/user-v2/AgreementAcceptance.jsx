"use client";

import Link from "next/link";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useIntl } from "react-intl";
import { AGREEMENT_TYPES } from "@/features/user-v2/agreements.mjs";

const AGREEMENT_LINKS = {
  PRIVACY: "/privacypolicy",
};

export default function AgreementAcceptance({ value, onChange, disabled = false }) {
  const intl = useIntl();

  return (
    <div className="space-y-2">
      <FormGroup>
        {AGREEMENT_TYPES.map((type) => (
          <FormControlLabel
            key={type}
            control={
              <Checkbox
                checked={value?.[type] === true}
                onChange={(event) =>
                  onChange({ ...value, [type]: event.target.checked })
                }
                disabled={disabled}
                inputProps={{
                  "aria-label": intl.formatMessage({
                    id: `agreement.${type}.accept`,
                  }),
                }}
              />
            }
            label={
              <span className="text-sm text-gray-700">
                {intl.formatMessage({ id: `agreement.${type}.accept` })}{" "}
                {AGREEMENT_LINKS[type] ? (
                  <Link href={AGREEMENT_LINKS[type]} className="text-blue-600">
                    {intl.formatMessage({ id: `agreement.${type}` })}
                  </Link>
                ) : (
                  <span>{intl.formatMessage({ id: `agreement.${type}` })}</span>
                )}
              </span>
            }
          />
        ))}
      </FormGroup>
      <p className="text-xs text-gray-500">
        {intl.formatMessage({ id: "agreement.registration_note" })}
      </p>
    </div>
  );
}
