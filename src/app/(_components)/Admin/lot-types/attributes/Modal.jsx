import React from 'react'
import DialogModal from '@/components/ui/DialogModal'
import { FormControl, IconButton, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { FormattedMessage } from 'react-intl'
import { AddCircleOutlineOutlined as AddCircleOutline, RemoveCircleOutlineOutlined as RemoveCircleOutline } from '@mui/icons-material'
import { useAttrBySubtype, useAttrOptions, useTieAttribute, useUntiedAttr } from '@/queries/attributes'
import Loader from '@/components/Loader'

export default function AttrModal({
    attrModal,
    setAttrModal,
    selectedSubType,
}) {
    const { data: allUntiedAttr } = useUntiedAttr(selectedSubType);
    const { data: attrData, isLoading: isAttrLoading } = useAttrBySubtype(selectedSubType);
    const { mutate: tieAttr } = useTieAttribute(
        (data) => {
            attrData.refetch();
        }
    )
    const [selectedAttr, setSelectedAttr] = React.useState(null);
    const { data: attrOptions, isLoading: attrOptionsLoading } = useAttrOptions(selectedAttr);

    const [attrToTie, setAttrToTie] = React.useState('');
    const handleChange = (event) => {
        setAttrToTie(event.target.value);
    };

    if (isAttrLoading) {
        return <Loader />
    }
    return (
        <div>
            <DialogModal
                open={attrModal}
                setOpen={setAttrModal}
                title="Attributes"
                maxWidth='md'
            >
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                            <TableRow>
                                <TableCell><FormattedMessage id='name' /></TableCell>
                                <TableCell>Value type</TableCell>
                                <TableCell>Select options</TableCell>
                                <TableCell>Tie / untie</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attrData?.map((attr, i) => (
                                <TableRow key={i} sx={{ bgcolor: '#f9fafb' }}>
                                    <TableCell>
                                        {attr?.name?.uz} / {attr?.name?.en} / {attr?.name?.ru}
                                    </TableCell>
                                    <TableCell>
                                        {attr.valueType}
                                    </TableCell>
                                    <TableCell>
                                        {attr.isSelectable ? (
                                            <Select
                                                displayEmpty
                                                onOpen={() => setSelectedAttr(attr.id)}
                                            >
                                                <MenuItem disabled>
                                                    Options
                                                </MenuItem>
                                                {
                                                    attrOptionsLoading ? <MenuItem>Loading...</MenuItem> :
                                                        attrOptions?.map((option, i) => (
                                                            <MenuItem key={i} value={option.id}>
                                                                {option.value.uz} / {option.value.en} / {option.value.ru}
                                                            </MenuItem>
                                                        ))
                                                }
                                            </Select>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell align='center'>
                                        <IconButton
                                            onClick={() => tieAttr({ attributeId: attr.id, subTypeId: selectedSubType })}
                                        >
                                            <RemoveCircleOutline color='error' />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell>
                                    <FormControl sx={{ minWidth: '300px' }} size='small'>
                                        <InputLabel id="demo-simple-select-autowidth-label">Tie attribute</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-autowidth-label"
                                            id="demo-simple-select-autowidth"
                                            value={attrToTie}
                                            label="Tie attribute"
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {allUntiedAttr?.map((attr, i) => (
                                                <MenuItem value={attr?.id} key={i}>
                                                    {attr?.name?.uz} / {attr?.name?.en} / {attr?.name?.ru}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell />
                                <TableCell />
                                <TableCell align='center'>
                                    <IconButton
                                        disabled={!attrToTie}
                                        onClick={() => tieAttr({ attributeId: attrToTie, subTypeId: selectedSubType })}
                                    >
                                        <AddCircleOutline color={attrToTie ? 'primary' : ''} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogModal>
        </div>
    )
}
