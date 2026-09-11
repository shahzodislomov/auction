"use client"
import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar, Paper, Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import Transactions from './Transactions';
import { AccountBalanceWallet, TrendingUp, AccountBalance, CheckCircle, HourglassEmpty, Gavel, TrendingDown, Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Loader from '@/components/Loader';
import { api } from '@/api/api';
import Link from 'next/link';

export default function UserDashboard({ balance, userId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get(`/statistics/statisticsByUserId/${userId}`);
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, [userId]);

  if (!stats) {
    return <Loader />;
  }

  const statCards = [
    { icon: <AccountBalanceWallet color="success" />, label: <FormattedMessage id="dashboard.deposits" defaultMessage="Deposits" />, value: stats.depositCount },
    { icon: <Gavel color="primary" />, label: <FormattedMessage id="dashboard.bids" defaultMessage="Bids" />, value: stats.bidCount },
  ];

  return (
    <Box className="space-y-5 p-4">
      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            background: "linear-gradient(135deg, #1976D2 30%, #21CBF3 90%)",
            color: "white", borderRadius: 3, boxShadow: 3
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  <FormattedMessage id="dashboard.balance" defaultMessage="Your Balance" />
                </Typography>
                <AccountBalance fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight="bold" mt={2} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(balance)}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="body2">
                  <FormattedMessage id="dashboard.availableFunds" defaultMessage="Available Funds" />
                </Typography>
                <Button variant='contained' sx={{ borderRadius: '25px', background: 'white', color: '#1E88E5', fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  href='https://payme.uz/home/payment'
                  target='_blank'>
                  <FormattedMessage id="dashboard.recharge" defaultMessage="Top Up Balance" />
                  <Add />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Income and Outcome Cards */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {[
              { id: "dashboard.income", defaultMsg: "Income", value: `+ ${new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(stats.transactionsForMonth.plus)}`, color: "#4CAF50", icon: <TrendingUp fontSize="large" /> },
              { id: "dashboard.outcome", defaultMsg: "Outcome", value: `- ${new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(stats.transactionsForMonth.minus)}`, color: "#F44336", icon: <TrendingDown fontSize="large" /> }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card sx={{
                  background: `linear-gradient(135deg, ${item.color} 30%, ${item.color}80 90%)`,
                  color: "white", borderRadius: 3, boxShadow: 3
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight="bold">
                        <FormattedMessage id={item.id} defaultMessage={item.defaultMsg} />
                      </Typography>
                      {item.icon}
                    </Box>
                    <Typography variant="h4" fontWeight="bold" mt={2} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      <FormattedMessage id="dashboard.forThisMonth" defaultMessage="For this month" />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Lots Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              <FormattedMessage id="dashboard.lotsOverview" defaultMessage="Lots Overview" />
            </Typography>

            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Gavel color="primary" fontSize="large" />
                  <Typography variant="h6" fontWeight="bold" ml={2} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    <FormattedMessage id="dashboard.allLots" defaultMessage="All Lots" />: {stats.lotCount.allLotsCount}
                  </Typography>
                </Box>
                <Link href='/dashboard/createlot' className="hover:bg-primary-light bg-primary text-white py-1 px-2 rounded-full transition-all flex items-center">
                  <Add />
                  <Typography pr={1} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <FormattedMessage id="dashboard.createLot" defaultMessage="Create a lot" />
                  </Typography>
                </Link>
              </Box>
            </Card>

            <Grid container spacing={2}>
              {[
                { id: "dashboard.activeLots", count: stats.lotCount.activeLotsCount, icon: <TrendingUp fontSize="large" /> },
                { id: "dashboard.pendingLots", count: stats.lotCount.pendingLotsCount, icon: <HourglassEmpty fontSize="large" /> },
                { id: "dashboard.finishedLots", count: stats.lotCount.finishedLotsCount, icon: <CheckCircle fontSize="large" /> }
              ].map((lot, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    {lot.icon}
                    <Typography variant="h6" fontWeight="bold" mt={1} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {lot.count}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <FormattedMessage id={lot.id} />
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Stat Cards */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ borderRadius: 3, p: 3 }}>
            {statCards.map((card, index) => (
              <Card key={index} variant="outlined" sx={{ p: 2, my: 1, display: 'flex', alignItems: 'center' }}>
                {card.icon}
                <Box ml={2}>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {card.label}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Transactions */}
      <Box className="mt-8">
        <Transactions />
      </Box>
    </Box>
  );
}
