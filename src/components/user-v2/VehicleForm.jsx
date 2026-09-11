"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { AppSelect } from "@/components/ui/AppSelect";
import {
  VEHICLE_CONDITIONS,
  VEHICLE_DRIVETRAINS,
  VEHICLE_FUEL_TYPES,
  VEHICLE_TRANSMISSIONS,
  applyVehicleFormChange,
  createEmptyVehicleForm,
  mapVehicleApiError,
  normalizeVin,
  validateVehicleForm,
} from "@/features/user-v2/vehicle.mjs";
import {
  useActiveRegions,
  useActiveVehicleMakes,
  useDistrictsByRegion,
  useVehicleModelsByMake,
} from "@/queries/reference-data";

export default function VehicleForm({
  initialVehicle = null,
  isSaving = false,
  isContractAvailable = false,
  isMock = false,
  error = null,
  onSubmit,
  submitLabel = "vehicle.save_draft",
}) {
  const intl = useIntl();
  const locale = intl.locale || "uz";
  const [form, setForm] = useState(() => vehicleToForm(initialVehicle));
  const [touchedSubmit, setTouchedSubmit] = useState(false);

  const [prevInitialVehicle, setPrevInitialVehicle] = useState(initialVehicle);
  if (initialVehicle !== prevInitialVehicle) {
    setPrevInitialVehicle(initialVehicle);
    setForm(vehicleToForm(initialVehicle));
  }

  const makes = useActiveVehicleMakes(locale);
  const models = useVehicleModelsByMake(form.makeId, locale);
  const regions = useActiveRegions(locale);
  const districts = useDistrictsByRegion(form.regionId, locale);
  const validation = useMemo(() => validateVehicleForm(form), [form]);
  const hasBlockingErrors = hasBlockingValidationErrors(validation.errors);
  const saveDisabled = isSaving || !isContractAvailable || hasBlockingErrors;
  const apiErrorId = error ? mapVehicleApiError(error) : null;

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => applyVehicleFormChange(current, field, value));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouchedSubmit(true);

    const currentValidation = validateVehicleForm(form);
    if (hasBlockingValidationErrors(currentValidation.errors) || !isContractAvailable) return;

    onSubmit?.({
      ...form,
      vin: normalizeVin(form.vin),
    });
  };

  return (
    <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            <FormattedMessage id="vehicle.form_title" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id={isMock ? "vehicle.mock_note" : "vehicle.form_note"} />
          </Typography>
        </Box>

        {!isContractAvailable && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <FormattedMessage id="vehicle.contract.core_unavailable" />
          </Alert>
        )}

        {apiErrorId && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <FormattedMessage id={apiErrorId} />
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SelectField
              id="vehicle-make"
              labelId="vehicle.make"
              value={form.makeId}
              onChange={setField("makeId")}
              options={makes.options}
              loading={makes.isLoading}
              errorId={touchedSubmit ? validation.errors.makeId : null}
              disabled={!isContractAvailable || !makes.isContractAvailable}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectField
              id="vehicle-model"
              labelId="vehicle.model"
              value={form.modelId}
              onChange={setField("modelId")}
              options={models.options}
              loading={models.isLoading}
              errorId={touchedSubmit ? validation.errors.modelId : null}
              disabled={!isContractAvailable || !form.makeId || !models.isContractAvailable}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              type="number"
              label={intl.formatMessage({ id: "vehicle.year" })}
              value={form.year}
              onChange={setField("year")}
              error={Boolean(touchedSubmit && validation.errors.year)}
              helperText={formatHelper(intl, touchedSubmit && validation.errors.year)}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              label={intl.formatMessage({ id: "vehicle.vin" })}
              value={form.vin}
              onChange={setField("vin")}
              onBlur={() => setForm((current) => ({ ...current, vin: normalizeVin(current.vin) }))}
              error={Boolean(touchedSubmit && validation.errors.vin && validation.errors.vin !== "vehicle.validation.vin_checksum_hint")}
              helperText={
                formatHelper(intl, touchedSubmit && validation.errors.vin)
                || intl.formatMessage({ id: "vehicle.vin_hint" })
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label={intl.formatMessage({ id: "vehicle.mileage" })}
              value={form.mileage}
              onChange={setField("mileage")}
              error={Boolean(touchedSubmit && validation.errors.mileage)}
              helperText={formatHelper(intl, touchedSubmit && validation.errors.mileage)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label={intl.formatMessage({ id: "vehicle.engine_volume" })}
              value={form.engineVolume}
              onChange={setField("engineVolume")}
              error={Boolean(touchedSubmit && validation.errors.engineVolume)}
              helperText={formatHelper(intl, touchedSubmit && validation.errors.engineVolume)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <EnumSelect
              id="vehicle-fuel"
              labelId="vehicle.fuel_type"
              value={form.fuelType}
              onChange={setField("fuelType")}
              values={VEHICLE_FUEL_TYPES}
              messagePrefix="vehicle.fuel"
              disabled={!isContractAvailable}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <EnumSelect
              id="vehicle-transmission"
              labelId="vehicle.transmission"
              value={form.transmission}
              onChange={setField("transmission")}
              values={VEHICLE_TRANSMISSIONS}
              messagePrefix="vehicle.transmission_value"
              disabled={!isContractAvailable}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <EnumSelect
              id="vehicle-drivetrain"
              labelId="vehicle.drivetrain"
              value={form.drivetrain}
              onChange={setField("drivetrain")}
              values={VEHICLE_DRIVETRAINS}
              messagePrefix="vehicle.drivetrain_value"
              disabled={!isContractAvailable}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <EnumSelect
              id="vehicle-condition"
              labelId="vehicle.condition"
              value={form.condition}
              onChange={setField("condition")}
              values={VEHICLE_CONDITIONS}
              messagePrefix="vehicle.condition_value"
              disabled={!isContractAvailable}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={intl.formatMessage({ id: "vehicle.body_type" })}
              value={form.bodyType}
              onChange={setField("bodyType")}
              disabled={!isContractAvailable}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={intl.formatMessage({ id: "vehicle.color" })}
              value={form.color}
              onChange={setField("color")}
              disabled={!isContractAvailable}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectField
              id="vehicle-region"
              labelId="vehicle.region"
              value={form.regionId}
              onChange={setField("regionId")}
              options={regions.options}
              loading={regions.isLoading}
              disabled={!isContractAvailable || !regions.isContractAvailable}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectField
              id="vehicle-city"
              labelId="vehicle.city"
              value={form.cityId}
              onChange={setField("cityId")}
              options={districts.options}
              loading={districts.isLoading}
              disabled={!isContractAvailable || !form.regionId || !districts.isContractAvailable}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label={intl.formatMessage({ id: "vehicle.description" })}
              value={form.description}
              onChange={setField("description")}
              disabled={!isContractAvailable}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 1 }}>
          <Button type="submit" variant="contained" disabled={saveDisabled}>
            {isSaving && <CircularProgress size={18} sx={{ mr: 1 }} />}
            <FormattedMessage id={submitLabel} />
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

function SelectField({ id, labelId, value, onChange, options, disabled, loading, errorId }) {
  const intl = useIntl();
  const label = intl.formatMessage({ id: labelId });

  return (
    <div className="w-full">
      <AppSelect
        id={id}
        label={label}
        disabled={disabled}
        value={value}
        onChange={(val) => onChange?.({ target: { value: val } })}
        placeholder={loading ? intl.formatMessage({ id: "vehicle.loading" }) : intl.formatMessage({ id: "vehicle.select" })}
        options={options.map((opt) => ({
          value: opt.value,
          label: opt.label,
        }))}
      />
      {errorId && <FormHelperText error><FormattedMessage id={errorId} /></FormHelperText>}
    </div>
  );
}

function EnumSelect({ id, labelId, value, onChange, values, messagePrefix, disabled }) {
  const options = values.map((item) => ({
    value: item,
    label: <FormattedMessage id={`${messagePrefix}.${item}`} />,
  }));

  return (
    <SelectField
      id={id}
      labelId={labelId}
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
    />
  );
}

function vehicleToForm(vehicle) {
  if (!vehicle) return createEmptyVehicleForm();

  return {
    ...createEmptyVehicleForm(),
    makeId: valueToString(vehicle.makeId),
    modelId: valueToString(vehicle.modelId),
    year: valueToString(vehicle.year),
    vin: normalizeVin(vehicle.vin),
    mileage: valueToString(vehicle.mileage),
    engineVolume: valueToString(vehicle.engineVolume),
    fuelType: vehicle.fuelType || "",
    transmission: vehicle.transmission || "",
    drivetrain: vehicle.drivetrain || "",
    bodyType: vehicle.bodyType || "",
    color: vehicle.color || "",
    condition: vehicle.condition || "",
    regionId: valueToString(vehicle.regionId),
    cityId: valueToString(vehicle.cityId),
    description: vehicle.description || "",
  };
}

function valueToString(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function formatHelper(intl, messageId) {
  if (!messageId) return "";
  return intl.formatMessage({ id: messageId });
}

function hasBlockingValidationErrors(errors = {}) {
  const blocking = { ...errors };

  if (blocking.vin === "vehicle.validation.vin_checksum_hint") {
    delete blocking.vin;
  }

  return Object.keys(blocking).length > 0;
}
