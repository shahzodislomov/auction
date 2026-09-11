import React from "react";
import { Typography } from "@mui/material";
import AuctCard from "@/components/MyAuctions/Card";
import { FormattedMessage } from "react-intl";

export default function Finished({ finished }) {
  if (!finished?.length) {
    return (
      <Typography variant="body1" className="text-center my-10">
        <FormattedMessage
          id="noFinishedLots"
        />
      </Typography>
    );
  }

  return (
    <div>
      {finished.map((lot) => (
        <AuctCard key={lot.id} lot={lot} />
      ))}
    </div>
  );
}
