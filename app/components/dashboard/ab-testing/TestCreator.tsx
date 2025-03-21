import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Slider,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Test, TestStatus, TestType, Variant } from '../../../models/ab-testing';
import { TestManager } from '../../../services/ab-testing';

interface TestCreatorProps {
  onTestCreated: () => void;
}

export const TestCreator: React.FC<TestCreatorProps> = ({ onTestCreated }) => {
  // Step state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Basic Information', 'Variants', 'Audience & Goals', 'Review & Create'];
  
  // Test data state
  const [testData, setTestData] = useState<Partial<Test>>({
    name: '',
    description: '',
    type: TestType.AB,
    status: TestStatus.DRAFT,
    startDate: new Date(),
    endDate: null,
    targetAudience: [],
    conversionGoals: [],
    variants: [
      // Default control variant
      {
        id: 'v1',
        name: 'Control',
        description: 'Current version',
        isControl: true,
        trafficAllocation: 50,
        properties: {}
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    trafficAllocation: 100,
    confidenceLevel: 0.95,
    sampleSize: 1000
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Custom audience input
  const [audienceInput, setAudienceInput] = useState('');
  
  // Custom goal input
  const [goalInput, setGoalInput] = useState('');
  
  // Handle text field changes
  const handleTextChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error for this field if any
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (field: string) => (e: any) => {
    setTestData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
  // Handle slider changes
  const handleSliderChange = (field: string) => (e: Event, value: number | number[]) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle variant changes
  const handleVariantChange = (index: number, field: string, value: any) => {
    setTestData(prev => {
      const updatedVariants = [...(prev.variants || [])];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value
      };
      
      // If changing traffic allocation, adjust other variants
      if (field === 'trafficAllocation') {
        const controlIndex = updatedVariants.findIndex(v => v.isControl);
        // Only adjust if there are exactly 2 variants (control and one test)
        if (updatedVariants.length === 2 && controlIndex !== -1) {
          const otherIndex = controlIndex === 0 ? 1 : 0;
          updatedVariants[otherIndex].trafficAllocation = 100 - value;
        }
      }
      
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };
  
  // Add new variant
  const handleAddVariant = () => {
    setTestData(prev => {
      const variants = [...(prev.variants || [])];
      // Calculate equal traffic distribution
      const newAllocation = Math.floor(100 / (variants.length + 1));
      
      // Update allocations for existing variants
      const updatedVariants = variants.map(v => ({
        ...v,
        trafficAllocation: newAllocation
      }));
      
      // Add extra to the last variant to ensure sum is 100
      const remainder = 100 - (newAllocation * (variants.length + 1));
      if (remainder > 0 && updatedVariants.length > 0) {
        updatedVariants[updatedVariants.length - 1].trafficAllocation += remainder;
      }
      
      // Add new variant
      updatedVariants.push({
        id: `v${variants.length + 1}`,
        name: `Variant ${variants.length}`,
        description: '',
        isControl: false,
        trafficAllocation: newAllocation,
        properties: {}
      });
      
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };
  
  // Remove variant
  const handleRemoveVariant = (index: number) => {
    setTestData(prev => {
      const variants = [...(prev.variants || [])];
      const removedVariant = variants[index];
      
      // Don't allow removing the control variant
      if (removedVariant.isControl) {
        return prev;
      }
      
      // Remove the variant
      variants.splice(index, 1);
      
      // Redistribute traffic
      const trafficToRedistribute = removedVariant.trafficAllocation;
      const newAllocation = Math.floor(trafficToRedistribute / variants.length);
      
      const updatedVariants = variants.map(v => ({
        ...v,
        trafficAllocation: v.trafficAllocation + newAllocation
      }));
      
      // Add remainder to the last variant
      const remainder = trafficToRedistribute - (newAllocation * variants.length);
      if (remainder > 0 && updatedVariants.length > 0) {
        updatedVariants[updatedVariants.length - 1].trafficAllocation += remainder;
      }
      
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };
  
  // Add audience tag
  const handleAddAudience = () => {
    if (!audienceInput.trim()) return;
    
    setTestData(prev => ({
      ...prev,
      targetAudience: [...(prev.targetAudience || []), audienceInput.trim()]
    }));
    
    setAudienceInput('');
  };
  
  // Remove audience tag
  const handleRemoveAudience = (index: number) => {
    setTestData(prev => ({
      ...prev,
      targetAudience: (prev.targetAudience || []).filter((_, i) => i !== index)
    }));
  };
  
  // Add conversion goal
  const handleAddGoal = () => {
    if (!goalInput.trim()) return;
    
    setTestData(prev => ({
      ...prev,
      conversionGoals: [...(prev.conversionGoals || []), goalInput.trim()]
    }));
    
    setGoalInput('');
  };
  
  // Remove conversion goal
  const handleRemoveGoal = (index: number) => {
    setTestData(prev => ({
      ...prev,
      conversionGoals: (prev.conversionGoals || []).filter((_, i) => i !== index)
    }));
  };
  
  // Validate step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (activeStep) {
      case 0: // Basic Information
        if (!testData.name?.trim()) {
          newErrors.name = 'Test name is required';
        }
        if (!testData.description?.trim()) {
          newErrors.description = 'Description is required';
        }
        if (!testData.type) {
          newErrors.type = 'Test type is required';
        }
        break;
        
      case 1: // Variants
        if (!testData.variants || testData.variants.length < 2) {
          newErrors.variants = 'At least one variant and a control are required';
        } else {
          // Check each variant
          testData.variants.forEach((variant, index) => {
            if (!variant.name?.trim()) {
              newErrors[`variant_${index}_name`] = 'Variant name is required';
            }
          });
          
          // Verify traffic allocation sums to 100
          const totalAllocation = testData.variants.reduce(
            (sum, variant) => sum + variant.trafficAllocation, 
            0
          );
          
          if (Math.abs(totalAllocation - 100) > 0.1) {
            newErrors.trafficAllocation = `Traffic allocation must sum to 100% (currently ${totalAllocation}%)`;
          }
        }
        break;
        
      case 2: // Audience & Goals
        if (!testData.targetAudience || testData.targetAudience.length === 0) {
          newErrors.targetAudience = 'At least one target audience segment is required';
        }
        if (!testData.conversionGoals || testData.conversionGoals.length === 0) {
          newErrors.conversionGoals = 'At least one conversion goal is required';
        }
        break;
        
      case 3: // Review & Create
        // No specific validation needed
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next button
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Create test
      await TestManager.createTest(testData as Test);
      
      // Notify parent component
      onTestCreated();
    } catch (error) {
      console.error('Error creating test:', error);
      setErrors({
        submit: 'Failed to create test. Please try again.'
      });
    }
  };
  
  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Test Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Test Name"
                  fullWidth
                  value={testData.name || ''}
                  onChange={handleTextChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="e.g., Button Color A/B Test"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={testData.description || ''}
                  onChange={handleTextChange('description')}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="What are you testing and why?"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Test Type</InputLabel>
                  <Select
                    value={testData.type || ''}
                    label="Test Type"
                    onChange={handleSelectChange('type')}
                  >
                    <MenuItem value={TestType.AB}>A/B Test</MenuItem>
                    <MenuItem value={TestType.MULTIVARIATE}>Multivariate Test</MenuItem>
                    <MenuItem value={TestType.SPLIT_URL}>Split URL Test</MenuItem>
                    <MenuItem value={TestType.FEATURE_FLAG}>Feature Flag</MenuItem>
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Traffic Allocation
                </Typography>
                <Slider
                  value={testData.trafficAllocation || 100}
                  onChange={handleSliderChange('trafficAllocation')}
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={5}
                  max={100}
                />
                <Typography variant="caption" color="textSecondary">
                  % of total traffic to include in this test
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Test Variants
              </Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddVariant}
                variant="outlined"
                size="small"
              >
                Add Variant
              </Button>
            </Box>
            
            {errors.variants && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.variants}
              </Alert>
            )}
            
            {errors.trafficAllocation && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.trafficAllocation}
              </Alert>
            )}
            
            {testData.variants?.map((variant, index) => (
              <Card 
                key={variant.id}
                sx={{ 
                  mb: 2, 
                  border: variant.isControl ? '1px solid #1976d2' : undefined,
                  borderRadius: 1
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {variant.isControl && <CheckCircleIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />}
                      {variant.isControl ? 'Control Variant' : `Variant ${index}`}
                    </Typography>
                    {!variant.isControl && (
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveVariant(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Variant Name"
                        fullWidth
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        error={!!errors[`variant_${index}_name`]}
                        helperText={errors[`variant_${index}_name`]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Traffic Allocation (%)"
                        type="number"
                        fullWidth
                        value={variant.trafficAllocation}
                        InputProps={{ inputProps: { min: 5, max: 95 } }}
                        onChange={(e) => handleVariantChange(index, 'trafficAllocation', parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={variant.description}
                        onChange={(e) => handleVariantChange(index, 'description', e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Variant Properties
                      </Typography>
                      
                      {/* Example property fields - customize based on test type */}
                      {testData.type === TestType.AB && (
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Button Color"
                              fullWidth
                              placeholder="e.g., #1976d2"
                              value={variant.properties.color || ''}
                              onChange={(e) => {
                                const newProps = { ...variant.properties, color: e.target.value };
                                handleVariantChange(index, 'properties', newProps);
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Button Text"
                              fullWidth
                              placeholder="e.g., Learn More"
                              value={variant.properties.text || ''}
                              onChange={(e) => {
                                const newProps = { ...variant.properties, text: e.target.value };
                                handleVariantChange(index, 'properties', newProps);
                              }}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Target Audience & Conversion Goals
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Target Audience
                </Typography>
                {errors.targetAudience && (
                  <FormHelperText error>{errors.targetAudience}</FormHelperText>
                )}
                
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add target audience segment"
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAudience()}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddAudience}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {testData.targetAudience?.map((audience, index) => (
                    <Chip
                      key={index}
                      label={audience}
                      onDelete={() => handleRemoveAudience(index)}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Conversion Goals
                </Typography>
                {errors.conversionGoals && (
                  <FormHelperText error>{errors.conversionGoals}</FormHelperText>
                )}
                
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add conversion goal"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddGoal}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {testData.conversionGoals?.map((goal, index) => (
                    <Chip
                      key={index}
                      label={goal}
                      onDelete={() => handleRemoveGoal(index)}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Desired Sample Size
                </Typography>
                <Slider
                  value={testData.sampleSize || 1000}
                  onChange={handleSliderChange('sampleSize')}
                  valueLabelDisplay="auto"
                  step={500}
                  marks
                  min={500}
                  max={10000}
                />
                <Typography variant="caption" color="textSecondary">
                  Minimum participants: {testData.sampleSize}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Confidence Level
                </Typography>
                <Slider
                  value={testData.confidenceLevel || 0.95}
                  onChange={handleSliderChange('confidenceLevel')}
                  valueLabelDisplay="auto"
                  step={0.01}
                  marks={[
                    { value: 0.9, label: '90%' },
                    { value: 0.95, label: '95%' },
                    { value: 0.99, label: '99%' }
                  ]}
                  min={0.8}
                  max={0.99}
                />
                <Typography variant="caption" color="textSecondary">
                  {(testData.confidenceLevel! * 100).toFixed(0)}% confidence required for statistical significance
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Create Test
            </Typography>
            
            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.submit}
              </Alert>
            )}
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {testData.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {testData.description}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Test Type</Typography>
                    <Typography variant="body2">{testData.type}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Traffic Allocation</Typography>
                    <Typography variant="body2">{testData.trafficAllocation}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Sample Size</Typography>
                    <Typography variant="body2">{testData.sampleSize}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Confidence Level</Typography>
                    <Typography variant="body2">{(testData.confidenceLevel! * 100).toFixed(0)}%</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Typography variant="subtitle1" gutterBottom>
              Variants ({testData.variants?.length})
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {testData.variants?.map((variant) => (
                <Grid item xs={12} md={6} key={variant.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color={variant.isControl ? 'primary' : 'inherit'}>
                        {variant.name} {variant.isControl && '(Control)'}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {variant.trafficAllocation}% of test traffic
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        {variant.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Target Audience
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {testData.targetAudience?.map((audience, index) => (
                    <Chip key={index} label={audience} size="small" />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Conversion Goals
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {testData.conversionGoals?.map((goal, index) => (
                    <Chip key={index} label={goal} size="small" />
                  ))}
                </Box>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                This test will be created in Draft status. You can review and edit it before activating.
              </Typography>
            </Alert>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create New A/B Test
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ py: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ mt: 2 }}>
        {getStepContent(activeStep)}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        {activeStep > 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
        )}
        
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Create Test
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>
    </Paper>
  );
}; 