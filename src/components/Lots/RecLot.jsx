import React from "react";
// import { ArrowForward } from "@mui/icons-material";
// import { Box, Button, Grid, Typography, Paper } from "@mui/material";
// import { Link } from "next/navigation";
// import LotCard from "./LotCard";
// import { FormattedMessage } from "react-intl";

export default function RecLots({ data }) {
    return (

        // <div
        // // elevation={4}
        // // sx={{
        // //     p: 2,
        // //     borderRadius: 3,
        // //     background: "linear-gradient(90deg, #1e88e5, #4fc3f7)",
        // //     color: "white",
        // // }}
        // >
        //     <Box display="flex" justifyContent="space-between" alignItems="center" className="px-2 md:px-4 py-2 rounded-md text-text" >
        //         <h1 className="text-2xl font-semibold md:px-4"><FormattedMessage id="recLots" /></h1>

        //         <Link href="/auctions" style={{ textDecoration: "none" }}>
        //             <Button
        //                 variant="contained"
        //                 endIcon={<ArrowForward />}
        //             >
        //                 <FormattedMessage id="all" />
        //             </Button>
        //         </Link>
        //     </Box>
        //     <Box mt={3}>
        //         {data?.length > 0 ? (
        //             <Grid container spacing={3}>
        //                 {data.map((lot) => (
        //                     <Grid item xs={12} sm={6} md={4} lg={3} key={lot.id}>
        //                         <LotCard lot={lot} />
        //                     </Grid>
        //                 ))}
        //             </Grid>
        //         ) : (
        //             <Box
        //                 display="flex"
        //                 justifyContent="center"
        //                 alignItems="center"
        //                 height="200px"
        //                 bgcolor="rgba(255, 255, 255, 0.2)"
        //                 borderRadius={2}
        //             >
        //                 <Typography variant="h6" color="primary" textAlign="center">
        //                     <FormattedMessage id="NALots" />
        //                 </Typography>
        //             </Box>
        //         )}
        //     </Box>
        // </div>
        <section className="section">
            <div className="container">
                <h2 className="section-title">Tavsiya etilgan lotlar</h2>

                <div className="auctions">
                    <div className="auction-card">
                        <div className="auction-image">
                            <img src="https://as2.ftcdn.net/v2/jpg/02/10/62/03/1000_F_210620329_0le9P2aUC9LUqCyf6yqiV8MtVWrzGKi7.jpg" alt="Auction item"/>
                                <div className="auction-status">TASDIQILANGAN</div>
                        </div>
                        <div className="auction-content">
                            <h3 className="auction-title">Biznes markazidagi ofis</h3>
                            <div className="auction-info">
                                <div className="auction-price">
                                    <div className="auction-price-label">Joriy narxi</div>
                                    <div className="auction-price-value">320,000,000 UZS</div>
                                </div>
                                <div className="auction-time">
                                    <div className="auction-time-label">Qolgan vaqt</div>
                                    <div className="auction-time-value">3 kun, 8 soat</div>
                                </div>
                            </div>
                            <div className="auction-footer">
                                <div className="auction-bids">4 ta taklif</div>
                                <button className="btn btn-primary btn-sm">TAKLIF</button>
                            </div>
                        </div>
                    </div>

                    <div className="auction-card">
                        <div className="auction-image">
                            <img src="https://frankfurt.apollo.olxcdn.com/v1/files/wizip5orbaf22-UZ/image" alt="Auction item"/>
                                <div className="auction-status">TASDIQILANGAN</div>
                        </div>
                        <div className="auction-content">
                            <h3 className="auction-title">Samsung Galaxy Z Fold 4</h3>
                            <div className="auction-info">
                                <div className="auction-price">
                                    <div className="auction-price-label">Joriy narxi</div>
                                    <div className="auction-price-value">8,500,000 UZS</div>
                                </div>
                                <div className="auction-time">
                                    <div className="auction-time-label">Qolgan vaqt</div>
                                    <div className="auction-time-value">6 soat, 15 daqiqa</div>
                                </div>
                            </div>
                            <div className="auction-footer">
                                <div className="auction-bids">10 ta taklif</div>
                                <button className="btn btn-primary btn-sm">TAKLIF</button>
                            </div>
                        </div>
                    </div>

                    <div className="auction-card">
                        <div className="auction-image">
                            <img src="https://i.pinimg.com/736x/fc/ce/8f/fcce8fbabde2328bc74b3e305246c189.jpg" alt="Auction item"/>
                                <div className="auction-status">TASDIQILANGAN</div>
                        </div>
                        <div className="auction-content">
                            <h3 className="auction-title">Qadimiy xalqaro mebel to'plami</h3>
                            <div className="auction-info">
                                <div className="auction-price">
                                    <div className="auction-price-label">Joriy narxi</div>
                                    <div className="auction-price-value">15,000,000 UZS</div>
                                </div>
                                <div className="auction-time">
                                    <div className="auction-time-label">Qolgan vaqt</div>
                                    <div className="auction-time-value">4 kun, 2 soat</div>
                                </div>
                            </div>
                            <div className="auction-footer">
                                <div className="auction-bids">7 ta taklif</div>
                                <button className="btn btn-primary btn-sm">TAKLIF</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{textAlign: 'center', marginTop: '40px'}}>
                    <a href="#" className="btn btn-primary">Barcha tavsiya etilgan lotlarni ko'rish</a>
                </div>
            </div>
        </section>
    );
}
