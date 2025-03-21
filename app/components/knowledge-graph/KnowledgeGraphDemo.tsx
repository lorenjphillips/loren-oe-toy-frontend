/**
 * Knowledge Graph Demo Component
 * Demonstrates the knowledge graph visualization functionality with sample data
 */

import React, { useState, useEffect } from 'react';
import GraphEngine from './GraphEngine';
import oncologyKnowledgeGraph from '../../data/knowledgeGraphs/oncologyGraph';
import { KnowledgeGraphFilters, NodeType, RelationshipType, EvidenceStrength } from '../../models/knowledgeGraph';
import { Box, Typography, Paper, Stack, Divider, Button, useTheme } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import * as NodeTypes from './NodeTypes';
import * as EdgeTypes from './EdgeTypes';

const KnowledgeGraphDemo: React.FC = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [filters, setFilters] = useState<KnowledgeGraphFilters>({
    nodeTypes: [],
    relationshipTypes: [],
    evidenceStrengths: []
  });

  useEffect(() => {
    // Simulate loading delay to allow for graph preparation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (newFilters: KnowledgeGraphFilters) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({
      nodeTypes: [],
      relationshipTypes: [],
      evidenceStrengths: []
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 40, 50, 0.95)' : 'rgba(245, 250, 255, 0.95)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Breast Cancer Treatment Knowledge Graph
          </Typography>
          <Button 
            startIcon={<InfoIcon />} 
            onClick={() => setShowInfo(!showInfo)} 
            variant={showInfo ? "contained" : "outlined"}
            color="primary"
            size="small"
          >
            {showInfo ? "Hide Info" : "Show Info"}
          </Button>
        </Box>
        
        {showInfo && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              This knowledge graph visualizes relationships between breast cancer treatments, biomarkers, and medical concepts.
              It demonstrates how different drugs and treatments interact with specific cancer types and biomarkers.
            </Typography>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={2} 
              divider={<Divider orientation="vertical" flexItem />}
              sx={{ mt: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Node Types</Typography>
                <NodeTypes.NodeTypeLegend 
                  types={Object.values(NodeType)}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Relationship Types</Typography>
                <EdgeTypes.EdgeLegend
                  types={Object.values(RelationshipType)}
                  strengths={Object.values(EvidenceStrength)}
                />
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              Tips: Zoom with mouse wheel, pan by dragging, click nodes to explore relationships. 
              Use the controls to filter the graph by node or relationship types.
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ 
        flex: 1, 
        border: `1px solid ${theme.palette.divider}`, 
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        minHeight: '600px',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 20, 24, 0.8)' : 'rgba(240, 247, 255, 0.8)'
      }}>
        {isLoading ? (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Loading Knowledge Graph...
            </Typography>
            <Box sx={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              border: '3px solid transparent',
              borderTopColor: theme.palette.primary.main,
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </Box>
        ) : (
          <GraphEngine 
            knowledgeGraph={oncologyKnowledgeGraph}
            filters={filters}
            onFiltersChange={handleFilterChange}
            onResetFilters={resetFilters}
          />
        )}
      </Box>
    </Box>
  );
};

export default KnowledgeGraphDemo; 