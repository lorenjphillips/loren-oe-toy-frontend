import React from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f1f8e9',
  borderRadius: '8px',
  border: '1px solid #c5e1a5'
}));

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const FactorItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
  borderBottom: '1px dashed #e0e0e0',
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const ExplanationBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '4px',
  fontSize: '0.9rem',
  color: theme.palette.text.secondary
}));

interface RecommendationPanelProps {
  recommendations: string[];
  contextualFactors?: Array<{factor: string, impact: string}>;
  explanation?: string;
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations,
  contextualFactors = [],
  explanation
}) => {
  const [showFactors, setShowFactors] = React.useState(false);
  
  const toggleFactors = () => {
    setShowFactors(!showFactors);
  };
  
  return (
    <StyledPaper elevation={0}>
      <Typography variant="h6" gutterBottom color="primary">
        Clinical Considerations
      </Typography>
      
      {/* Recommendations List */}
      <List dense disablePadding>
        {recommendations.map((recommendation, index) => (
          <ListItemStyled key={index} alignItems="flex-start">
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight="medium">
                  {recommendation}
                </Typography>
              }
            />
          </ListItemStyled>
        ))}
      </List>
      
      {/* Contextual Factors */}
      {contextualFactors.length > 0 && (
        <Box mt={2}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            onClick={toggleFactors}
            sx={{ cursor: 'pointer' }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Contextual Factors
            </Typography>
            <Tooltip title="These factors may influence clinical decisions">
              <IconButton size="small">
                <InfoIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Collapse in={showFactors}>
            <Box mt={1} p={1} bgcolor="rgba(255, 255, 255, 0.5)" borderRadius={1}>
              {contextualFactors.map((item, index) => (
                <FactorItem key={index}>
                  <Typography variant="body2" fontWeight="medium">
                    {item.factor}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" fontSize="0.85rem">
                    {item.impact}
                  </Typography>
                </FactorItem>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
      
      {/* Explanation for recommendations */}
      {explanation && (
        <ExplanationBox>
          <Typography variant="body2" color="textSecondary">
            {explanation}
          </Typography>
        </ExplanationBox>
      )}
    </StyledPaper>
  );
};

export default RecommendationPanel; 