import { Box, Button, Card, CardContent, Chip, Divider, Grid, Typography } from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";
import NextLink from "next/link";

export default function AuctCard({ lot }) {
    return (
        <Grid item xs={12} sm={6} md={4} key={lot.id}>
            <Card
                elevation={4}
                sx={{
                    borderRadius: 3,
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.03)" },
                }}
            >
                <CardContent>
                    {/* Lot Title and Status */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">
                            {lot.title}
                        </Typography>
                        <Chip
                            label={lot.lotStatus}
                            color={lot.lotStatus === "ACTIVE" ? "success" : "default"}
                            size="small"
                        />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Bid History */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                            <FormattedMessage id="dashboard.mybids" />:
                        </Typography>
                        {lot.bids?.length ? (
                            lot.bids.map((bid) => (
                                <Box key={bid.id} display="flex" alignItems="center" justifyContent="space-between" mb={1} p={1} borderRadius={2} sx={{ backgroundColor: "#f5f5f5" }}>
                                    <Typography variant="body2">
                                        {bid.bidAmount} UZS
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {new Date(bid.bidTime).toLocaleString()}
                                    </Typography>
                                    {bid.bidStatus && (
                                        <Chip
                                            label={bid.bidStatus}
                                            color={bid.bidStatus === "WINNING" ? "success" : "default"}
                                            size="small"
                                        />
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                <FormattedMessage id="dashboard.nobids" />
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* View Lot Button */}
                    <Box textAlign="center" mt={2}>
                        <Button
                            component={NextLink}
                            href={`/lots/bidding/${lot.id}`}
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ borderRadius: 2, fontWeight: "bold" }}
                        >
                            <FormattedMessage id="view" />
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
}
