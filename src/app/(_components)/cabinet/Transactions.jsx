import { getStorageItem } from "@/utils/storage";
import React from 'react';
import { useAllTransactionsByUserId } from '@/queries/transaction';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  Box,
  IconButton,
} from '@mui/material';
import { AttachMoney, Event, ReceiptLong, CompareArrows, HelpOutlineOutlined as HelpOutline, AccountBalanceWallet, Gavel, Receipt, Autorenew } from '@mui/icons-material';

export default function Transactions() {
  const userId = getStorageItem("userId");
  const { data } = useAllTransactionsByUserId(userId, 0, 20);
  const intl = useIntl();

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <Gavel color="warning" fontSize='medium' />;
      case 'REFUND':
        return <Autorenew color="success" />;
      case 'PAYMENT':
        return <AccountBalanceWallet color="success" />;
      case 'FINAL':
        return <AttachMoney color="error" />;
      default:
        return <HelpOutline color="disabled" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'warning';
      case 'REFUND':
        return 'success';
      case 'PAYMENT':
        return 'success';
      case 'FINAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const getType = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return intl.formatMessage({ id: 'Deposit' });
      case 'REFUND':
        return intl.formatMessage({ id: 'Refund' });
      case 'PAYMENT':
        return intl.formatMessage({ id: 'Refill' });
      case 'FINAL':
        return intl.formatMessage({ id: 'Payment' });
      default:
        return intl.formatMessage({ id: 'Unknown' });
    }
  };

  return (
    <Box className='space-y-5 pb-[100px]'>
      <div className="text-2xl font-semibold px-4">
        <FormattedMessage id="Transactions" />
      </div>
      <Divider />
      <div className='block md:hidden'>
        {data
          ?.slice() // Make a shallow copy to avoid mutating original data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt, newest first
          .map((row, index) => (
            <div className="bg-gray-100 mb-2 rounded-md flex items-center justify-between px-2 py-2">
              <div className="flex items-center justify-center">
                <div className={`rounded-md p-2`}>
                  {getTypeIcon(row.transactionType)}
                </div>
                <div className="block ml-2">
                  <div className="font-semibold text-[18px]">
                    {getType(row.transactionType)}
                  </div>
                  <div className="text-[12px] text-gray-500">
                    {new Date(row.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <Chip
                label={`${row.amount.toFixed(2)} UZS`}
                color={getTypeColor(row.transactionType)}
              />
            </div>
          ))}
      </div>
      <TableContainer component={Paper} className='shadow-md rounded-2xl hidden md:flex'>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align='left'>#</TableCell>
              <TableCell align="center"><FormattedMessage id='amount' /></TableCell>
              <TableCell align="center"><FormattedMessage id='date' /></TableCell>
              <TableCell align="center"><FormattedMessage id='type' /></TableCell>
              <TableCell align="right"><FormattedMessage id='cheque' /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              ?.slice() // Make a shallow copy to avoid mutating original data
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt, newest first
              .map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell align='left'>
                    <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', color: 'white' }}>
                      {index + 1}
                    </Avatar>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" fontWeight="medium">
                      {row.amount.toFixed(2)} UZS
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {new Date(row.createdAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={getTypeIcon(row.transactionType)}
                      label={getType(row.transactionType)}
                      color={getTypeColor(row.transactionType)}
                      variant="outlined"
                      sx={{ borderRadius: '8px' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton className="text-gray-400">
                      <Receipt />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box >
  );
}
