"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { CloudDownload, Delete, Refresh, UploadFile } from "@mui/icons-material";
import { FormattedMessage, useIntl } from "react-intl";
import {
  VEHICLE_DOCUMENT_POLICY,
  buildVehicleDocumentStatusView,
  canDeleteVehicleDocument,
  canReplaceVehicleDocument,
  canViewPrivateVehicleDocument,
  getVehicleDocumentRequirements,
  mapVehicleDocumentApiError,
  prepareVehicleDocumentRetry,
  validateVehicleDocumentFile,
  validateVehicleDocumentsForReview,
} from "@/features/user-v2/vehicle-documents.mjs";
import {
  useDeleteVehicleDocument,
  useDownloadVehicleDocument,
  useUploadVehicleDocument,
  useVehicleDocuments,
} from "@/queries/vehicle-documents";

export default function VehicleDocumentManager({ vehicleId, user }) {
  const intl = useIntl();
  const documentsQuery = useVehicleDocuments(vehicleId);
  const uploadMutation = useUploadVehicleDocument();
  const deleteMutation = useDeleteVehicleDocument();
  const downloadMutation = useDownloadVehicleDocument();
  const [localUploads, setLocalUploads] = useState([]);
  const uploadCounterRef = useRef(0);
  const requirements = getVehicleDocumentRequirements();
  const documents = useMemo(() => documentsQuery.data || [], [documentsQuery.data]);
  const documentsByType = useMemo(
    () => new Map(documents.map((document) => [document.type, document])),
    [documents],
  );
  const readiness = validateVehicleDocumentsForReview(documents);
  const orderedTypes = [...requirements.requiredTypes, ...requirements.optionalTypes];

  const uploadFile = (type, file, customLocalId) => {
    const localId = customLocalId || `doc-${type}-${++uploadCounterRef.current}`;
    const validation = validateVehicleDocumentFile(file, VEHICLE_DOCUMENT_POLICY);

    if (!validation.valid) {
      setLocalUploads((current) => [
        ...current.filter((item) => item.id !== localId),
        {
          id: localId,
          type,
          file,
          fileName: file?.name || "",
          status: "FAILED",
          progress: 0,
          error: validation.reason,
        },
      ]);
      return;
    }

    setLocalUploads((current) => [
      ...current.filter((item) => item.id !== localId),
      {
        id: localId,
        type,
        file,
        fileName: file.name,
        status: "UPLOADING",
        progress: 45,
        error: null,
      },
    ]);

    uploadMutation.mutate({ vehicleId, type, file }, {
      onSuccess: () => {
        setLocalUploads((current) => current.filter((item) => item.id !== localId));
      },
      onError: (error) => {
        setLocalUploads((current) => current.map((item) => (
          item.id === localId
            ? { ...item, status: "FAILED", progress: 0, error: mapVehicleDocumentApiError(error) }
            : item
        )));
      },
    });
  };

  const retryUpload = (upload) => {
    const retryState = prepareVehicleDocumentRetry(upload);
    setLocalUploads((current) => current.map((item) => item.id === upload.id ? retryState : item));
    uploadFile(upload.type, upload.file, upload.id);
  };

  const handleDownload = (document) => {
    if (!canViewPrivateVehicleDocument(document, user)) return;

    downloadMutation.mutate({ vehicleId, documentId: document.id }, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement("a");
        link.href = url;
        link.download = document.fileName || `${document.type}.txt`;
        link.click();
        URL.revokeObjectURL(url);
      },
    });
  };

  if (!documentsQuery.isContractAvailable) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <FormattedMessage id="vehicle_documents.contract.unavailable" />
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6">
            <FormattedMessage id="vehicle_documents.title" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="vehicle_documents.help" />
          </Typography>
        </Box>
      </Stack>

      {documentsQuery.isMock && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <FormattedMessage id="vehicle_documents.mock_note" />
        </Alert>
      )}

      <Alert severity={readiness.ready ? "success" : "warning"} sx={{ mb: 2 }}>
        {readiness.ready ? (
          <FormattedMessage id="vehicle_documents.readiness.ready" />
        ) : (
          <>
            <FormattedMessage id="vehicle_documents.readiness.blocked" />
            <Box component="ul" sx={{ mb: 0, mt: 1 }}>
              {readiness.blockingTypes.map((type) => (
                <li key={type}>
                  <FormattedMessage id={`vehicle_documents.type.${type}`} />
                </li>
              ))}
            </Box>
          </>
        )}
      </Alert>

      {documentsQuery.isLoading && <CircularProgress />}

      <Grid container spacing={2}>
        {orderedTypes.map((type) => (
          <Grid item xs={12} md={4} key={type}>
            <DocumentCard
              type={type}
              required={requirements.requiredTypes.includes(type)}
              document={documentsByType.get(type)}
              localUpload={localUploads.find((item) => item.type === type)}
              user={user}
              onUpload={(file) => uploadFile(type, file)}
              onRetry={retryUpload}
              onDelete={(document) => deleteMutation.mutate({ vehicleId, documentId: document.id })}
              onDownload={handleDownload}
              disabled={uploadMutation.isPending || deleteMutation.isPending}
              intl={intl}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function DocumentCard({
  type,
  required,
  document,
  localUpload,
  user,
  onUpload,
  onRetry,
  onDelete,
  onDownload,
  disabled,
  intl,
}) {
  const inputRef = useRef(null);
  const statusView = document ? buildVehicleDocumentStatusView(document) : null;
  const canReplace = !document || canReplaceVehicleDocument(document);
  const canDelete = document && canDeleteVehicleDocument(document);
  const canDownload = document && canViewPrivateVehicleDocument(document, user);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  };

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="subtitle1">
            <FormattedMessage id={`vehicle_documents.type.${type}`} />
          </Typography>
          <Chip
            size="small"
            color={required ? "primary" : "default"}
            label={intl.formatMessage({ id: required ? "vehicle_documents.required" : "vehicle_documents.optional" })}
          />
        </Stack>

        {document ? (
          <Box sx={{ mt: 2 }}>
            <Alert severity={statusView.severity}>
              <FormattedMessage id={statusView.labelId} />
              {statusView.rejectionReason ? (
                <Box sx={{ mt: 1 }}>
                  <strong><FormattedMessage id="vehicle_documents.rejection_reason" />:</strong> {statusView.rejectionReason}
                </Box>
              ) : null}
            </Alert>
            <Typography variant="body2" sx={{ mt: 1 }} noWrap>
              {document.fileName}
            </Typography>
          </Box>
        ) : (
          <Alert severity={required ? "warning" : "info"} sx={{ mt: 2 }}>
            <FormattedMessage id={required ? "vehicle_documents.missing_required" : "vehicle_documents.optional_missing"} />
          </Alert>
        )}

        {localUpload ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" noWrap>{localUpload.fileName}</Typography>
            {localUpload.status === "UPLOADING" ? (
              <>
                <LinearProgress variant="determinate" value={localUpload.progress || 45} sx={{ mt: 1 }} />
                <Typography variant="caption"><FormattedMessage id="vehicle_documents.uploading" /></Typography>
              </>
            ) : null}
            {localUpload.status === "FAILED" ? (
              <Alert severity="error" sx={{ mt: 1 }}>
                <FormattedMessage id={localUpload.error || "vehicle_documents.error.generic"} />
              </Alert>
            ) : null}
          </Box>
        ) : null}
      </CardContent>

      <CardActions sx={{ flexWrap: "wrap" }}>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          aria-label={intl.formatMessage({ id: `vehicle_documents.type.${type}` })}
        />
        <Button
          size="small"
          startIcon={<UploadFile />}
          onClick={() => inputRef.current?.click()}
          disabled={disabled || !canReplace}
        >
          <FormattedMessage id={document ? "vehicle_documents.replace" : "vehicle_documents.upload"} />
        </Button>
        {canDownload ? (
          <Button size="small" startIcon={<CloudDownload />} onClick={() => onDownload(document)}>
            <FormattedMessage id="vehicle_documents.download" />
          </Button>
        ) : null}
        {canDelete ? (
          <Button size="small" color="error" startIcon={<Delete />} disabled={disabled} onClick={() => onDelete(document)}>
            <FormattedMessage id="vehicle_documents.delete" />
          </Button>
        ) : null}
        {localUpload?.status === "FAILED" ? (
          <Button size="small" startIcon={<Refresh />} onClick={() => onRetry(localUpload)}>
            <FormattedMessage id="vehicle_documents.retry" />
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
}
