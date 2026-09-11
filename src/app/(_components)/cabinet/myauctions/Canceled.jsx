import React from "react";
import { Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import AuctCard from "@/components/MyAuctions/Card";

export default function Canceled({ canceled }) {
  if (!canceled?.length) {
    return (
      <Typography variant="body1" className="text-center my-10">
        <FormattedMessage
          id="noCanceledLots"
        />
      </Typography>
    );
  }

  return (
    <div>
      {canceled.map((lot) => (
        <AuctCard key={lot.id} lot={lot} />
      ))}
    </div>
  );
}
