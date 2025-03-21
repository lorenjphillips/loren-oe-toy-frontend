/**
 * Knowledge Graph visualization route
 * Demonstrates the knowledge graph system for visualizing medical relationships
 */

import React from 'react';
import KnowledgeGraphDemo from '../components/knowledge-graph/KnowledgeGraphDemo';
import { Container, Typography, Box, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const KnowledgeGraphPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Link href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', width: 'fit-content' }}>
          <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">Back to Dashboard</Typography>
        </Link>
      </Box>
      
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        Knowledge Graph Visualization
      </Typography>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', mb: 4 }}>
        <KnowledgeGraphDemo />
      </Box>
    </Container>
  );
};

export default KnowledgeGraphPage; 