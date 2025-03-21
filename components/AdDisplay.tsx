import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Skeleton, Chip, Stack } from '@mui/material';
import axios from 'axios';
import { Ad } from '../types/ads';

interface AdDisplayProps {
  question: string;
  history: { role: string; content: string }[];
  userId?: string;
  questionId?: string;
}

/**
 * Component that displays relevant ads based on the current medical question
 */
export default function AdDisplay({ question, history, userId, questionId }: AdDisplayProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ categoryId: string; confidence: number }[]>([]);

  useEffect(() => {
    // Don't fetch an ad if there's no question
    if (!question || question.trim() === '') return;

    const fetchAd = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post('/api/ads', {
          question,
          history,
          userId,
          questionId
        });

        setAd(response.data.ad);
        setCategories(response.data.categories || []);
      } catch (err: any) {
        console.error('Error fetching ad:', err);
        setError(err.message || 'Failed to load relevant ad');
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    // Fetch the ad with a slight delay to avoid too many requests during typing
    const timeoutId = setTimeout(() => {
      fetchAd();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [question, history, userId, questionId]);

  const handleAdClick = async () => {
    if (!ad) return;

    try {
      // Track the click event
      await axios.post('/api/ads/click', {
        adId: ad.id,
        userId,
        questionId
      });

      // Open the ad URL in a new tab
      window.open(ad.targetUrl, '_blank');
    } catch (err) {
      console.error('Error tracking ad click:', err);
    }
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="text" width="60%" height={30} />
          <Skeleton variant="text" width="90%" height={20} />
          <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
        </Box>
      </Paper>
    );
  }

  // Don't render anything if there's no ad to show
  if (!ad) return null;

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2, 
        border: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9' 
      }}
    >
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          {ad.title}
        </Typography>
        <Typography variant="body2" sx={{ my: 1 }}>
          {ad.description}
        </Typography>
        
        {ad.imageUrl && (
          <Box 
            component="img"
            src={ad.imageUrl}
            alt={ad.title}
            sx={{ 
              width: '100%', 
              maxHeight: '150px', 
              objectFit: 'contain',
              my: 1,
              borderRadius: 1 
            }}
          />
        )}

        {categories.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            {categories.slice(0, 3).map((category, index) => (
              <Chip 
                key={index} 
                label={category.categoryId} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            ))}
          </Stack>
        )}
        
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleAdClick}
          sx={{ mt: 1 }}
        >
          Learn More
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'right', color: 'text.secondary' }}>
          Sponsored Content
        </Typography>
      </Box>
    </Paper>
  );
} 