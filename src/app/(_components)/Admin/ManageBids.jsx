import { Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react'
import { useAllBids } from '@/queries/bid';


export default function ManageBids() {

  const { data } = useAllBids();
  return (
    <div className='space-y-5'>
      <h1 className="text-2xl font-semibold px-4">All bids</h1>
      <Divider />
      <TableContainer component={Paper} className='my-2'>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align='left'>Bid Id</TableCell>
              <TableCell align="center">Bidder</TableCell>
              <TableCell align="center">Bid Amount</TableCell>
              <TableCell align="center">Status</TableCell>
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
                  {row.bidderDto.id}
                </TableCell>
                <TableCell align="center">
                  {row.bidAmount}
                </TableCell>
                <TableCell align="center">
                    {row.bidStatus}
                </TableCell>
                <TableCell align="right">{new Date(row.bidTime).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
