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
  Chip
} from '@mui/material';
import { DecisionType } from '../../../models/intent/DecisionPoint';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import MedicationIcon from '@mui/icons-material/Medication';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ScienceIcon from '@mui/icons-material/Science';
import WarningIcon from '@mui/icons-material/Warning';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

// Sample data - in a real app, this would come from an API
const sampleDecisionPointData = [
  { type: DecisionType.TREATMENT_SELECTION, count: 156, description: "Questions about selecting appropriate treatments", icon: <MedicationIcon /> },
  { type: DecisionType.DOSING, count: 89, description: "Questions about drug dosing and regimens", icon: <MedicationIcon /> },
  { type: DecisionType.DIAGNOSTIC, count: 124, description: "Questions about diagnostic approaches and tests", icon: <ScienceIcon /> },
  { type: DecisionType.MONITORING, count: 67, description: "Questions about monitoring treatment responses", icon: <MonitorHeartIcon /> },
  { type: DecisionType.REFERRAL, count: 45, description: "Questions about specialist referrals", icon: <PersonSearchIcon /> },
  { type: DecisionType.RISK_ASSESSMENT, count: 92, description: "Questions about assessing risks and benefits", icon: <WarningIcon /> },
];

// Sample contextual patterns data
const samplePatterns = [
  { pattern: "New diagnosis considerations", percentage: 28, example: "What's the first-line treatment for newly diagnosed type 2 diabetes with normal kidney function?" },
  { pattern: "Treatment failure scenarios", percentage: 22, example: "What options exist when metformin and an SGLT-2 inhibitor aren't providing adequate glycemic control?" },
  { pattern: "Special population considerations", percentage: 18, example: "How should I adjust dosing for elderly patients with reduced kidney function?" },
  { pattern: "Comparative effectiveness questions", percentage: 16, example: "Is drug A superior to drug B for patients with comorbid heart failure?" },
  { pattern: "Safety concerns with specific agents", percentage: 12, example: "What monitoring is required for patients on this medication with a history of liver disease?" },
];

export const DecisionPointMap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(sampleDecisionPointData);
  const [patterns, setPatterns] = useState(samplePatterns);
  const theme = useTheme();
  
  useEffect(() => {
    // Simulate loading data from an API
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const chartData = data.map(item => ({
    name: item.type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value: item.count
  }));

  // Colors for the chart
  const colors = [
    theme.palette.primary.main,
    theme.palette.primary.light,
    theme.palette.secondary.main,
    theme.palette.secondary.light,
    theme.palette.success.main,
    theme.palette.warning.main,
  ];
  
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
        Clinical Decision Point Analysis
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Analysis of common clinical decision points encountered by physicians in their information seeking.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Chart visualization */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Distribution of Decision Points
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} questions`, 'Frequency']}
                    labelFormatter={(label) => `Decision Point: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill={theme.palette.primary.main} 
                    name="Number of Questions"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Decision point details */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Decision Point Details
            </Typography>
            
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {data.map((item, index) => (
                <Box 
                  key={item.type} 
                  sx={{ 
                    mb: 2, 
                    p: 1, 
                    borderLeft: `4px solid ${colors[index % colors.length]}`,
                    backgroundColor: 'background.paper',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 1, color: colors[index % colors.length] }}>
                      {item.icon}
                    </Box>
                    <Typography variant="subtitle1">
                      {item.type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Typography>
                    <Chip 
                      label={`${item.count} questions`}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {item.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        {/* Common patterns section */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Common Contextual Patterns
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Frequently observed patterns in how physicians frame their clinical decision questions.
            </Typography>
            
            <Grid container spacing={2}>
              {patterns.map((pattern, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">
                          {pattern.pattern}
                        </Typography>
                        <Chip 
                          label={`${pattern.percentage}%`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        "{pattern.example}"
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}; 