"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import {
  REFERENCE_CONTRACTS,
  buildArchivePayload,
  validateReferenceName,
} from "@/features/user-v2/reference-data.mjs";
import {
  useActiveVehicleMakes,
  useVehicleModelsByMake,
} from "@/queries/reference-data";

const pageSize = 10;

export default function VehicleReferences() {
  const intl = useIntl();
  const [tab, setTab] = useState("makes");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [selectedMakeId, setSelectedMakeId] = useState("");
  const makes = useActiveVehicleMakes();
  const models = useVehicleModelsByMake(selectedMakeId);
  const activeContract = tab === "makes" ? REFERENCE_CONTRACTS.vehicleMakes : REFERENCE_CONTRACTS.vehicleModels;

  const rows = useMemo(() => {
    const source = tab === "makes" ? makes.data || [] : models.data || [];
    return source.filter((item) =>
      String(item.name || item.nameUz || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );
  }, [makes.data, models.data, search, tab]);

  const validation = validateReferenceName(name, rows);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const exampleArchivePayload = buildArchivePayload("id", true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          <FormattedMessage id="reference.vehicle_title" />
        </h1>
        <p className="text-sm text-gray-500">
          <FormattedMessage id="reference.vehicle_subtitle" />
        </p>
      </div>

      <Alert severity="warning">
        <FormattedMessage id={activeContract.reason} />
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, value) => { setTab(value); setPage(1); }}>
          <Tab value="makes" label={intl.formatMessage({ id: "reference.makes" })} />
          <Tab value="models" label={intl.formatMessage({ id: "reference.models" })} />
        </Tabs>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextField
          label={intl.formatMessage({ id: "search" })}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
        />
        {tab === "models" ? (
          <FormControl size="small">
            <InputLabel id="vehicle-make-filter-label">
              <FormattedMessage id="reference.make_filter" />
            </InputLabel>
            <Select
              labelId="vehicle-make-filter-label"
              label={intl.formatMessage({ id: "reference.make_filter" })}
              value={selectedMakeId}
              onChange={(event) => setSelectedMakeId(event.target.value)}
              disabled={!makes.isContractAvailable}
            >
              <MenuItem value="">
                <FormattedMessage id="reference.select_make" />
              </MenuItem>
              {makes.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
        <TextField
          label={intl.formatMessage({ id: "reference.name" })}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={Boolean(name) && !validation.valid}
          helperText={Boolean(name) && validation.reason ? intl.formatMessage({ id: validation.reason }) : ""}
          size="small"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="contained" disabled={!activeContract.available || !validation.valid}>
          <FormattedMessage id="create" />
        </Button>
        <Button variant="outlined" disabled={!activeContract.available}>
          <FormattedMessage id="save" />
        </Button>
      </div>

      <Divider />

      <div className="rounded border border-gray-200 bg-white">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-gray-200 p-3 text-sm font-semibold text-gray-700">
          <FormattedMessage id="reference.name" />
          <FormattedMessage id="reference.status" />
          <FormattedMessage id="reference.actions" />
        </div>
        {visibleRows.length > 0 ? (
          visibleRows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-gray-100 p-3 text-sm">
              <span>{row.name || row.nameUz || row.id}</span>
              <Chip size="small" label={intl.formatMessage({ id: row.active === false ? "reference.archived" : "reference.active" })} />
              <div className="flex gap-2">
                <Button size="small" disabled={!activeContract.available}>
                  <FormattedMessage id="edit" />
                </Button>
                <Button size="small" color="warning" disabled={!activeContract.available}>
                  <FormattedMessage id={row.active === false ? "reference.activate" : "reference.archive"} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            <FormattedMessage id={activeContract.available ? "reference.empty" : "reference.unavailable_empty"} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Pagination page={page} count={pageCount} onChange={(_, value) => setPage(value)} />
        <span className="text-xs text-gray-500">
          <FormattedMessage id="reference.archive_note" /> {JSON.stringify(exampleArchivePayload)}
        </span>
      </div>
    </div>
  );
}
