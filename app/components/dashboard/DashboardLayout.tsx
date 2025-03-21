/**
 * DashboardLayout Component
 * 
 * Main container for the pharma insights dashboard that handles
 * layout, navigation, and dashboard context.
 */
import React, { ReactNode, useState } from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  BarChart as BarChartIcon, 
  Timeline as TimelineIcon,
  Category as CategoryIcon,
  TouchApp as TouchAppIcon,
  Business as BusinessIcon,
  FilterAlt as FilterAltIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

// Dashboard context to share state between components
export interface DashboardContextType {
  dateRange: [Date, Date];
  setDateRange: (range: [Date, Date]) => void;
  selectedCompany: string | null;
  setSelectedCompany: (company: string | null) => void;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  refreshData: () => void;
}

export const DashboardContext = React.createContext<DashboardContextType | null>(null);

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const drawerWidth = 240;

export default function DashboardLayout({ children, title = 'Pharma Insights Dashboard' }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // Dashboard context state
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dateRange, setDateRange] = useState<[Date, Date]>([thirtyDaysAgo, now]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const refreshData = () => {
    // This will be implemented to trigger data refresh across components
    console.log('Refreshing dashboard data...');
  };

  const dashboardContextValue: DashboardContextType = {
    dateRange,
    setDateRange,
    selectedCompany,
    setSelectedCompany,
    filters,
    setFilters,
    refreshData
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Pharma Analytics
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton href="/dashboard">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/dashboard/timeseries">
            <ListItemIcon>
              <TimelineIcon />
            </ListItemIcon>
            <ListItemText primary="Performance Trends" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/dashboard/categories">
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Medical Categories" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/dashboard/engagement">
            <ListItemIcon>
              <TouchAppIcon />
            </ListItemIcon>
            <ListItemText primary="Engagement Metrics" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton href="/dashboard/companies">
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText primary="Company Views" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/dashboard/filters">
            <ListItemIcon>
              <FilterAltIcon />
            </ListItemIcon>
            <ListItemText primary="Advanced Filters" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/dashboard/date-selector">
            <ListItemIcon>
              <DateRangeIcon />
            </ListItemIcon>
            <ListItemText primary="Date Range" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <DashboardContext.Provider value={dashboardContextValue}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.primary.main,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
        
        {/* Side Drawer */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="persistent"
            open={drawerOpen}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ml: { md: drawerOpen ? `${drawerWidth}px` : 0 },
            width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar /> {/* Spacer to prevent content from hiding under the AppBar */}
          {children}
        </Box>
      </Box>
    </DashboardContext.Provider>
  );
} 