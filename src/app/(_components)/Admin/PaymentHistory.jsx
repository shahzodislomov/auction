import React from 'react'
import { useAllTransactions } from '@/queries/transaction';
import { Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function PaymentHistory() {
  const { data } = useAllTransactions();
  return (
    <div>
      <div className='space-y-5'>
        <h1 className="text-2xl font-semibold px-4">Transactions</h1>
        <Divider />
        <TableContainer component={Paper} className='my-2'>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align='left'>Id</TableCell>
                <TableCell align="center">User</TableCell>
                <TableCell align="center">Amount</TableCell>
                <TableCell align="right">Created at</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align='left' scope="row">
                    {row.id}
                  </TableCell>
                  <TableCell align="center">
                    {row.userId}
                  </TableCell>
                  <TableCell align="center">
                    {row.amount}
                  </TableCell>
                  <TableCell align="right">{new Date(row.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div >
    </div>
  )
}
