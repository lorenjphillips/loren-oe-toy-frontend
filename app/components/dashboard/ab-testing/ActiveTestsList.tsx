import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArchiveIcon from '@mui/icons-material/Archive';
import { Test, TestStatus, TestType } from '../../../models/ab-testing';
import { TestManager } from '../../../services/ab-testing';

interface ActiveTestsListProps {
  onViewResults: (testId: string) => void;
}

export const ActiveTestsList: React.FC<ActiveTestsListProps> = ({ onViewResults }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        // In a real app, this would be a proper API call
        const testData = await TestManager.getAllTests();
        setTests(testData);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTests();
  }, []);
  
  const handleStatusChange = async (testId: string, newStatus: TestStatus) => {
    try {
      // In a real app, this would call an API
      await TestManager.updateTestStatus(testId, newStatus);
      
      // Update local state
      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, status: newStatus } : test
      ));
    } catch (error) {
      console.error('Error updating test status:', error);
    }
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };
  
  // Filter tests based on search query and status filter
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Get status chip color based on status
  const getStatusChipColor = (status: TestStatus) => {
    switch (status) {
      case TestStatus.RUNNING:
        return 'success';
      case TestStatus.PAUSED:
        return 'warning';
      case TestStatus.DRAFT:
        return 'default';
      case TestStatus.SCHEDULED:
        return 'info';
      case TestStatus.COMPLETED:
        return 'primary';
      case TestStatus.ARCHIVED:
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Active Tests</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search tests"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value={TestStatus.DRAFT}>Draft</MenuItem>
              <MenuItem value={TestStatus.SCHEDULED}>Scheduled</MenuItem>
              <MenuItem value={TestStatus.RUNNING}>Running</MenuItem>
              <MenuItem value={TestStatus.PAUSED}>Paused</MenuItem>
              <MenuItem value={TestStatus.COMPLETED}>Completed</MenuItem>
              <MenuItem value={TestStatus.ARCHIVED}>Archived</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredTests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No tests found matching your criteria
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Variants</TableCell>
                <TableCell>Traffic</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">{test.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{test.description}</Typography>
                  </TableCell>
                  <TableCell>{test.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={test.status} 
                      color={getStatusChipColor(test.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{test.startDate.toLocaleDateString()}</TableCell>
                  <TableCell>{test.endDate ? test.endDate.toLocaleDateString() : 'Ongoing'}</TableCell>
                  <TableCell>{test.variants.length}</TableCell>
                  <TableCell>{test.trafficAllocation}%</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => onViewResults(test.id)}
                        disabled={test.status !== TestStatus.COMPLETED}
                        title="View Results"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        disabled={test.status === TestStatus.ARCHIVED || test.status === TestStatus.COMPLETED}
                        title="Edit Test"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      
                      {test.status === TestStatus.RUNNING && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleStatusChange(test.id, TestStatus.PAUSED)}
                          title="Pause Test"
                        >
                          <PauseIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {test.status === TestStatus.PAUSED && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleStatusChange(test.id, TestStatus.RUNNING)}
                          title="Resume Test"
                        >
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {test.status === TestStatus.COMPLETED && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleStatusChange(test.id, TestStatus.ARCHIVED)}
                          title="Archive Test"
                        >
                          <ArchiveIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}; 