/**
 * EmergingTopics Component
 * 
 * Displays fast-growing medical topics based on trend analysis
 * of physician questions. Highlights topics with increasing frequency
 * and provides context on growth rates and significance.
 */
import React, { useContext, useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  LinearProgress,
  IconButton,
  Stack
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Star as StarIcon,
  NewReleases as NewReleasesIcon
} from '@mui/icons-material';
import { DashboardContext } from '../DashboardContext';
import { EmergingTopic } from '../../../services/analytics/trends';
import { trendAnalysisService } from '../../../services/analytics/trends';
import { questionAnalyzer } from '../../../services/analytics/questionAnalyzer';
import { QuestionContext } from '../../../types/analytics';

interface EmergingTopicsProps {
  maxTopics?: number;
  minGrowthRate?: number;
  showRelatedTopics?: boolean;
}

export default function EmergingTopics({ 
  maxTopics = 10, 
  minGrowthRate = 0.1,
  showRelatedTopics = true 
}: EmergingTopicsProps) {
  const dashboardContext = useContext(DashboardContext);
  const [loading, setLoading] = useState(true);
  const [emergingTopics, setEmergingTopics] = useState<EmergingTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, we would fetch historical question data
        // For this demo, we'll use mock data
        const mockQuestions: QuestionContext[] = Array(100).fill(null).map((_, index) => {
          // Create mock question with random date in the past 6 months
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 180));
          
          return {
            id: `q${index}`,
            timestamp: date,
            medicalConcepts: [
              { 
                term: `Concept ${index % 20}`, 
                category: index % 5 === 0 ? 'disease' : 
                          index % 5 === 1 ? 'symptom' : 
                          index % 5 === 2 ? 'treatment' : 
                          index % 5 === 3 ? 'drug' : 'procedure',
                confidence: 0.8 + Math.random() * 0.2
              }
            ],
            clinicalIntent: index % 6 === 0 ? 'diagnosis' :
                            index % 6 === 1 ? 'treatment' :
                            index % 6 === 2 ? 'mechanism' :
                            index % 6 === 3 ? 'monitoring' :
                            index % 6 === 4 ? 'prevention' : 'prognosis',
            treatmentIndications: []
          };
        });
        
        // Run trend analysis
        const topics = await trendAnalysisService.detectEmergingTopics(mockQuestions, {
          timeframe: 'weekly',
          baselinePeriod: 12,
          minSampleSize: 5
        });
        
        // Filter and sort by growth rate
        setEmergingTopics(
          topics
            .filter(topic => topic.growthRate >= minGrowthRate)
            .sort((a, b) => b.velocityScore - a.velocityScore)
            .slice(0, maxTopics)
        );
      } catch (err) {
        console.error('Error fetching emerging topics:', err);
        setError('Failed to load emerging topics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, maxTopics, minGrowthRate]);
  
  // Helper to format percentage
  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  // Helper to determine color based on growth
  const getGrowthColor = (growth: number): string => {
    if (growth >= 20) return 'success.main';
    if (growth >= 5) return 'success.light';
    if (growth >= 0) return 'info.main';
    if (growth >= -5) return 'warning.light';
    return 'error.light';
  };
  
  const renderTopicRow = (topic: EmergingTopic, index: number) => {
    const topicGrowthColor = getGrowthColor(topic.percentageChange);
    
    return (
      <TableRow 
        key={topic.topicId} 
        sx={{ 
          '&:last-child td, &:last-child th': { border: 0 },
          backgroundColor: index % 2 === 0 ? 'background.default' : 'background.paper'
        }}
      >
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight="medium">
              {topic.name}
            </Typography>
            {topic.newness > 0.7 && (
              <Tooltip title="New topic with minimal historical data">
                <NewReleasesIcon fontSize="small" color="info" />
              </Tooltip>
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <Chip 
            size="small" 
            label={formatPercentage(topic.percentageChange)} 
            sx={{ 
              color: 'white',
              bgcolor: topicGrowthColor,
              fontWeight: 'medium'
            }}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '70%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, topic.velocityScore * 100)} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'grey.200'
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {(topic.velocityScore * 10).toFixed(1)}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          {topic.conceptType}
        </TableCell>
        {showRelatedTopics && (
          <TableCell>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {topic.relatedTopics.slice(0, 2).map((related) => (
                <Chip
                  key={related.topicId}
                  label={related.name}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', my: 0.25 }}
                />
              ))}
              {topic.relatedTopics.length > 2 && (
                <Tooltip title={topic.relatedTopics.slice(2).map(r => r.name).join(', ')}>
                  <Chip
                    label={`+${topic.relatedTopics.length - 2}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', my: 0.25 }}
                  />
                </Tooltip>
              )}
            </Stack>
          </TableCell>
        )}
      </TableRow>
    );
  };
  
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 1 }} color="primary" />
            Emerging Medical Topics
          </Typography>
          <Tooltip title="Topics with increasing frequency in physician questions">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', color: 'error.main', my: 2 }}>
            <Typography>{error}</Typography>
          </Box>
        ) : emergingTopics.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', my: 2 }}>
            <Typography>No emerging topics found for the selected time period.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.default' }}>
                  <TableCell>Topic</TableCell>
                  <TableCell>Growth</TableCell>
                  <TableCell>Velocity</TableCell>
                  <TableCell>Type</TableCell>
                  {showRelatedTopics && <TableCell>Related Topics</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {emergingTopics.map((topic, index) => renderTopicRow(topic, index))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {!loading && emergingTopics.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Based on physician question analysis for {dashboardContext.dateRange[0].toLocaleDateString()} - {dashboardContext.dateRange[1].toLocaleDateString()}
            </Typography>
            
            <Tooltip title="Topics with the highest velocity of growth are highlighted">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon fontSize="small" sx={{ color: 'warning.main', mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                  Top Velocity
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 