"use client";

import { Alert, Button, Chip, Divider } from "@mui/material";
import Link from "next/link";
import { FormattedMessage, useIntl } from "react-intl";
import {
  buildKycStatusViewModel,
  createUnavailableKycStatus,
  getKycDocumentRequirements,
  getResubmissionSteps,
} from "@/features/user-v2/kyc.mjs";

export default function KycStatusPanel({
  status = createUnavailableKycStatus(),
  userType = "INDIVIDUAL",
}) {
  const intl = useIntl();
  const view = buildKycStatusViewModel(status);
  const requirements = getKycDocumentRequirements(userType);
  const steps = getResubmissionSteps(status);

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-700">
          <FormattedMessage id="kyc.title" />
        </h2>
        <Chip
          label={intl.formatMessage({ id: status.status ? `kyc.status.${status.status}` : "kyc.status.UNAVAILABLE" })}
          color={view.severity === "success" ? "success" : view.severity === "error" ? "error" : "default"}
          size="small"
        />
      </div>

      {status.capability === "unavailable" ? (
        <Alert severity="warning">
          <FormattedMessage id="kyc.contract_unavailable" />
        </Alert>
      ) : (
        <Alert severity={view.severity}>
          <FormattedMessage id={view.titleId} />
          {view.rejectionReason ? (
            <div className="mt-2 text-sm">
              <FormattedMessage id="kyc.rejection_reason" />: {view.rejectionReason}
            </div>
          ) : null}
        </Alert>
      )}

      <Divider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">
          <FormattedMessage id="kyc.required_documents" />
        </h3>
        <div className="flex flex-wrap gap-2">
          {requirements.acceptedTypes.map((type) => (
            <Chip key={type} label={intl.formatMessage({ id: `kyc.document.${type}` })} size="small" />
          ))}
        </div>
        <p className="text-sm text-gray-500">
          <FormattedMessage id={`kyc.requirement.${requirements.mode}`} />
        </p>
      </div>

      {steps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">
            <FormattedMessage id="kyc.resubmit_steps" />
          </h3>
          <ol className="list-decimal pl-5 text-sm text-gray-600">
            {steps.map((step) => (
              <li key={step}><FormattedMessage id={step} /></li>
            ))}
          </ol>
        </div>
      )}

      <Button component={Link} href="/dashboard/kyc" variant="contained" disabled={status.capability === "unavailable"}>
        <FormattedMessage id={view.actionId || "kyc.view"} />
      </Button>
    </section>
  );
}
