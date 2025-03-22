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
  Button
} from '@mui/material';
import { GapType } from '../../../models/intent/InformationGap';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Sector
} from 'recharts';
import HelpIcon from '@mui/icons-material/Help';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CompareIcon from '@mui/icons-material/Compare';
import ErrorIcon from '@mui/icons-material/Error';
import ScienceIcon from '@mui/icons-material/Science';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Sample data - in a real app, this would come from an API
const sampleGapData = [
  { type: GapType.CONCEPTUAL, count: 124, percentage: 32, description: "Gaps in understanding complex medical concepts", icon: <HelpIcon /> },
  { type: GapType.TEMPORAL, count: 87, percentage: 22, description: "Questions about recent updates or changes to guidelines", icon: <NewReleasesIcon /> },
  { type: GapType.CONFLICTING, count: 68, percentage: 17, description: "Confusion about conflicting information or guidelines", icon: <CompareIcon /> },
  { type: GapType.RARE_CASE, count: 42, percentage: 11, description: "Questions about managing rare or unusual cases", icon: <ErrorIcon /> },
  { type: GapType.EVIDENCE_BASED, count: 73, percentage: 18, description: "Seeking specific evidence for clinical decisions", icon: <ScienceIcon /> },
];

// Sample topic area data
const sampleTopicAreas = [
  { area: "Cardiology", gapCount: 86, topGap: GapType.CONFLICTING, example: "Latest guidelines for anticoagulation in AFib with CKD seem to conflict with previous recommendations." },
  { area: "Oncology", gapCount: 78, topGap: GapType.EVIDENCE_BASED, example: "What&apos;s the evidence for this new targeted therapy in relapsed breast cancer?" },
  { area: "Endocrinology", gapCount: 65, topGap: GapType.TEMPORAL, example: "Has there been any update to the diabetes management algorithm this year?" },
  { area: "Infectious Disease", gapCount: 59, topGap: GapType.CONCEPTUAL, example: "How exactly does this new antiviral work on a molecular level?" },
  { area: "Neurology", gapCount: 52, topGap: GapType.RARE_CASE, example: "What&apos;s the approach for this unusual presentation of a movement disorder?" },
];

// Sample critical gaps that need addressing
const sampleCriticalGaps = [
  { 
    id: 1, 
    title: "Conflicting anticoagulation guidelines", 
    description: "Physicians report confusion about conflicting recommendations for anticoagulation in patients with both AFib and advanced kidney disease.",
    specialty: "Cardiology",
    urgency: "High"
  },
  { 
    id: 2, 
    title: "Evidence for new cancer immunotherapies", 
    description: "Oncologists seeking clearer evidence on when to use new immunotherapy agents versus traditional chemotherapy in various cancer types.",
    specialty: "Oncology",
    urgency: "High"
  },
  { 
    id: 3, 
    title: "Practical application of CGM data", 
    description: "Endocrinologists seek clearer guidance on how to interpret and act on continuous glucose monitoring data patterns.",
    specialty: "Endocrinology",
    urgency: "Medium"
  },
];

export const InformationGapAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [gapData, setGapData] = useState(sampleGapData);
  const [topicAreas, setTopicAreas] = useState(sampleTopicAreas);
  const [criticalGaps, setCriticalGaps] = useState(sampleCriticalGaps);
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();
  
  useEffect(() => {
    // Simulate loading data from an API
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const chartData = gapData.map(item => ({
    name: item.type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value: item.count
  }));
  
  // Colors for the chart
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
  ];
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} questions`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };
  
  const getGapTypeLabel = (type: GapType): string => {
    return type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
        Information Gap Analysis
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Analysis of knowledge gaps and areas of uncertainty identified in physician questions.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Chart visualization */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Types of Information Gaps
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
        
        {/* Gap details */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Gap Details
            </Typography>
            
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List>
                {gapData.map((item, index) => (
                  <ListItem 
                    key={item.type}
                    sx={{ 
                      mb: 1, 
                      bgcolor: index === activeIndex ? `${colors[index % colors.length]}15` : 'transparent',
                      borderRadius: 1,
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <ListItemIcon sx={{ color: colors[index % colors.length] }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {getGapTypeLabel(item.type)}
                          </Typography>
                          <Chip 
                            label={`${item.percentage}%`}
                            size="small"
                            sx={{ ml: 1 }}
                            style={{ backgroundColor: colors[index % colors.length], color: '#fff' }}
                          />
                        </Box>
                      }
                      secondary={item.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
        
        {/* Critical gaps section */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Critical Information Gaps
              </Typography>
            </Box>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              High-priority information gaps that should be addressed in clinical content.
            </Typography>
            
            <Grid container spacing={2}>
              {criticalGaps.map((gap) => (
                <Grid item xs={12} md={4} key={gap.id}>
                  <Card sx={{ bgcolor: '#fff9f9', borderLeft: '4px solid', borderColor: 'error.main' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {gap.title}
                        </Typography>
                        <Chip 
                          label={gap.urgency}
                          size="small"
                          color={gap.urgency === 'High' ? 'error' : 'warning'}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {gap.description}
                      </Typography>
                      <Chip 
                        label={gap.specialty}
                        size="small"
                        variant="outlined"
                      />
                      <Button 
                        size="small" 
                        variant="text" 
                        color="primary"
                        endIcon={<LightbulbIcon />}
                        sx={{ mt: 1, display: 'block' }}
                      >
                        View Content Recommendations
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Gap by specialty */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Information Gaps by Medical Specialty
            </Typography>
            
            <Grid container spacing={2}>
              {topicAreas.map((area, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={area.area}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {area.area}
                      </Typography>
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" component="span">
                          Top gap type:
                        </Typography>
                        <Chip 
                          label={getGapTypeLabel(area.topGap)}
                          size="small"
                          sx={{ ml: 1 }}
                          style={{ backgroundColor: colors[index % colors.length], color: '#fff' }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem', mb: 1 }}>
                        "{area.example}"
                      </Typography>
                      
                      <Typography variant="body2">
                        {area.gapCount} questions identified
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