import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // For example chart component
import { Card, CardContent, Divider, Typography } from '@mui/material'; // Material UI components for layout
import { useLotStatistics, useTranStatistics, useUserStatistics } from '@/queries';
import { AttachMoney, Block, CheckCircle, Gavel, Pending, PendingActions, People, PlayCircleFilled } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import { useMonthlyStats } from '@/queries/lots';

export default function Dashboard() {

  const { data: userStats } = useUserStatistics();
  const { data: lotStats } = useLotStatistics();
  const { data: tranStats } = useTranStatistics();
  const { data: monthlyStats } = useMonthlyStats();

  const formattedNumber = tranStats?.allTransactionCount?.toLocaleString("en-US");

  // Transform monthlyStats data for the chart
  const chartData = monthlyStats?.map(stat => ({
    name: stat.month.trim(),
    lotCount: stat.lotCount,
    bidCount: stat.bidCount,
    userCount: stat.userCount,
  })) || [];

  return (
    <div className='space-y-5'>
      {/* <h1 className="text-2xl font-semibold px-4">Dashboard</h1>
      <Divider /> */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Total Users */}
        <div className='col-span-4 p-4 rounded border border-stone-300' style={{ flex: 1 }}>
          <div className="flex mb-8 items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-primary gap-2 flex items-center justify-around">
              <People />
              <div className='text-[22px]'>{userStats?.allUsersCount}</div>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-500 gap-2 flex items-center justify-around">
              <CheckCircle color='success' />
              <div className='text-[22px]'>{userStats?.activeUsersCount}</div>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-500 gap-2 flex items-center justify-around">
              <Pending color='warning' />
              <div className='text-[22px]'>{userStats?.pendingUsersCount}</div>
            </div>
            <div className="bg-red-100 p-2 rounded-lg text-red-500 gap-2 flex items-center justify-around">
              <Block color='error' />
              <div className='text-[22px]'>{userStats?.blockedUsersCount}</div>
            </div>
          </div>
          <FormattedMessage id='userStats' defaultMessage='Foydalanuvchilar' />
        </div>
        <div className='col-span-4 p-4 rounded border border-stone-300' style={{ flex: 1 }}>
          <div className="flex mb-8 items-center">
            <div className="bg-blue-100 p-2 rounded-lg text-primary mr-2 flex items-center justify-around">
              <AttachMoney />
            </div>
            <div className='text-[22px]'>{formattedNumber}</div>
          </div>
          <FormattedMessage id='totalSales' defaultMessage='Umumiy pul aylanmasi' />
        </div>

        <div className='col-span-4 p-4 rounded border border-stone-300' style={{ flex: 1 }}>
          <div className="flex mb-8 items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-primary gap-2 flex items-center justify-around">
              <Gavel />
              <div className='text-[22px]'>{lotStats?.allLotsCount || 0}</div>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-500 gap-2 flex items-center justify-around">
              <CheckCircle color='success' />
              <div className='text-[22px]'>{lotStats?.finishedLotsCount || 0}</div>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-500 gap-2 flex items-center justify-around">
              <PlayCircleFilled color='success' />
              <div className='text-[22px]'>{lotStats?.activeLotsCount || 0}</div>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-500 gap-2 flex items-center justify-around">
              <PendingActions color='warning' />
              <div className='text-[22px]'>{lotStats?.pendingLotsCount || 0}</div>
            </div>
          </div>
          <FormattedMessage id='lotStats' defaultMessage='Lotlar' />
        </div>

        {/* Total Sales */}
        {/* <Card style={{ flex: 1 }}>
          <CardContent>
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-2 rounded-lg text-primary mr-2">
                <AttachMoney />
              </div>
              <Typography variant="h4">{formattedNumber}</Typography>
            </div>
            <FormattedMessage id='totalSales' defaultMessage='Umumiy pul aylanmasi' />
          </CardContent>
        </Card> */}

        {/* Active Bids */}
        {/* <Card style={{ flex: 1 }}>
          <CardContent>
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-2 rounded-lg text-primary mr-2">
                <Gavel />
              </div>
              <Typography variant="h4">{lotStats?.allLotsCount}</Typography>
            </div>
            <FormattedMessage id='totalLots' defaultMessage='Umumiy lotlar' />
          </CardContent>
        </Card> */}
      </div>

      <div className="col-span-8 overflow-hidden rounded border border-stone-300">
        <div className="p-4">
          <h3 className="flex items-center gap-1.5 font-medium">
            Activity
          </h3>
        </div>
        {/* Chart for Monthly Statistics */}
        <div className="h-64 px-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lotCount" stroke="#8884d8" name="Lots" />
              <Line type="monotone" dataKey="bidCount" stroke="#82ca9d" name="Bids" />
              <Line type="monotone" dataKey="userCount" stroke="#ff7300" name="Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* <div style={{ marginTop: '30px' }}>
        <h3>Recent Activity</h3>
        <ul>
          <li>User JohnDoe placed a bid on Lot #123</li>
          <li>User JaneSmith completed a sale of Lot #456</li>
          <li>Admin approved new listing for Lot #789</li>
        </ul>
      </div> */}
    </div>
  );
}
