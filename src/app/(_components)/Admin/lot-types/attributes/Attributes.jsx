import { Button, Divider } from '@mui/material';
import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import AttributesRow from './AttributesRow';
import CreateAttribute from './create';
import EditAttribute from './edit';

export default function Attributes() {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [attrToEdit, setAttrToEdit] = useState(false);

  return (
    <div className='space-y-5'>
      <div className="flex justify-between">
        <div className="text-2xl font-semibold">
          <FormattedMessage id='attrs' />
        </div>
        <Button variant='contained'
          onClick={() => setAddModal(true)}
        >
          <FormattedMessage id='create' />
        </Button>
      </div>
      <Divider />
      <AttributesRow setEditModal={setEditModal} setAttrToEdit={setAttrToEdit} />
      <CreateAttribute open={addModal} setOpen={setAddModal} setAttrToEdit={setAttrToEdit} />
      <EditAttribute open={editModal} setOpen={setEditModal} data={attrToEdit} />
    </div>
  )
}
