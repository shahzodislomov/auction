import React from "react";
import { Typography } from "@mui/material";
import AuctCard from "@/components/MyAuctions/Card";
import { FormattedMessage } from "react-intl";

export default function Pending({ pending }) {
  if (!pending?.length) {
    return (
      <Typography variant="body1" className="text-center my-10">
        <FormattedMessage
          id="noPendingLots"
        />
      </Typography>
    );
  }

  return (
    <div>
      {pending.map((lot) => (
        <AuctCard key={lot.id} lot={lot} />
      ))}
    </div>
  );
}
