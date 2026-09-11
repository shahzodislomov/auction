import { getStorageItem } from "@/utils/storage";
import React from "react";
import {
  Box,
  Divider,
  Grid,
  Typography
} from "@mui/material";
import { useLikedLots } from "@/queries/lots";
import LotCard from "@/components/Lots/LotCard";
import { FormattedMessage } from "react-intl";
import Link from "next/link";
import Loader from "@/components/Loader";

export default function Likes() {
  const userId = getStorageItem("userId");
  const { data: likedLots, isLoading, isError } = useLikedLots(userId);

  return (
    <div className='space-y-5'>
      <h1 className="text-2xl font-semibold px-4"><FormattedMessage id="Likedlots" /></h1>
      <Divider sx={{ mb: 3 }} />

      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <Loader />
        </Box>
      )}

      {isError && (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <Typography variant="h6" color="error">
            <FormattedMessage id="error" />
          </Typography>
        </Box>
      )}

      {!isLoading && likedLots?.length === 0 && (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="50vh" textAlign="center">
          <Typography variant="h6" color="text.secondary">
            <FormattedMessage id='nolikedlots' />
          </Typography>
          <Typography variant="body1" mt={1}>
            <Link href='/auctions' className="underline text-primary mr-2">
              <FormattedMessage id='nolikedlots' />
            </Link>
            <FormattedMessage id='likebtn' />
          </Typography>
        </Box>
      )}

      {!isLoading && likedLots?.length > 0 && (
        <Grid container spacing={4}>
          {likedLots.map((lot) => (
            <Grid item xs={12} sm={6} md={4} key={lot.id}>
              <LotCard lot={lot} userId={userId} />
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}
