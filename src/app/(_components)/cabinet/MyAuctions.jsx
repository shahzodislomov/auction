import { getStorageItem } from "@/utils/storage";
import React, { useState, useEffect } from "react";
import {
  Divider,
  Typography,
  CircularProgress
} from "@mui/material";
import { useUserParticipated } from "@/queries/lots";
import Link from "next/link";
import { FormattedMessage } from "react-intl";
import AuctCard from "@/components/MyAuctions/Card";
import Active from "./myauctions/Active";
import Pending from "./myauctions/Pending";
import Finished from "./myauctions/Finished";
import Canceled from "./myauctions/Canceled";
import Winning from "./myauctions/Winning";

export default function ParticipatedLots() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    setUserId(getStorageItem("userId"));
  }, []);

  const { data, isLoading } = useUserParticipated(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  // Filter data based on status
  const active = data?.filter(lot => lot.lotStatus === "ACTIVE");
  const pending = data?.filter(lot => lot.lotStatus === "PENDING");
  const finished = data?.filter(lot => lot.lotStatus === "FINISHED");
  const canceled = data?.filter(lot => lot.lotStatus === "CANCELED");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold px-4">
        <FormattedMessage id="Myauctions" />
      </h1>
      <Divider />

      {/* {data?.length ? (
        <div>
          {data.map((lot) => (
            <AuctCard key={lot.id} lot={lot} />
          ))}
        </div>
      ) : (
        <Typography variant="body1" className="text-center my-10">
          <FormattedMessage id="noParticipatedLots" defaultMessage="You haven’t participated in any lots yet." />{" "}
          <Link href="/auctions">
            <FormattedMessage id="startBiddingNow" defaultMessage="Start bidding now!" />
          </Link>
        </Typography>
      )} */}

      <Active active={active} />
    </div>
  );
}
