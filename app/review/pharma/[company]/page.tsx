'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Divider, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert
} from '@mui/material';
import { styled } from '@mui/system';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LineChart from 'react-apexcharts';
import PieChart from 'react-apexcharts';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '1.5rem',
  marginBottom: '1.5rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  borderRadius: '8px',
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color = '#4caf50'; // Active - green
  if (status === 'pending') color = '#ff9800'; // Pending - orange
  else if (status === 'rejected') color = '#f44336'; // Rejected - red
  else if (status === 'review') color = '#2196f3'; // In Review - blue
  
  return {
    backgroundColor: color,
    color: 'white',
  };
});

interface CompanyData {
  id: string;
  name: string;
  description: string;
  color: string;
  campaigns: Campaign[];
  adStats: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    roi: number;
  };
  monthlyImpressions: number[];
  categoryBreakdown: {
    name: string;
    value: number;
  }[];
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'rejected' | 'review';
  category: string;
  impressions: number;
  clicks: number;
  ctr: number;
  approved: boolean;
  ads: number;
}

export default function CompanyPage({ params }: { params: { company: string } }) {
  const { company } = params;
  const [activeTab, setActiveTab] = useState(0);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch data from an API
    // For demo purposes, we're creating mock data based on the company parameter
    const fetchCompanyData = () => {
      setLoading(true);
      
      // Mock data for demonstration
      const mockData: Record<string, CompanyData> = {
        pfizer: {
          id: 'pfizer',
          name: 'Pfizer',
          description: 'Pfizer Inc. is an American multinational pharmaceutical and biotechnology corporation.',
          color: '#0093d0',
          campaigns: [
            { id: 'pf1', name: 'Oncology Treatment Awareness', status: 'active', category: 'Oncology', impressions: 124500, clicks: 3200, ctr: 2.57, approved: true, ads: 8 },
            { id: 'pf2', name: 'Vaccine Information Campaign', status: 'active', category: 'Vaccines', impressions: 98700, clicks: 4120, ctr: 4.17, approved: true, ads: 6 },
            { id: 'pf3', name: 'Immunology Product Launch', status: 'pending', category: 'Immunology', impressions: 0, clicks: 0, ctr: 0, approved: false, ads: 4 },
            { id: 'pf4', name: 'Breast Cancer Awareness', status: 'active', category: 'Oncology', impressions: 87300, clicks: 2980, ctr: 3.41, approved: true, ads: 5 }
          ],
          adStats: {
            impressions: 310500,
            clicks: 10300,
            conversions: 1240,
            ctr: 3.32,
            roi: 4.7
          },
          monthlyImpressions: [23500, 27800, 30200, 28900, 31500, 35700, 42100, 40900, 38700, 37600, 41800, 46500],
          categoryBreakdown: [
            { name: 'Oncology', value: 48 },
            { name: 'Vaccines', value: 32 },
            { name: 'Immunology', value: 12 },
            { name: 'Other', value: 8 }
          ]
        },
        novartis: {
          id: 'novartis',
          name: 'Novartis',
          description: 'Novartis International AG is a Swiss multinational pharmaceutical company.',
          color: '#0460a9',
          campaigns: [
            { id: 'nv1', name: 'Cardiovascular Health Initiative', status: 'active', category: 'Cardiovascular', impressions: 145300, clicks: 5840, ctr: 4.02, approved: true, ads: 7 },
            { id: 'nv2', name: 'Ophthalmology Specialist Campaign', status: 'active', category: 'Ophthalmology', impressions: 76800, clicks: 2930, ctr: 3.81, approved: true, ads: 5 },
            { id: 'nv3', name: 'Neuroscience Research Insights', status: 'review', category: 'Neuroscience', impressions: 12400, clicks: 780, ctr: 6.29, approved: true, ads: 3 },
            { id: 'nv4', name: 'Dermatology Product Launch', status: 'pending', category: 'Dermatology', impressions: 0, clicks: 0, ctr: 0, approved: false, ads: 4 }
          ],
          adStats: {
            impressions: 234500,
            clicks: 9550,
            conversions: 980,
            ctr: 4.07,
            roi: 3.9
          },
          monthlyImpressions: [18900, 20400, 19700, 22300, 24500, 26100, 29700, 31800, 33200, 32100, 35800, 37900],
          categoryBreakdown: [
            { name: 'Cardiovascular', value: 43 },
            { name: 'Ophthalmology', value: 28 },
            { name: 'Neuroscience', value: 19 },
            { name: 'Other', value: 10 }
          ]
        },
        merck: {
          id: 'merck',
          name: 'Merck',
          description: 'Merck & Co., Inc. is an American multinational pharmaceutical company.',
          color: '#00857c',
          campaigns: [
            { id: 'mk1', name: 'Oncology Precision Medicine', status: 'active', category: 'Oncology', impressions: 112700, clicks: 4380, ctr: 3.89, approved: true, ads: 6 },
            { id: 'mk2', name: 'Vaccine Educational Series', status: 'active', category: 'Vaccines', impressions: 89400, clicks: 3210, ctr: 3.59, approved: true, ads: 5 },
            { id: 'mk3', name: 'Infectious Disease Treatment', status: 'review', category: 'Infectious Disease', impressions: 8900, clicks: 410, ctr: 4.61, approved: true, ads: 2 },
            { id: 'mk4', name: 'Diabetes Care Program', status: 'rejected', category: 'Endocrinology', impressions: 0, clicks: 0, ctr: 0, approved: false, ads: 3 }
          ],
          adStats: {
            impressions: 211000,
            clicks: 8000,
            conversions: 920,
            ctr: 3.79,
            roi: 4.2
          },
          monthlyImpressions: [16700, 18200, 19500, 20100, 22700, 24300, 26700, 28400, 29900, 31200, 33700, 35600],
          categoryBreakdown: [
            { name: 'Oncology', value: 41 },
            { name: 'Vaccines', value: 35 },
            { name: 'Infectious Disease', value: 18 },
            { name: 'Other', value: 6 }
          ]
        },
        // Add more companies as needed...
        default: {
          id: 'default',
          name: 'Demo Company',
          description: 'This is a demonstration pharmaceutical company dashboard.',
          color: '#5e35b1',
          campaigns: [
            { id: 'dm1', name: 'Sample Campaign 1', status: 'active', category: 'General', impressions: 50000, clicks: 2000, ctr: 4.0, approved: true, ads: 4 },
            { id: 'dm2', name: 'Sample Campaign 2', status: 'review', category: 'General', impressions: 25000, clicks: 1000, ctr: 4.0, approved: true, ads: 3 }
          ],
          adStats: {
            impressions: 75000,
            clicks: 3000,
            conversions: 300,
            ctr: 4.0,
            roi: 3.5
          },
          monthlyImpressions: [5000, 6000, 7000, 6500, 7500, 8000, 9000, 10000, 9500, 10500, 11000, 12000],
          categoryBreakdown: [
            { name: 'General', value: 100 }
          ]
        }
      };
      
      setTimeout(() => {
        setCompanyData(mockData[company] || mockData.default);
        setLoading(false);
      }, 500); // Simulate loading delay
    };

    fetchCompanyData();
  }, [company]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading || !companyData) {
    return (
      <Container maxWidth="lg" sx={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <Typography variant="h5">Loading company data...</Typography>
      </Container>
    );
  }

  const renderDashboard = () => {
    const lineChartOptions = {
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false
        }
      },
      colors: [companyData.color],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy'
        },
      }
    };

    const lineChartSeries = [{
      name: "Impressions",
      data: companyData.monthlyImpressions
    }];

    const pieChartOptions = {
      chart: {
        type: 'pie',
      },
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      colors: ['#0093d0', '#00857c', '#e31937', '#f36633']
    };

    const pieChartSeries = companyData.categoryBreakdown.map(item => item.value);
    const pieChartLabels = companyData.categoryBreakdown.map(item => item.name);

    return (
      <>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <StyledPaper>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Impressions
              </Typography>
              <Typography variant="h4" sx={{ color: companyData.color }}>
                {companyData.adStats.impressions.toLocaleString()}
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StyledPaper>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Clicks
              </Typography>
              <Typography variant="h4" sx={{ color: companyData.color }}>
                {companyData.adStats.clicks.toLocaleString()}
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StyledPaper>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Average CTR
              </Typography>
              <Typography variant="h4" sx={{ color: companyData.color }}>
                {companyData.adStats.ctr.toFixed(2)}%
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StyledPaper>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                ROI
              </Typography>
              <Typography variant="h4" sx={{ color: companyData.color }}>
                {companyData.adStats.roi.toFixed(1)}x
              </Typography>
            </StyledPaper>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>Monthly Impressions</Typography>
              <div id="chart">
                <LineChart 
                  options={lineChartOptions as any}
                  series={lineChartSeries}
                  type="line"
                  height={350}
                />
              </div>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
              <Box sx={{ mt: 2 }}>
                <PieChart
                  options={{
                    ...pieChartOptions as any,
                    labels: pieChartLabels
                  }}
                  series={pieChartSeries}
                  type="pie"
                  height={300}
                />
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderCampaigns = () => {
    return (
      <StyledPaper>
        <Typography variant="h6" gutterBottom>Active Campaigns</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Impressions</TableCell>
                <TableCell align="right">Clicks</TableCell>
                <TableCell align="right">CTR</TableCell>
                <TableCell align="right">Ads</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companyData.campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.category}</TableCell>
                  <TableCell>
                    <StatusChip
                      label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      size="small"
                      status={campaign.status}
                    />
                  </TableCell>
                  <TableCell align="right">{campaign.impressions.toLocaleString()}</TableCell>
                  <TableCell align="right">{campaign.clicks.toLocaleString()}</TableCell>
                  <TableCell align="right">{campaign.ctr.toFixed(2)}%</TableCell>
                  <TableCell align="right">{campaign.ads}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>
    );
  };

  const renderCompliance = () => {
    return (
      <>
        <Alert severity="info" sx={{ mb: 3 }}>
          This section demonstrates the regulatory compliance monitoring features available to pharmaceutical advertisers.
        </Alert>

        <StyledPaper>
          <Typography variant="h6" gutterBottom>Compliance Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="success.main">
                    92%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Compliance Score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="primary.main">
                    15
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Reviews
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="warning.main">
                    3
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items Needing Attention
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Regulatory Requirements</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Requirement</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Fair Balance</TableCell>
                    <TableCell>
                      <Chip label="Compliant" size="small" color="success" />
                    </TableCell>
                    <TableCell>2 days ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Risk Information</TableCell>
                    <TableCell>
                      <Chip label="Compliant" size="small" color="success" />
                    </TableCell>
                    <TableCell>2 days ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Indication Disclosure</TableCell>
                    <TableCell>
                      <Chip label="Needs Review" size="small" color="warning" />
                    </TableCell>
                    <TableCell>5 days ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Claims Substantiation</TableCell>
                    <TableCell>
                      <Chip label="Compliant" size="small" color="success" />
                    </TableCell>
                    <TableCell>1 week ago</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </StyledPaper>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          component={Link} 
          href="/review/pharma" 
          variant="outlined" 
          sx={{ mb: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Back to Company Selection
        </Button>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1rem', 
          borderLeft: `4px solid ${companyData.color}`, 
          paddingLeft: '1rem' 
        }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 0 }}>
            {companyData.name} Dashboard
          </Typography>
        </Box>
        <Typography variant="body1" paragraph>
          {companyData.description}
        </Typography>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        textColor="primary" 
        indicatorColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="Dashboard" />
        <Tab label="Campaigns" />
        <Tab label="Compliance" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && renderDashboard()}
        {activeTab === 1 && renderCampaigns()}
        {activeTab === 2 && renderCompliance()}
      </Box>
    </Container>
  );
} 