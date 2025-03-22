import React, { useState, useEffect } from 'react';
import { EnhancedDecisionSupportResponse } from '../../models/clinical-support';
import { ClinicalEvidence, ClinicalGuideline } from '../../models/phase4';
import EvidenceSummary from './EvidenceSummary';
import RecommendationPanel from './RecommendationPanel';
import OptInToggle from './OptInToggle';
import { getDecisionSupport } from '../../services/clinical-support/decisionSupportMock';
import { styled } from '@mui/material/styles';
import { 
  Paper, 
  Typography, 
  Divider, 
  CircularProgress, 
  Box, 
  Collapse,
  Alert
} from '@mui/material';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem'
});

const ClinicalLabel = styled(Typography)(({ theme }) => ({
  backgroundColor: '#4a90e2',
  color: 'white',
  padding: theme.spacing(0.5, 1),
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  marginRight: theme.spacing(1)
}));

const Disclaimer = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2),
  fontSize: '0.8rem'
}));

interface DecisionSupportContainerProps {
  question: string;
  medicalCategory?: string;
  isVisible?: boolean;
  onToggleChange?: (isEnabled: boolean) => void;
}

const DecisionSupportContainer: React.FC<DecisionSupportContainerProps> = ({
  question,
  medicalCategory,
  isVisible = false,
  onToggleChange
}) => {
  const [supportData, setSupportData] = useState<EnhancedDecisionSupportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  
  // Load decision support data when enabled and visible
  useEffect(() => {
    const fetchData = async () => {
      if (isEnabled && isVisible && question) {
        setLoading(true);
        setError(null);
        
        try {
          const data = await getDecisionSupport(question, medicalCategory);
          setSupportData(data);
        } catch (err) {
          setError('Unable to load clinical decision support data');
          console.error('Error loading decision support data:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [question, medicalCategory, isEnabled, isVisible]);
  
  // Handle opt-in/opt-out
  const handleToggleChange = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (onToggleChange) {
      onToggleChange(enabled);
    }
  };
  
  return (
    <Container>
      <Header>
        <Box display="flex" alignItems="center">
          <ClinicalLabel>CLINICAL</ClinicalLabel>
          <Typography variant="h6" color="primary">
            Clinical Decision Support
          </Typography>
        </Box>
        <OptInToggle 
          isEnabled={isEnabled} 
          onChange={handleToggleChange} 
        />
      </Header>
      
      <Divider />
      
      <Collapse in={isEnabled}>
        {loading ? (
          <LoadingContainer>
            <CircularProgress size={40} />
          </LoadingContainer>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : supportData ? (
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Based on your query about <strong>{question.substring(0, 60)}...</strong>
            </Typography>
            
            {supportData.relevantEvidence.length > 0 && (
              <EvidenceSummary 
                evidence={supportData.relevantEvidence} 
                guidelines={supportData.applicableGuidelines}
                confidence={supportData.confidenceScore}
              />
            )}
            
            {supportData.nextSteps && supportData.nextSteps.length > 0 && (
              <RecommendationPanel 
                recommendations={supportData.nextSteps}
                contextualFactors={supportData.contextualFactors}
                explanation={supportData.explanations.join(' ')}
              />
            )}
            
            <Disclaimer severity="info">
              This information is intended to support, not replace, clinical judgment. 
              Always consult current clinical guidelines and exercise professional judgment in patient care.
            </Disclaimer>
          </Box>
        ) : (
          <Box mt={3}>
            <Typography variant="body2" color="textSecondary">
              Clinical decision support will appear here when available for your query.
            </Typography>
          </Box>
        )}
      </Collapse>
    </Container>
  );
};

export default DecisionSupportContainer; 