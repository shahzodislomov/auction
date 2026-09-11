import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Loader from '@/components/Loader';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useDeleteLotTypeMutation, useLotTypes } from '@/queries/lot-types';
import { useSubByType } from '@/queries/subtypes';
import { FormattedMessage, useIntl } from 'react-intl';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { AddCircleOutlineOutlined as AddCircleOutline, Delete, Edit, RemoveCircleOutlineOutlined as RemoveCircleOutline } from '@mui/icons-material';
import MySwal from "sweetalert2";
import { toast } from 'react-toastify';
import DialogModal from '@/components/ui/DialogModal'
import { useAttr, useAttrBySubtype, useAttrOptions, useTieAttribute } from '@/queries/attributes';
import AttrModal from '../attributes/Modal';
import SubTypesRow from '../sub-types/SubTypesRow';

function SubRow({ row, lotTypesData, refetch, setTypeToEdit, setEditModal }) {
  const [open, setOpen] = React.useState(false);
  const [attrToTie, setAttrToTie] = React.useState('');
  const [selectedSubType, setSelectedSubType] = React.useState();
  const { data: subTypeData, isLoading: isSubTypeLoading } = useSubByType(row?.id);
  const { data: attrOptions } = useAttrOptions();
  const [attrModal, setAttrModal] = React.useState(false);

  const intl = useIntl()

  const { mutate: deleteLotType, isLoading: isDeleting } = useDeleteLotTypeMutation(
    (data) => {
      if (data.status === "OK") {
        toast.success("Lot type deleted successfully!");
        refetch();
      } else {
        toast.info(data.message)
      }
    }
  );
  const handleDelete = () => {
    MySwal.fire({
      title: intl.formatMessage({ id: 'confirm_title' }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: intl.formatMessage({ id: 'confirm_delete' }),
      cancelButtonText: intl.formatMessage({ id: 'cancel' })
    }).then((result) => {
      if (result.isConfirmed) {
        deleteLotType(row.id)
      }
    });
  }

  const handleChange = (event) => {
    setAttrToTie(event.target.value);
  };

  if (isDeleting) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell sx={{ display: 'flex', gap: 2, alignItems: 'center' }} component="th" scope="row">
          <div
            className='hover:bg-slate-200 rounded-full active:scale-95 duration-500 p-1'
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </div>
          <img className='size-12 border rounded' src={row.imageUrl} />
        </TableCell>
        <TableCell >
          {row.id}
        </TableCell>
        <TableCell align="left">{row.name.uz} / {row.name.en} / {row.name.ru}</TableCell>
        <TableCell align="right">
          <IconButton onClick={handleDelete}>
            <Delete color='error' />
          </IconButton>
          <IconButton onClick={() => (setTypeToEdit(row), setEditModal(true))}>
            <Edit color='primary' />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Sub Types
              </Typography>
              {isSubTypeLoading ? (
                <Loader />
              ) : (
                <SubTypesRow
                  setAttrModal={setAttrModal}
                  setSelectedSubType={setSelectedSubType}
                  subTypeData={subTypeData} />
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <AttrModal
        attrModal={attrModal}
        selectedSubType={selectedSubType}
        setAttrModal={setAttrModal}
      />
    </React.Fragment>
  );
}

export default SubRow
