"use client";

import { useState } from "react";
import { Alert, Button, LinearProgress } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { validateKycFile } from "@/features/user-v2/kyc.mjs";

export default function KycDocumentPicker({
  documentType,
  policy,
  disabled = false,
  uploadProgress = null,
  onRetry,
}) {
  const intl = useIntl();
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    const validation = validateKycFile(file, policy);

    if (!validation.valid) {
      setSelectedFile(null);
      setValidationError(validation.reason);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
  };

  return (
    <div className="rounded border border-gray-200 p-3 space-y-3">
      <div className="text-sm font-medium text-gray-700">
        {intl.formatMessage({ id: `kyc.document.${documentType}` })}
      </div>

      {disabled ? (
        <Alert severity="warning">
          <FormattedMessage id="kyc.upload.disabled_contract" />
        </Alert>
      ) : null}

      <input
        id={`kyc-file-${documentType}`}
        type="file"
        disabled={disabled}
        onChange={handleFileChange}
        className="block w-full text-sm"
        aria-describedby={`kyc-file-help-${documentType}`}
      />
      <p id={`kyc-file-help-${documentType}`} className="text-xs text-gray-500">
        <FormattedMessage id="kyc.upload.help" />
      </p>

      {validationError ? (
        <Alert severity="error">
          <FormattedMessage id={validationError} />
        </Alert>
      ) : null}

      {selectedFile ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-700">{selectedFile.name}</div>
          {typeof uploadProgress === "number" ? (
            <LinearProgress variant="determinate" value={uploadProgress} />
          ) : null}
          <div className="flex gap-2">
            <Button size="small" variant="outlined" component="label" disabled={disabled}>
              <FormattedMessage id="kyc.upload.replace" />
              <input hidden type="file" onChange={handleFileChange} />
            </Button>
            <Button size="small" color="error" onClick={() => setSelectedFile(null)} disabled={disabled}>
              <FormattedMessage id="kyc.upload.remove" />
            </Button>
            {onRetry ? (
              <Button size="small" onClick={onRetry} disabled={disabled}>
                <FormattedMessage id="kyc.upload.retry" />
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
