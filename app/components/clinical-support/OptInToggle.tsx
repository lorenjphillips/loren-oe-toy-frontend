import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Switch, 
  FormControlLabel, 
  Typography, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button
} from '@mui/material';

const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 1,
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: theme.palette.primary.main,
      border: '6px solid #fff',
    },
  },
  '& .MuiSwitch-thumb': {
    width: 24,
    height: 24,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.grey[400],
    opacity: 1,
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  marginRight: theme.spacing(1),
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

interface OptInToggleProps {
  isEnabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

const OptInToggle: React.FC<OptInToggleProps> = ({
  isEnabled,
  onChange,
  label = 'Clinical Support'
}) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);
  
  // Handle toggle click - show confirmation dialog when enabling
  const handleToggleClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState = event.target.checked;
    
    if (newState && !isEnabled) {
      // If enabling, show confirmation dialog
      setPendingState(true);
      setOpenDialog(true);
    } else {
      // If disabling, apply directly
      onChange(newState);
    }
  };
  
  // Confirm enabling clinical support
  const handleConfirm = () => {
    setOpenDialog(false);
    if (pendingState !== null) {
      onChange(pendingState);
      setPendingState(null);
    }
  };
  
  // Cancel enabling clinical support
  const handleCancel = () => {
    setOpenDialog(false);
    setPendingState(null);
  };
  
  return (
    <>
      <Box display="flex" alignItems="center">
        <Tooltip title={isEnabled ? 'Clinical decision support is enabled' : 'Enable clinical decision support'}>
          <FormControlLabel
            control={
              <StyledSwitch 
                checked={isEnabled} 
                onChange={handleToggleClick}
                inputProps={{ 'aria-label': 'toggle clinical support' }}
              />
            }
            label={<Label>{label}</Label>}
          />
        </Tooltip>
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCancel}
        aria-labelledby="clinical-support-dialog-title"
      >
        <DialogTitle id="clinical-support-dialog-title">
          Enable Clinical Decision Support
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Clinical decision support provides evidence-based information to assist in clinical decision-making. 
            This feature is intended for healthcare professionals and should be used as a supplement to, 
            not a replacement for, clinical judgment.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            The information provided:
          </DialogContentText>
          <ul style={{ marginTop: 0 }}>
            <li>Is based on published clinical evidence and guidelines</li>
            <li>Is clearly labeled and separate from promotional content</li>
            <li>Should be verified against current clinical standards</li>
            <li>May be logged for quality improvement purposes</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">
            Enable
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OptInToggle; 