// import { ArrowForward } from "@mui/icons-material";
// import { Box, Button, Grid, Typography, Paper } from "@mui/material";
// import React from "react";
// import { Link } from "next/link";
// import LotCard from "./LotCard";
// import { FormattedMessage } from "react-intl";

import  Link  from "next/link";

export default function TopLots({ data }) {
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
        //         <h1 className="text-2xl font-semibold md:px-4"><FormattedMessage id="topLots" /></h1>

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
        <section className="section" style={{ backgroundColor: "var(--light-gray)" }}>
            <div className="container">
                <h2 className="section-title">Eng yaxshi baholangan lotlar</h2>

                <div className="auctions">
                    <div className="auction-card animate" style={{ animationDelay: "0.1s" }}>
                        <div className="auction-image">
                            <img src="https://frankfurt.apollo.olxcdn.com/v1/files/7dd4zn22d46s3-UZ/image" alt="Auction item" />
                            <div className="auction-status">TASDIQILANGAN</div>
                        </div>
                        <div className="auction-content">
                            <h3 className="auction-title">Zamonaviy uy, Toshkent</h3>
                            <div className="auction-info">
                                <div className="auction-price">
                                    <div className="auction-price-label">Joriy narxi</div>
                                    <div className="auction-price-value">101,000,000 UZS</div>
                                </div>
                                <div className="auction-time">
                                    <div className="auction-time-label">Qolgan vaqt</div>
                                    <div className="auction-time-value">2 kun, 4 soat</div>
                                </div>
                            </div>
                            <div className="auction-footer">
                                <div className="auction-bids">13 ta taklif</div>
                                <button className="btn btn-primary btn-sm">TAKLIF</button>
                            </div>
                        </div>
                    </div>

                    <div className="auction-card animate" style={{ animationDelay: "0.2s" }}>
                        <div className="auction-image">
                            <img src="https://a.d-cd.net/CY4M4b10sDvghLHzYmHWmSmUlKA-1920.jpg" alt="Auction item" />
                            <div className="auction-status">TASDIQILANGAN</div>
                        </div>
                        <div className="auction-content">
                            <h3 className="auction-title">Toyota Land Cruiser, 2022</h3>
                            <div className="auction-info">
                                <div className="auction-price">
                                    <div className="auction-price-label">Joriy narxi</div>
                                    <div className="auction-price-value">450,000,000 UZS</div>
                                </div>
                                <div className="auction-time">
                                    <div className="auction-time-label">Qolgan vaqt</div>
                                    <div className="auction-time-value">5 kun, 12 soat</div>
                                </div>
                            </div>
                            <div className="auction-footer">
                                <div className="auction-bids">8 ta taklif</div>
                                <button className="btn btn-primary btn-sm">TAKLIF</button>
                            </div>
                        </div>
                    </div>

                    <div className="auction-card animate" style={{ animationDelay: "0.3s" }}>
                        <div className="auction-image">
                            <img src="https://avatars.mds.yandex.net/get-altay/9954022/2a00000188d00f7d71006decac692979492c/XXL_height" alt="Auction item" />
                            <div className="auction-status">TASDIQILANGAN</div>
                        </div>
                        <div className="auction-content">
                            <h3 className="auction-title">Tikuvchilik fabrikasi</h3>
                            <div className="auction-info">
                                <div className="auction-price">
                                    <div className="auction-price-label">Joriy narxi</div>
                                    <div className="auction-price-value">2,500,000,000 UZS</div>
                                </div>
                                <div className="auction-time">
                                    <div className="auction-time-label">Qolgan vaqt</div>
                                    <div className="auction-time-value">1 kun, 6 soat</div>
                                </div>
                            </div>
                            <div className="auction-footer">
                                <div className="auction-bids">5 ta taklif</div>
                                <button className="btn btn-primary btn-sm">TAKLIF</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: "center", marginTop: "40px" }}>
                    <Link href='/auctions' className="btn btn-primary">Barcha auksionlarni ko'rish</Link>
                </div>
            </div>
        </section>
    );
}
