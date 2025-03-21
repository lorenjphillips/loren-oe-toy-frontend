import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent,
  Divider, 
  useTheme,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button
} from '@mui/material';
import { WorkflowStage } from '../../../models/intent/ClinicalWorkflow';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sankey,
  Tooltip as RechartsTooltip
} from 'recharts';
import PreventionIcon from '@mui/icons-material/HealthAndSafety';
import DiagnosisIcon from '@mui/icons-material/Biotech';
import TreatmentIcon from '@mui/icons-material/Medication';
import MonitoringIcon from '@mui/icons-material/MonitorHeart';
import FollowupIcon from '@mui/icons-material/EventAvailable';
import EducationIcon from '@mui/icons-material/School';
import PatientIcon from '@mui/icons-material/Person';
import RelapsedIcon from '@mui/icons-material/Replay';
import PalliativeIcon from '@mui/icons-material/SelfImprovement';
import WorkflowIcon from '@mui/icons-material/AccountTree';

// Sample data - in a real app, this would come from an API
const sampleWorkflowData = [
  { 
    stage: WorkflowStage.PREVENTION, 
    count: 89, 
    percentage: 12, 
    description: "Questions about preventive care and screening",
    icon: <PreventionIcon />,
    example: "What is the recommended screening approach for patients with family history of this condition?"
  },
  { 
    stage: WorkflowStage.DIAGNOSIS, 
    count: 157, 
    percentage: 22, 
    description: "Questions about diagnostic work-up",
    icon: <DiagnosisIcon />,
    example: "What tests should be ordered to confirm this suspected diagnosis?"
  },
  { 
    stage: WorkflowStage.TREATMENT, 
    count: 243, 
    percentage: 34, 
    description: "Questions about treatment planning and initiation",
    icon: <TreatmentIcon />,
    example: "What is the recommended first-line treatment for this newly diagnosed condition?"
  },
  { 
    stage: WorkflowStage.MONITORING, 
    count: 103, 
    percentage: 14, 
    description: "Questions about monitoring treatment response",
    icon: <MonitoringIcon />,
    example: "How frequently should I monitor liver function after starting this medication?"
  },
  { 
    stage: WorkflowStage.RELAPSE, 
    count: 67, 
    percentage: 9, 
    description: "Questions about managing relapse or recurrence",
    icon: <RelapsedIcon />,
    example: "What are the options for a patient who has relapsed after initial treatment?"
  },
  { 
    stage: WorkflowStage.PALLIATIVE, 
    count: 43, 
    percentage: 6, 
    description: "Questions about palliative care",
    icon: <PalliativeIcon />,
    example: "What symptomatic management is recommended for end-stage disease?"
  },
  { 
    stage: WorkflowStage.EDUCATION, 
    count: 22, 
    percentage: 3, 
    description: "Questions about patient education",
    icon: <EducationIcon />,
    example: "What resources should I provide to newly diagnosed patients?"
  },
];

// Sample pathway data showing connections between workflow stages
const samplePathwayData = [
  { from: "Prevention", to: "Diagnosis", value: 37 },
  { from: "Diagnosis", to: "Treatment", value: 145 },
  { from: "Treatment", to: "Monitoring", value: 78 },
  { from: "Monitoring", to: "Treatment", value: 42 }, // treatment modification
  { from: "Monitoring", to: "Relapse", value: 34 },
  { from: "Relapse", to: "Treatment", value: 53 },
  { from: "Treatment", to: "Palliative", value: 27 },
  { from: "Diagnosis", to: "Education", value: 18 },
  { from: "Treatment", to: "Education", value: 12 },
];

// Sample patient contexts found in workflow stages
const samplePatientContexts = [
  { context: "Elderly patients", stages: [WorkflowStage.TREATMENT, WorkflowStage.MONITORING], count: 87 },
  { context: "Pediatric patients", stages: [WorkflowStage.PREVENTION, WorkflowStage.DIAGNOSIS], count: 54 },
  { context: "Pregnant women", stages: [WorkflowStage.TREATMENT, WorkflowStage.MONITORING], count: 42 },
  { context: "Patients with comorbidities", stages: [WorkflowStage.TREATMENT, WorkflowStage.MONITORING, WorkflowStage.PALLIATIVE], count: 98 },
  { context: "Immunocompromised patients", stages: [WorkflowStage.PREVENTION, WorkflowStage.TREATMENT], count: 63 },
];

// Color configuration for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed', '#8dd1e1'];

export const WorkflowMapping: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [workflowData, setWorkflowData] = useState(sampleWorkflowData);
  const [pathwayData, setPathwayData] = useState(samplePathwayData);
  const [patientContexts, setPatientContexts] = useState(samplePatientContexts);
  const [selectedStage, setSelectedStage] = useState<WorkflowStage | null>(null);
  const theme = useTheme();
  
  useEffect(() => {
    // Simulate loading data from an API
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleStageClick = (stage: WorkflowStage) => {
    setSelectedStage(stage === selectedStage ? null : stage);
  };
  
  const getWorkflowStageLabel = (stage: WorkflowStage): string => {
    return stage
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const chartData = workflowData.map(item => ({
    name: getWorkflowStageLabel(item.stage),
    value: item.count
  }));
  
  const getStageIcon = (stage: WorkflowStage) => {
    const stageData = workflowData.find(data => data.stage === stage);
    return stageData ? stageData.icon : <WorkflowIcon />;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Clinical Workflow Mapping
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Analysis of how physician questions map to different stages in clinical workflows.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Chart visualization */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution of Questions Across Workflow Stages
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) => {
                      const stageObj = workflowData.find(
                        item => getWorkflowStageLabel(item.stage) === data.name
                      );
                      if (stageObj) handleStageClick(stageObj.stage);
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke={selectedStage && getWorkflowStageLabel(selectedStage) === entry.name ? '#000' : 'none'}
                        strokeWidth={selectedStage && getWorkflowStageLabel(selectedStage) === entry.name ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} questions`, 'Frequency']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Clinical Workflow Stepper */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Clinical Workflow Journey
            </Typography>
            
            <Stepper orientation="vertical" sx={{ mt: 2 }}>
              {workflowData
                .sort((a, b) => {
                  const order = [
                    WorkflowStage.PREVENTION,
                    WorkflowStage.DIAGNOSIS,
                    WorkflowStage.TREATMENT,
                    WorkflowStage.MONITORING,
                    WorkflowStage.RELAPSE,
                    WorkflowStage.PALLIATIVE,
                    WorkflowStage.EDUCATION
                  ];
                  return order.indexOf(a.stage) - order.indexOf(b.stage);
                })
                .map((stage, index) => (
                  <Step 
                    key={stage.stage} 
                    active={selectedStage === stage.stage || !selectedStage}
                    expanded={selectedStage === stage.stage}
                    onClick={() => handleStageClick(stage.stage)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <StepLabel 
                      StepIconComponent={() => (
                        <Box sx={{ 
                          color: COLORS[index % COLORS.length], 
                          backgroundColor: selectedStage === stage.stage ? `${COLORS[index % COLORS.length]}22` : 'transparent',
                          borderRadius: '50%',
                          padding: '4px'
                        }}>
                          {stage.icon}
                        </Box>
                      )}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {getWorkflowStageLabel(stage.stage)}
                        </Typography>
                        <Chip 
                          label={`${stage.percentage}%`}
                          size="small"
                          sx={{ ml: 1, bgcolor: COLORS[index % COLORS.length], color: 'white' }}
                        />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="textSecondary">
                        {stage.description}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Example: "{stage.example}"
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          sx={{ color: COLORS[index % COLORS.length], borderColor: COLORS[index % COLORS.length] }}
                        >
                          View {stage.count} Questions
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
            </Stepper>
          </Paper>
        </Grid>
        
        {/* Patient contexts section */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Patient Context Analysis
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Common patient contexts mentioned in clinical workflow questions.
            </Typography>
            
            <Grid container spacing={2}>
              {patientContexts.map((context, index) => (
                <Grid item xs={12} sm={6} md={4} key={context.context}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PatientIcon sx={{ mr: 1, color: COLORS[index % COLORS.length] }} />
                        <Typography variant="subtitle1">
                          {context.context}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Appears in {context.count} questions
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Most common workflow stages:
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {context.stages.map(stage => (
                          <Chip 
                            key={stage}
                            label={getWorkflowStageLabel(stage)}
                            size="small"
                            icon={getStageIcon(stage)}
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Question connectivity insight */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Insight: Decision Point Transitions
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                  <Typography variant="body1" gutterBottom>
                    Key Observation: Clinical Workflow Transitions
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    Questions that bridge different workflow stages reveal key decision points where physicians face the most uncertainty. The most common transitions are:
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <DiagnosisIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Diagnosis → Treatment" 
                        secondary="145 questions address the transition from diagnostic findings to treatment selection"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <TreatmentIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Treatment → Monitoring" 
                        secondary="78 questions address how to monitor response after treatment initiation"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <RelapsedIcon style={{ color: COLORS[4] }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Relapse → Treatment" 
                        secondary="53 questions address how to adjust treatment after disease progression or relapse"
                      />
                    </ListItem>
                  </List>
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    These transition points represent opportunities for improved clinical decision support content.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                  <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Recommended Action
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                      Create specialized content modules that address the top transition points in clinical workflows, particularly:
                    </Typography>
                    
                    <Box component="ul" sx={{ pl: 2 }}>
                      <Typography component="li" variant="body2">
                        How to translate diagnostic findings into treatment decisions
                      </Typography>
                      <Typography component="li" variant="body2">
                        Monitoring protocols for common treatment regimens
                      </Typography>
                      <Typography component="li" variant="body2">
                        Decision algorithms for treatment after disease progression
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}; 