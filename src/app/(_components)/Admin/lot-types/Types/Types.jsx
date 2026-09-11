import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Loader from '@/components/Loader';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Divider } from '@mui/material';
import SubRow from './TypesRow';
import { Settings } from '@mui/icons-material';
import { useLotTypes } from '@/queries/lot-types';
import CreateType from './create';
import EditType from './edit';

export default function Lottypes() {
  const { data: lotTypesData, isLoading: isLotTypesLoading, refetch } = useLotTypes(0, 20);
  const [addModal, setAddModal] = React.useState(false);
  const [editModal, setEditModal] = React.useState(false);
  const [typeToEdit, setTypeToEdit] = React.useState('')

  if (isLotTypesLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <div className="text-2xl font-semibold">
          <FormattedMessage id='lotTypes' />
        </div>
        <Button variant='contained' onClick={() => setAddModal(true)}>
          <FormattedMessage id='create' />
        </Button>
      </div>
      <Divider />
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead sx={{ bgcolor: '#f3f4f6' }}>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell align="left"><FormattedMessage id='name' /></TableCell>
              <TableCell align="right"><Settings /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lotTypesData?.map((row) => (
              <SubRow key={row.id} row={row} lotTypesData={lotTypesData} refetch={refetch} setTypeToEdit={setTypeToEdit} setEditModal={setEditModal} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateType open={addModal} setOpen={setAddModal} />
      <EditType open={editModal} setOpen={setEditModal} data={typeToEdit} />
    </div>
  );
}