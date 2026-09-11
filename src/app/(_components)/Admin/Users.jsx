import React from 'react'
import UsersTable from '@/components/UsersTable'
import { useAllUsers } from '@/queries/users'
import { Box, Divider } from '@mui/material';


export default function Users() {
  const { data } = useAllUsers(0, 20);

  return (
    <div className='space-y-5'>
      <h1 className="text-2xl font-semibold px-4">Users</h1>
      <Divider/>
      <UsersTable data={data} />
    </div>
  )
}
