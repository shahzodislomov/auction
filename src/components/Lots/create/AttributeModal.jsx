import React from 'react'
import DialogModal from '@/components/ui/DialogModal'
import { useIntl } from 'react-intl'

export default function AttributeModal({
    open,
    setOpen
}) {
    const intl = useIntl();
    return (
        <DialogModal
            open={open}
            setOpen={setOpen}
            title={intl.formatMessage({ id: 'dashboard.createLot' })}
        >
            
        </DialogModal>
    )
}
