"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import {
  useAuthSessions,
  useRevokeAuthSession,
  useRevokeOtherAuthSessions,
} from "@/queries/authSessions";

const Sessions = () => {
  const intl = useIntl();
  const { data: sessions = [], isLoading, error, refetch } = useAuthSessions();
  const revokeSession = useRevokeAuthSession();
  const revokeOthers = useRevokeOtherAuthSessions();
  const errorMessage = error?.message || error?.code;
  const isContractUnavailable =
    errorMessage === "auth.sessions.contractUnavailable";

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress aria-label={intl.formatMessage({ id: "auth.sessions.loading" })} />
      </Box>
    );
  }

  if (isContractUnavailable) {
    return (
      <Alert severity="info">
        <FormattedMessage id="auth.sessions.contractUnavailable" />
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            <FormattedMessage id="auth.retry" />
          </Button>
        }
      >
        <FormattedMessage id={errorMessage || "unexpected_error"} />
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2 }}>
        <Typography variant="h6">
          <FormattedMessage id="auth.sessions.title" />
        </Typography>
        <Button
          variant="outlined"
          color="warning"
          disabled={revokeOthers.isPending}
          onClick={() => revokeOthers.mutate()}
        >
          <FormattedMessage id="auth.sessions.revokeOthers" />
        </Button>
      </Box>

      {sessions.length === 0 ? (
        <Alert severity="info">
          <FormattedMessage id="auth.sessions.empty" />
        </Alert>
      ) : (
        <List>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              divider
              secondaryAction={
                !session.current && (
                  <Button
                    color="error"
                    disabled={revokeSession.isPending}
                    onClick={() => revokeSession.mutate(session.id)}
                  >
                    <FormattedMessage id="auth.sessions.revoke" />
                  </Button>
                )
              }
            >
              <ListItemText
                primary={session.deviceName || session.id}
                secondary={
                  session.current
                    ? intl.formatMessage({ id: "auth.sessions.current" })
                    : session.lastSeenAt || session.ipAddress || ""
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Sessions;
