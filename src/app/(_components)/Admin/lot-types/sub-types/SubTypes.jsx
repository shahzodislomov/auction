import React, { useState } from 'react'
import { useSub } from '@/queries/subtypes';
import Loader from '@/components/Loader';
import SubTypesRow from './SubTypesRow';
import AttrModal from '../attributes/Modal';
import { Button, Divider } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import CreateSubType from './create';
import EditSubType from './edit';

export default function SubTypes() {
  const [selectedSubType, setSelectedSubType] = useState();
  const [attrModal, setAttrModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState(false);
  const { data: subTypeData, isLoading: isSubTypeLoading } = useSub();

  if (isSubTypeLoading) {
    return <Loader />;
  }
  return (
    <div className='space-y-5'>
      <div className="flex justify-between">
        <div className="text-2xl font-semibold">
          <FormattedMessage id='subTypes' />
        </div>
        <Button variant='contained'
          onClick={() => setAddModal(true)}
        >
          <FormattedMessage id='create' />
        </Button>
      </div>
      <Divider />
      <SubTypesRow
        setAttrModal={setAttrModal}
        setSelectedSubType={setSelectedSubType}
        subTypeData={subTypeData}
        setEditModal={setEditModal}
        setTypeToEdit={setTypeToEdit}
      />

      <AttrModal
        attrModal={attrModal}
        selectedSubType={selectedSubType}
        setAttrModal={setAttrModal}
      />

      <CreateSubType
        open={addModal}
        setOpen={setAddModal}
      />

      <EditSubType
        data={typeToEdit}
        open={editModal}
        setOpen={setEditModal}
      />
    </div>
  )
}
