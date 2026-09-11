"use client";

import { Alert, Button } from "@mui/material";
import Link from "next/link";
import { FormattedMessage } from "react-intl";
import { createUnavailableKycStatus } from "@/features/user-v2/kyc.mjs";
import useKycGate from "@/hooks/useKycGate";

export default function KycGate({
  status = createUnavailableKycStatus(),
  target = "action",
  children,
}) {
  const gate = useKycGate(target, status);

  if (gate.allowed) return children;

  return (
    <Alert
      severity="warning"
      action={
        gate.ctaHref ? (
          <Button component={Link} href={gate.ctaHref} color="inherit" size="small">
            <FormattedMessage id="kyc.complete_cta" />
          </Button>
        ) : null
      }
    >
      <FormattedMessage id={gate.reason} />
    </Alert>
  );
}
