"use client";

import { Alert, Button, Divider } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import {
  createUnavailableAgreementStatus,
  evaluateMandatoryAgreementStatus,
} from "@/features/user-v2/agreements.mjs";

export default function AgreementStatusPanel({
  status = createUnavailableAgreementStatus(),
  onReaccept,
}) {
  const intl = useIntl();
  const blocking = evaluateMandatoryAgreementStatus(status);
  const history = Array.isArray(status.history) ? status.history : [];

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <h2 className="text-xl font-semibold text-gray-700">
        <FormattedMessage id="agreement.status_title" />
      </h2>

      {status.capability === "unavailable" ? (
        <Alert severity="warning">
          <FormattedMessage id="agreement.contract_unavailable" />
        </Alert>
      ) : blocking.blocked ? (
        <Alert
          severity="error"
          action={
            onReaccept ? (
              <Button color="inherit" size="small" onClick={onReaccept}>
                {intl.formatMessage({ id: "agreement.reaccept" })}
              </Button>
            ) : null
          }
        >
          <FormattedMessage id="agreement.reaccept_required" />
        </Alert>
      ) : (
        <Alert severity="success">
          <FormattedMessage id="agreement.current" />
        </Alert>
      )}

      <Divider />

      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">
          <FormattedMessage id="agreement.history" />
        </div>
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={`${item.type}-${item.version}-${item.acceptedAt}`}
                className="rounded border border-gray-200 p-2 text-sm text-gray-700"
              >
                <div>{item.type}</div>
                <div className="text-xs text-gray-500">
                  {item.version} · {item.acceptedAt}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            <FormattedMessage id="agreement.history_unavailable" />
          </p>
        )}
      </div>
    </section>
  );
}
