import React, { useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import { CitationFormat } from '../../../services/clinical-support/evidenceService';

// Citation display box
const CitationDisplayBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: '#f8f8f8',
  borderRadius: '4px',
  border: '1px solid #e0e0e0',
  fontFamily: '"Times New Roman", Times, serif',
  fontSize: '0.95rem',
  lineHeight: '1.5',
  fontStyle: 'normal',
  '& span.author': {
    fontWeight: 'bold'
  },
  '& span.title': {
    fontStyle: 'italic'
  }
}));

interface CitationFormatterProps {
  initialCitation: string;
  initialFormat?: CitationFormat;
  allowFormatChange?: boolean;
  allowCopy?: boolean;
}

const CitationFormatter: React.FC<CitationFormatterProps> = ({
  initialCitation,
  initialFormat = CitationFormat.AMA,
  allowFormatChange = true,
  allowCopy = true
}) => {
  const [format, setFormat] = useState<CitationFormat>(initialFormat);
  const [citation, setCitation] = useState<string>(initialCitation);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [customCitation, setCustomCitation] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Handle format change
  const handleFormatChange = (event: SelectChangeEvent<CitationFormat>) => {
    setFormat(event.target.value as CitationFormat);
    // In a real implementation, we would call an API to get the citation in the new format
    // For this example, we'll just use a placeholder
    const newCitation = `[This would be the citation in ${event.target.value} format]`;
    setCitation(newCitation);
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setOpenSnackbar(true);
  };
  
  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      setCitation(customCitation || citation);
    } else {
      setCustomCitation(citation);
    }
    setIsEditing(!isEditing);
  };
  
  // Handle citation text change
  const handleCitationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCitation(event.target.value);
  };
  
  // Format description based on citation style
  const getFormatDescription = (): string => {
    switch (format) {
      case CitationFormat.AMA:
        return 'American Medical Association style';
      case CitationFormat.APA:
        return 'American Psychological Association style';
      case CitationFormat.VANCOUVER:
        return 'Vancouver (ICMJE) style';
      case CitationFormat.HARVARD:
        return 'Harvard referencing style';
      case CitationFormat.PLAIN:
        return 'Plain text format';
      default:
        return 'Standard format';
    }
  };
  
  return (
    <Box>
      {allowFormatChange && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="citation-format-label">Citation Format</InputLabel>
          <Select
            labelId="citation-format-label"
            id="citation-format"
            value={format}
            label="Citation Format"
            onChange={handleFormatChange}
          >
            <MenuItem value={CitationFormat.AMA}>AMA</MenuItem>
            <MenuItem value={CitationFormat.APA}>APA</MenuItem>
            <MenuItem value={CitationFormat.VANCOUVER}>Vancouver</MenuItem>
            <MenuItem value={CitationFormat.HARVARD}>Harvard</MenuItem>
            <MenuItem value={CitationFormat.PLAIN}>Plain Text</MenuItem>
          </Select>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
            {getFormatDescription()}
          </Typography>
        </FormControl>
      )}
      
      {isEditing ? (
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          value={customCitation}
          onChange={handleCitationChange}
          placeholder="Enter custom citation text"
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
        />
      ) : (
        <CitationDisplayBox>
          {citation}
        </CitationDisplayBox>
      )}
      
      <Box display="flex" justifyContent="space-between" mt={1}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleEditToggle}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>
        
        {allowCopy && (
          <Tooltip title="Copy citation">
            <IconButton onClick={handleCopy} size="small" color="primary">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
          Citation copied to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CitationFormatter; 