import * as React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

const DialogModal = ({ open, setOpen, title, children, onConfirm, onCancel, maxWidth, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  const handleClose = () => {
    if (onCancel) onCancel();
    setOpen(false);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={maxWidth || 'sm'}>
      <div className="bg-gray-100 flex justify-between items-center">
        {title && <DialogTitle>{title}</DialogTitle>}
        <IconButton onClick={handleClose} sx={{ mr: 2 }}>
          <Close />
        </IconButton>
      </div>
      <DialogContent>{children}</DialogContent>
      {/* <DialogActions>
        <Button onClick={handleClose} color="primary">
          {cancelText}
        </Button>
        <Button onClick={handleConfirm} color="primary" variant="contained">
          {confirmText}
        </Button>
      </DialogActions> */}
    </Dialog>
  );
};

DialogModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

export default DialogModal;