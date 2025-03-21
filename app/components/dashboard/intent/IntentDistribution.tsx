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
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { IntentType } from '../../../models/intent/ClinicalIntent';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ScienceIcon from '@mui/icons-material/Science';
import MedicationIcon from '@mui/icons-material/Medication';
import HelpIcon from '@mui/icons-material/Help';
import CompareIcon from '@mui/icons-material/Compare';
import PaidIcon from '@mui/icons-material/Paid';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Sample data - in a real app, this would come from an API
const sampleIntentData = [
  { 
    type: IntentType.EFFICACY_INFO, 
    count: 187, 
    percentage: 26, 
    description: "Questions about drug/treatment efficacy", 
    icon: <HealthAndSafetyIcon />,
    example: "What is the response rate for this therapy in relapsed cases?"
  },
  { 
    type: IntentType.SAFETY_INFO, 
    count: 143, 
    percentage: 20, 
    description: "Questions about safety and adverse effects", 
    icon: <WarningIcon />,
    example: "What are the most common adverse events with this medication?"
  },
  { 
    type: IntentType.MECHANISM_INFO, 
    count: 98, 
    percentage: 14, 
    description: "Questions about how drugs/treatments work", 
    icon: <ScienceIcon />,
    example: "What is the mechanism of action of this new antibody therapy?"
  },
  { 
    type: IntentType.ALTERNATIVES_INFO, 
    count: 87, 
    percentage: 12, 
    description: "Questions about treatment alternatives", 
    icon: <CompareIcon />,
    example: "What are the alternatives to this treatment for patients with renal impairment?"
  },
  { 
    type: IntentType.COST_INFO, 
    count: 65, 
    percentage: 9, 
    description: "Questions about cost or insurance coverage", 
    icon: <PaidIcon />,
    example: "Is this medication typically covered by insurance for off-label use?"
  },
  { 
    type: IntentType.GUIDELINE_INFO, 
    count: 78, 
    percentage: 11, 
    description: "Questions about clinical guidelines", 
    icon: <MenuBookIcon />,
    example: "What do the latest guidelines recommend for initial therapy?"
  },
  { 
    type: IntentType.EDUCATION, 
    count: 32, 
    percentage: 4, 
    description: "Questions about patient education materials", 
    icon: <SchoolIcon />,
    example: "Are there patient education materials explaining this condition?"
  },
  { 
    type: IntentType.PATIENT_SPECIFIC, 
    count: 26, 
    percentage: 4, 
    description: "Questions about applying info to specific patients", 
    icon: <PersonIcon />,
    example: "How should I modify this regimen for my elderly patient with comorbidities?"
  },
];

// Sample trend data over time
const sampleTrendData = [
  { month: 'Jan', efficacy: 122, safety: 98, mechanism: 68, alternatives: 54, guidelines: 42 },
  { month: 'Feb', efficacy: 135, safety: 103, mechanism: 72, alternatives: 62, guidelines: 48 },
  { month: 'Mar', efficacy: 128, safety: 110, mechanism: 75, alternatives: 65, guidelines: 52 },
  { month: 'Apr', efficacy: 144, safety: 115, mechanism: 82, alternatives: 70, guidelines: 58 },
  { month: 'May', efficacy: 155, safety: 122, mechanism: 88, alternatives: 72, guidelines: 62 },
  { month: 'Jun', efficacy: 168, safety: 130, mechanism: 92, alternatives: 78, guidelines: 68 },
  { month: 'Jul', efficacy: 175, safety: 135, mechanism: 95, alternatives: 82, guidelines: 74 },
  { month: 'Aug', efficacy: 187, safety: 143, mechanism: 98, alternatives: 87, guidelines: 78 },
];

// Sample specialty distribution data
const specialtyDistribution = [
  { specialty: 'Oncology', count: 165, percentage: 23 },
  { specialty: 'Cardiology', count: 142, percentage: 20 },
  { specialty: 'Neurology', count: 112, percentage: 16 },
  { specialty: 'Endocrinology', count: 98, percentage: 14 },
  { specialty: 'Infectious Disease', count: 85, percentage: 12 },
  { specialty: 'Other', count: 112, percentage: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];

export const IntentDistribution: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [intentData, setIntentData] = useState(sampleIntentData);
  const [trendData, setTrendData] = useState(sampleTrendData);
  const [specialtyData, setSpecialtyData] = useState(specialtyDistribution);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'trend'>('bar');
  const theme = useTheme();
  
  useEffect(() => {
    // Simulate loading data from an API
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newChartType: 'bar' | 'pie' | 'trend',
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };
  
  const getIntentTypeLabel = (type: IntentType): string => {
    return type.split('_')[0].charAt(0).toUpperCase() + 
           type.split('_')[0].slice(1) + 
           (type.split('_')[1] ? ' ' + type.split('_')[1] : '');
  };
  
  const barChartData = intentData.map(item => ({
    name: getIntentTypeLabel(item.type),
    value: item.count
  }));
  
  const pieChartData = intentData.map(item => ({
    name: getIntentTypeLabel(item.type),
    value: item.count
  }));
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const renderChart = () => {
    switch(chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={barChartData}
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
                labelFormatter={(label) => `Intent Type: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Number of Questions"
              >
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} questions (${((value as number) / intentData.reduce((sum, item) => sum + item.count, 0) * 100).toFixed(1)}%)`, 'Frequency']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="efficacy" name="Efficacy Questions" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="safety" name="Safety Questions" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mechanism" name="Mechanism Questions" stroke="#ffc658" />
              <Line type="monotone" dataKey="alternatives" name="Alternatives Questions" stroke="#ff7300" />
              <Line type="monotone" dataKey="guidelines" name="Guideline Questions" stroke="#A569BD" />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Clinical Intent Distribution
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Analysis of physician information-seeking intent based on question patterns and context.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Chart controls and visualization */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Distribution of Clinical Intents
              </Typography>
              
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={handleChartTypeChange}
                size="small"
                aria-label="chart type"
              >
                <ToggleButton value="bar" aria-label="bar chart">
                  <BarChartIcon />
                </ToggleButton>
                <ToggleButton value="pie" aria-label="pie chart">
                  <PieChartIcon />
                </ToggleButton>
                <ToggleButton value="trend" aria-label="trend chart">
                  <TimelineIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            <Box>
              {renderChart()}
            </Box>
          </Paper>
        </Grid>
        
        {/* Intent details */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Intent Details
            </Typography>
            
            <Grid container spacing={2}>
              {intentData.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.type}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ mr: 1, color: COLORS[index % COLORS.length] }}>
                          {item.icon}
                        </Box>
                        <Typography variant="subtitle1">
                          {getIntentTypeLabel(item.type)}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip
                          label={`${item.count} questions`}
                          size="small"
                          sx={{ bgcolor: COLORS[index % COLORS.length], color: 'white' }}
                        />
                        <Chip
                          label={`${item.percentage}%`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {item.description}
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                        Example: "{item.example}"
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Specialty distribution */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Intent Distribution by Specialty
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={specialtyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {specialtyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} questions`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Key insights */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Key Intent Insights
            </Typography>
            
            <List component="ul">
              <ListItem>
                <ListItemIcon>
                  <InsightsIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Efficacy Information Dominates" 
                  secondary="Questions about efficacy are the most common, representing 26% of all clinical queries."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <TrendingUpIcon color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Safety Concerns Growing" 
                  secondary="Safety-related questions have increased 15% over the past quarter, particularly for newer therapies."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <LocalHospitalIcon style={{ color: COLORS[2] }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Specialty Differences" 
                  secondary="Oncologists ask more mechanism-of-action questions, while cardiologists focus more on guideline adherence."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon style={{ color: COLORS[3] }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Temporal Patterns" 
                  secondary="Questions about treatment alternatives peak during the first quarter when new treatment options are typically introduced."
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}; 