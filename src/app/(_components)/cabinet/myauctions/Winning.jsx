import { getStorageItem } from "@/utils/storage";
import React from "react";
import { useWinningLots } from "@/queries/lots";
import { Card, CardContent, CardMedia, Typography, Grid, Button, Box } from "@mui/material";
import { format } from "date-fns";
import { useNavigate } from "next/navigation";
import { FormattedMessage, useIntl } from "react-intl";

export default function Winning() {
    const userId = getStorageItem("userId");
    const { data } = useWinningLots(userId);
    const navigate = useNavigate();
    const intl = useIntl();

    if (!data?.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography variant="h6" color="textSecondary">
                    <FormattedMessage id="noWinningLots" defaultMessage="You haven't won any lots." />
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: "1200px", margin: "auto", padding: 3 }}>
            <Grid container spacing={3}>
                {data.map((lot) => (
                    <Grid item xs={12} sm={6} md={4} key={lot.id}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                boxShadow: 3,
                                overflow: "hidden",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": { transform: "scale(1.03)" },
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="220"
                                image={lot.lotImageDtoList[0]?.imageUrl || "/placeholder.jpg"}
                                alt={lot.title}
                                sx={{ objectFit: "cover" }}
                            />
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {lot.title}
                                </Typography>

                                {/* Winning Price */}
                                <Box display="flex" alignItems="center" mb={1}>
                                    <Typography variant="body1" fontWeight="500" color="textSecondary" mr={1}>
                                        <FormattedMessage id='wonprice' />:
                                    </Typography>
                                    <Box
                                        sx={{
                                            // backgroundColor: "primary.main",
                                            // color: "white",
                                            fontWeight: "bold",
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: "6px",
                                            fontSize: "18px",
                                        }}
                                    >
                                        {lot.currentPrice} UZS
                                    </Box>
                                </Box>

                                {/* Auction Status */}
                                <Typography
                                    variant="body2"
                                    fontWeight="500"
                                    color={lot.lotStatus === "FINISHED" ? "success.main" : "error.main"}
                                >
                                    {lot.lotStatus === "FINISHED" ? intl.formatMessage({ id: 'auctfinished' }) : intl.formatMessage({ id: 'auctongoing' })}
                                </Typography>

                                {/* View Details Button */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ marginTop: 2, borderRadius: 2, fontWeight: "bold" }}
                                    onClick={() => navigate(`/lots/bidding/${lot.id}`)}
                                >
                                    <FormattedMessage id='tolotcard' />
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
