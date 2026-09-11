"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import VehicleForm from "@/components/user-v2/VehicleForm";
import VehicleDocumentManager from "@/components/user-v2/VehicleDocumentManager";
import VehicleImageGallery from "@/components/user-v2/VehicleImageGallery";
import VehicleImageManager from "@/components/user-v2/VehicleImageManager";
import VehicleSummary from "@/components/user-v2/VehicleSummary";
import { useUserContext } from "@/context/UserContext";
import { getStorageItem } from "@/utils/storage";
import { canEditVehicle, mapVehicleApiError } from "@/features/user-v2/vehicle.mjs";
import {
  getVehicleContractState,
  useCreateVehicle,
  useOwnerVehicles,
  useUpdateVehicle,
  useVehicleDetail,
} from "@/queries/vehicles";

export function VehicleList() {
  const router = useRouter();
  const { user } = useUserContext();
  const ownerId = resolveUserId(user);
  const vehicles = useOwnerVehicles();

  return (
    <Box>
      <Header
        action={(
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard/vehicles/create")}
            disabled={!vehicles.isContractAvailable}
          >
            <FormattedMessage id="vehicle.create" />
          </Button>
        )}
      />
     {!vehicles.isContractAvailable && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <FormattedMessage id="vehicle.contract.core_unavailable" />
        </Alert>
      )}

      {vehicles.isMock && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <FormattedMessage id="vehicle.mock_note" />
        </Alert>
      )}

      {vehicles.isLoading && <CircularProgress />}

      {vehicles.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <FormattedMessage id={mapVehicleApiError(vehicles.error)} />
        </Alert>
      )}

      {!vehicles.isLoading && vehicles.isContractAvailable && (vehicles.data || []).length === 0 && (
        <Alert severity="info">
          <FormattedMessage id="vehicle.empty" />
        </Alert>
      )}

      <Grid container spacing={2}>
        
        {(vehicles.data || []).map((vehicle) => (
          <Grid item xs={12} md={6} lg={4} key={vehicle.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {vehicle.year || "—"} {vehicle.makeName || `#${vehicle.makeId}`} {vehicle.modelName || `#${vehicle.modelId}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage id="vehicle.vin" />: {vehicle.vin}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}>
                  <FormattedMessage id="vehicle.view" />
                </Button>
                {canEditVehicle(vehicle, user) && (
                  <Button size="small" onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}/edit`)}>
                    <FormattedMessage id="vehicle.edit" />
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function VehicleCreate() {
  const router = useRouter();
  const intl = useIntl();
  const { user } = useUserContext();
  const ownerId = resolveUserId(user);
  const contract = getVehicleContractState();
  const createMutation = useCreateVehicle();

  const handleSubmit = (form) => {
    createMutation.mutate({ form, ownerId }, {
      onSuccess: (vehicle) => {
        toast.success(intl.formatMessage({ id: "vehicle.saved" }));
        router.push(`/dashboard/vehicles/${vehicle.id}`);
      },
    });
  };

  return (
    <Box>
      <Header />
      <VehicleForm
        isContractAvailable={contract.isContractAvailable}
        isMock={contract.isMock}
        isSaving={createMutation.isPending}
        error={createMutation.error}
        onSubmit={handleSubmit}
        submitLabel="vehicle.save_draft"
      />
    </Box>
  );
}

export function VehicleDetail({ vehicleId }) {
  const router = useRouter();
  const { user } = useUserContext();
  const detail = useVehicleDetail(vehicleId);
  const editable = canEditVehicle(detail.data, user);

  return (
    <Box>
      <Header
        action={editable ? (
          <Button variant="contained" onClick={() => router.push(`/dashboard/vehicles/${vehicleId}/edit`)}>
            <FormattedMessage id="vehicle.edit" />
          </Button>
        ) : null}
      />

      {detail.isLoading && <CircularProgress />}

      {!detail.isContractAvailable && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <FormattedMessage id="vehicle.contract.core_unavailable" />
        </Alert>
      )}

      {detail.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <FormattedMessage id={mapVehicleApiError(detail.error)} />
        </Alert>
      )}

      {detail.data && (
        <>
          <VehicleSummary vehicle={detail.data} />
          <VehicleImageGallery vehicleId={vehicleId} />
        </>
      )}
    </Box>
  );
}

export function VehicleEdit({ vehicleId }) {
  const router = useRouter();
  const intl = useIntl();
  const { user } = useUserContext();
  const ownerId = resolveUserId(user);
  const detail = useVehicleDetail(vehicleId);
  const updateMutation = useUpdateVehicle();
  const editable = canEditVehicle(detail.data, user);

  const handleSubmit = (form) => {
    updateMutation.mutate({ id: vehicleId, form, ownerId }, {
      onSuccess: (vehicle) => {
        toast.success(intl.formatMessage({ id: "vehicle.updated" }));
        router.push(`/dashboard/vehicles/${vehicle.id}`);
      },
    });
  };

  return (
    <Box>
      <Header />

      {detail.isLoading && <CircularProgress />}

      {detail.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <FormattedMessage id={mapVehicleApiError(detail.error)} />
        </Alert>
      )}

      {detail.data && !editable && (
        <Alert severity="error">
          <FormattedMessage id="vehicle.error.forbidden" />
        </Alert>
      )}

      {detail.data && editable && (
        <>
          <VehicleForm
            initialVehicle={detail.data}
            isContractAvailable={detail.isContractAvailable}
            isMock={detail.isMock}
            isSaving={updateMutation.isPending}
            error={updateMutation.error}
            onSubmit={handleSubmit}
            submitLabel="vehicle.update_draft"
          />
          <VehicleImageManager vehicleId={vehicleId} />
          <VehicleDocumentManager vehicleId={vehicleId} user={user} />
        </>
      )}
    </Box>
  );
}

function Header({ action = null }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h5">
          <FormattedMessage id="vehicle.title" />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage id="vehicle.subtitle" />
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

function resolveUserId(user) {
  return user?.id || user?.userId || getStorageItem("userId");
}
