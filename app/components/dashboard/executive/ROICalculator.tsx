/**
 * ROICalculator Component
 * 
 * Provides return on investment estimations for strategic initiatives.
 * Allows executives to model and compare potential investments.
 */
import React, { useContext, useEffect, useState } from 'react';
import { 
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Calculate as CalculateIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DashboardContext, DashboardContextType } from '../DashboardLayout';
import executiveInsightsService from '../../../services/insights/executiveInsights';

export interface ROICalculatorProps {
  companyId?: string;
}

// Initiative type for ROI calculation
interface Initiative {
  id: string;
  name: string;
  cost: number;
  timeframe: number; // in weeks
  estimatedReturn?: number;
  roi?: number;
  paybackPeriod?: number;
  confidenceLevel?: 'high' | 'medium' | 'low';
}

// Presets for quick initiative setup
const INITIATIVE_PRESETS = [
  {
    name: 'Content Expansion - Oncology',
    cost: 250000,
    timeframe: 20
  },
  {
    name: 'Interactive Decision Support Tool',
    cost: 180000,
    timeframe: 16
  },
  {
    name: 'Physician Education Portal',
    cost: 350000,
    timeframe: 24
  },
  {
    name: 'Clinical Data Visualization Platform',
    cost: 220000,
    timeframe: 18
  },
  {
    name: 'Treatment Comparison Tool',
    cost: 150000,
    timeframe: 12
  }
];

export default function ROICalculator({ companyId }: ROICalculatorProps) {
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [calculatedResults, setCalculatedResults] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(false);
  
  // For the new initiative form
  const [newInitiativeName, setNewInitiativeName] = useState('');
  const [newInitiativeCost, setNewInitiativeCost] = useState(100000);
  const [newInitiativeTimeframe, setNewInitiativeTimeframe] = useState(12);
  const [selectedPreset, setSelectedPreset] = useState('');
  
  // Initialize with a default initiative
  useEffect(() => {
    if (initiatives.length === 0) {
      setInitiatives([
        {
          id: 'default-1',
          name: 'New Strategic Initiative',
          cost: 200000,
          timeframe: 16
        }
      ]);
    }
  }, []);
  
  const handleAddInitiative = () => {
    if (!newInitiativeName) return;
    
    const newInitiative: Initiative = {
      id: `initiative-${Date.now()}`,
      name: newInitiativeName,
      cost: newInitiativeCost,
      timeframe: newInitiativeTimeframe
    };
    
    setInitiatives([...initiatives, newInitiative]);
    
    // Reset form
    setNewInitiativeName('');
    setNewInitiativeCost(100000);
    setNewInitiativeTimeframe(12);
    setSelectedPreset('');
  };
  
  const handleDeleteInitiative = (id: string) => {
    setInitiatives(initiatives.filter(initiative => initiative.id !== id));
    setCalculatedResults(calculatedResults.filter(result => result.id !== id));
  };
  
  const handlePresetChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const presetIndex = Number(event.target.value);
    if (presetIndex >= 0) {
      const preset = INITIATIVE_PRESETS[presetIndex];
      setNewInitiativeName(preset.name);
      setNewInitiativeCost(preset.cost);
      setNewInitiativeTimeframe(preset.timeframe);
      setSelectedPreset(presetIndex.toString());
    }
  };
  
  const handleInitiativeUpdate = (id: string, field: string, value: any) => {
    setInitiatives(initiatives.map(initiative => 
      initiative.id === id ? { ...initiative, [field]: value } : initiative
    ));
  };
  
  const calculateROI = async () => {
    if (initiatives.length === 0) return;
    
    setLoading(true);
    try {
      const results = await executiveInsightsService.estimateInitiativeROI(initiatives);
      
      // Merge results with initiatives data
      const calculatedInitiatives = initiatives.map(initiative => {
        const result = results.find(r => r.name === initiative.name);
        if (result) {
          return {
            ...initiative,
            estimatedReturn: result.estimatedReturn,
            roi: result.roi,
            paybackPeriod: result.paybackPeriod,
            confidenceLevel: result.confidenceLevel
          };
        }
        return initiative;
      });
      
      setCalculatedResults(calculatedInitiatives);
    } catch (error) {
      console.error('Error calculating ROI:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getConfidenceColor = (level?: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'success.main';
      case 'medium': return 'warning.main';
      case 'low': return 'error.main';
      default: return 'text.secondary';
    }
  };
  
  // Get total for portfolio analysis
  const getTotalInvestment = () => {
    return calculatedResults.reduce((sum, initiative) => sum + initiative.cost, 0);
  };
  
  const getTotalReturn = () => {
    return calculatedResults.reduce((sum, initiative) => 
      sum + (initiative.estimatedReturn || 0), 0);
  };
  
  const getPortfolioROI = () => {
    const totalInvestment = getTotalInvestment();
    const totalReturn = getTotalReturn();
    
    if (totalInvestment === 0) return 0;
    return ((totalReturn - totalInvestment) / totalInvestment) * 100;
  };
  
  // Formatting helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Strategic Initiative ROI Calculator
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={calculateROI}
            disabled={initiatives.length === 0 || loading}
            startIcon={<CalculateIcon />}
          >
            Calculate ROI
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader title="Add New Initiative" />
              <Divider />
              <CardContent>
                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel id="preset-select-label">Quick Preset</InputLabel>
                    <Select
                      labelId="preset-select-label"
                      value={selectedPreset}
                      label="Quick Preset"
                      onChange={handlePresetChange as any}
                    >
                      <MenuItem value="">
                        <em>Custom Initiative</em>
                      </MenuItem>
                      {INITIATIVE_PRESETS.map((preset, index) => (
                        <MenuItem key={index} value={index}>
                          {preset.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Initiative Name"
                    value={newInitiativeName}
                    onChange={(e) => setNewInitiativeName(e.target.value)}
                    fullWidth
                  />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Estimated Cost
                    </Typography>
                    <TextField
                      value={newInitiativeCost}
                      onChange={(e) => setNewInitiativeCost(Number(e.target.value))}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      fullWidth
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Timeline (weeks): {newInitiativeTimeframe}
                    </Typography>
                    <Slider
                      value={newInitiativeTimeframe}
                      onChange={(_, value) => setNewInitiativeTimeframe(value as number)}
                      min={4}
                      max={52}
                      step={1}
                      marks={[
                        { value: 4, label: '4w' },
                        { value: 26, label: '26w' },
                        { value: 52, label: '52w' }
                      ]}
                    />
                  </Box>
                  
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddInitiative}
                    disabled={!newInitiativeName}
                    fullWidth
                  >
                    Add Initiative
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardHeader 
                title="Initiatives to Analyze" 
                action={
                  <Tooltip title="Reset All">
                    <IconButton onClick={() => setInitiatives([])}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                {initiatives.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No initiatives added. Add an initiative to calculate ROI.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Initiative</TableCell>
                          <TableCell align="right">Cost</TableCell>
                          <TableCell align="right">Timeline</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {initiatives.map((initiative) => (
                          <TableRow key={initiative.id}>
                            <TableCell>
                              <TextField
                                value={initiative.name}
                                onChange={(e) => handleInitiativeUpdate(initiative.id, 'name', e.target.value)}
                                variant="standard"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                value={initiative.cost}
                                onChange={(e) => handleInitiativeUpdate(initiative.id, 'cost', Number(e.target.value))}
                                type="number"
                                variant="standard"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                value={initiative.timeframe}
                                onChange={(e) => handleInitiativeUpdate(initiative.id, 'timeframe', Number(e.target.value))}
                                type="number"
                                variant="standard"
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">weeks</InputAdornment>,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton onClick={() => handleDeleteInitiative(initiative.id)} size="small">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {calculatedResults.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            ROI Analysis Results
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Initiative</TableCell>
                      <TableCell align="right">Investment</TableCell>
                      <TableCell align="right">Est. Return</TableCell>
                      <TableCell align="right">ROI</TableCell>
                      <TableCell align="right">Payback Period</TableCell>
                      <TableCell align="right">Confidence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calculatedResults.map((initiative) => (
                      <TableRow key={initiative.id}>
                        <TableCell>{initiative.name}</TableCell>
                        <TableCell align="right">{formatCurrency(initiative.cost)}</TableCell>
                        <TableCell align="right">{initiative.estimatedReturn ? formatCurrency(initiative.estimatedReturn) : '-'}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            fontWeight="medium" 
                            color={initiative.roi && initiative.roi > 0 ? 'success.main' : 'error.main'}
                          >
                            {initiative.roi ? `${initiative.roi.toFixed(1)}%` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {initiative.paybackPeriod ? `${initiative.paybackPeriod.toFixed(1)} weeks` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            fontWeight="medium" 
                            color={getConfidenceColor(initiative.confidenceLevel)}
                          >
                            {initiative.confidenceLevel || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Portfolio Summary
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2">Total Investment</Typography>
                      <Typography variant="h4">
                        {formatCurrency(getTotalInvestment())}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2">Estimated Return</Typography>
                      <Typography variant="h4">
                        {formatCurrency(getTotalReturn())}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2">Portfolio ROI</Typography>
                      <Typography variant="h4">
                        {getPortfolioROI().toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2">Initiatives Count</Typography>
                      <Typography variant="h4">
                        {calculatedResults.length}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Note: ROI calculations are estimates based on historical performance data and industry benchmarks.
        Actual returns may vary based on market conditions and implementation quality.
      </Typography>
    </Box>
  );
} 