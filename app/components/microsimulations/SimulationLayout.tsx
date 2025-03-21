'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import {
  Box,
  Grid,
  Container,
  Paper,
  Divider,
  Typography,
  useMediaQuery,
  Theme,
  Button,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Fade,
  Grow,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import PanelLeftIcon from '@mui/icons-material/ViewCompact';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { clinicalColors, shadows, animationDurations } from '../../styles/microsimulation';

export type SimulationLayoutView = 'standard' | 'compact' | 'focused';
export type SimulationSection = 'patient' | 'decision' | 'diagnostics' | 'outcome' | 'timeline';

interface SimulationLayoutProps {
  title: string;
  patientInfo: ReactNode;
  decisionArea?: ReactNode;
  diagnosticArea?: ReactNode;
  outcomeArea?: ReactNode;
  timelineArea?: ReactNode;
  educationalContent?: ReactNode;
  sponsoredContent?: ReactNode;
  onViewChange?: (view: SimulationLayoutView) => void;
  onSectionFocus?: (section: SimulationSection) => void;
  initialView?: SimulationLayoutView;
  showSponsored?: boolean;
  showEducational?: boolean;
  allowViewToggle?: boolean;
  allowFullscreen?: boolean;
}

// Styled components
const ContentTransition = styled(Grow)(({ theme }) => ({
  transformOrigin: '0 0 0',
  transition: `all ${animationDurations.medium}ms cubic-bezier(0.4, 0, 0.2, 1)`,
}));

/**
 * Component that manages the layout for clinical microsimulations
 * Provides responsive layouts and transitions between different components
 */
export const SimulationLayout: React.FC<SimulationLayoutProps> = ({
  title,
  patientInfo,
  decisionArea,
  diagnosticArea,
  outcomeArea,
  timelineArea,
  educationalContent,
  sponsoredContent,
  onViewChange,
  onSectionFocus,
  initialView = 'standard',
  showSponsored = false,
  showEducational = true,
  allowViewToggle = true,
  allowFullscreen = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // State
  const [view, setView] = useState<SimulationLayoutView>(initialView);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState<SimulationSection>('patient');
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  
  // Calculate content area width based on sidebar visibility
  const contentWidth = sidebarOpen && !isMobile ? 'calc(100% - 320px)' : '100%';

  // Effect to handle view changes based on screen size
  useEffect(() => {
    if (isMobile && view !== 'compact') {
      handleViewChange('compact');
      setSidebarOpen(false);
    }
  }, [isMobile, view]);

  // Handle view change
  const handleViewChange = (newView: SimulationLayoutView) => {
    setView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle section focus
  const handleSectionFocus = (section: SimulationSection) => {
    setActiveSection(section);
    if (onSectionFocus) {
      onSectionFocus(section);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Mobile menu handlers
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  // Toggle info panel
  const toggleInfoPanel = () => {
    setInfoOpen(!infoOpen);
  };

  // Render the top app bar
  const renderAppBar = () => (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{ 
        backgroundColor: clinicalColors.background.paper,
        borderBottom: `1px solid ${clinicalColors.border.light}`,
        boxShadow: shadows.low,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
          {/* Mobile menu */}
          {isMobile && (
            <>
              <IconButton 
                edge="start" 
                color="inherit" 
                aria-label="menu"
                onClick={handleMobileMenuOpen}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                <MenuItem onClick={() => { handleSectionFocus('patient'); handleMobileMenuClose(); }}>
                  Patient Information
                </MenuItem>
                {decisionArea && (
                  <MenuItem onClick={() => { handleSectionFocus('decision'); handleMobileMenuClose(); }}>
                    Clinical Decisions
                  </MenuItem>
                )}
                {diagnosticArea && (
                  <MenuItem onClick={() => { handleSectionFocus('diagnostics'); handleMobileMenuClose(); }}>
                    Diagnostic Tests
                  </MenuItem>
                )}
                {outcomeArea && (
                  <MenuItem onClick={() => { handleSectionFocus('outcome'); handleMobileMenuClose(); }}>
                    Patient Outcome
                  </MenuItem>
                )}
                {timelineArea && (
                  <MenuItem onClick={() => { handleSectionFocus('timeline'); handleMobileMenuClose(); }}>
                    Timeline
                  </MenuItem>
                )}
                <Divider />
                {allowViewToggle && (
                  <MenuItem onClick={() => { handleViewChange(view === 'standard' ? 'compact' : 'standard'); handleMobileMenuClose(); }}>
                    {view === 'standard' ? 'Compact View' : 'Standard View'}
                  </MenuItem>
                )}
                {showEducational && (
                  <MenuItem onClick={() => { toggleInfoPanel(); handleMobileMenuClose(); }}>
                    Educational Content
                  </MenuItem>
                )}
              </Menu>
            </>
          )}

          {/* Title */}
          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 500,
              color: clinicalColors.text.primary,
            }}
          >
            {title}
          </Typography>

          {/* Desktop controls */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {allowViewToggle && (
              <Button
                startIcon={<PanelLeftIcon />}
                onClick={() => handleViewChange(view === 'standard' ? 'compact' : 'standard')}
                sx={{ mr: 1 }}
              >
                {view === 'standard' ? 'Compact View' : 'Standard View'}
              </Button>
            )}
            
            {showEducational && (
              <Button
                startIcon={<InfoIcon />}
                onClick={toggleInfoPanel}
                sx={{ mr: 1 }}
              >
                Educational Content
              </Button>
            )}
            
            {allowFullscreen && (
              <IconButton color="inherit" onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            )}
          </Box>

          {/* Mobile action buttons */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            {allowFullscreen && (
              <IconButton color="inherit" onClick={toggleFullscreen} size="small">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );

  // Render the sidebar with educational content
  const renderSidebar = () => (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="right"
      open={sidebarOpen}
      onClose={toggleSidebar}
      sx={{
        width: 320,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 320,
          boxSizing: 'border-box',
          borderLeft: `1px solid ${clinicalColors.border.light}`,
          backgroundColor: clinicalColors.background.default,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div">
          Educational Content
        </Typography>
        <IconButton onClick={toggleSidebar}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2, overflowY: 'auto' }}>
        {educationalContent}
      </Box>
      
      {showSponsored && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" component="div" sx={{ mb: 1, color: 'text.secondary' }}>
              Sponsored Content
            </Typography>
            {sponsoredContent}
          </Box>
        </>
      )}
    </Drawer>
  );

  // Render different layout based on the selected view
  const renderContent = () => {
    // For mobile, show only the active section
    if (isMobile) {
      return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {activeSection === 'patient' && (
            <ContentTransition in={activeSection === 'patient'} timeout={animationDurations.medium}>
              <Box>{patientInfo}</Box>
            </ContentTransition>
          )}
          
          {activeSection === 'decision' && decisionArea && (
            <ContentTransition in={activeSection === 'decision'} timeout={animationDurations.medium}>
              <Box>{decisionArea}</Box>
            </ContentTransition>
          )}
          
          {activeSection === 'diagnostics' && diagnosticArea && (
            <ContentTransition in={activeSection === 'diagnostics'} timeout={animationDurations.medium}>
              <Box>{diagnosticArea}</Box>
            </ContentTransition>
          )}
          
          {activeSection === 'outcome' && outcomeArea && (
            <ContentTransition in={activeSection === 'outcome'} timeout={animationDurations.medium}>
              <Box>{outcomeArea}</Box>
            </ContentTransition>
          )}
          
          {activeSection === 'timeline' && timelineArea && (
            <ContentTransition in={activeSection === 'timeline'} timeout={animationDurations.medium}>
              <Box>{timelineArea}</Box>
            </ContentTransition>
          )}
          
          {/* Mobile navigation */}
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              zIndex: 10,
              display: 'flex',
              justifyContent: 'space-around',
              py: 1,
              backgroundColor: clinicalColors.background.paper,
              borderTop: `1px solid ${clinicalColors.border.light}`,
            }}
          >
            <Button 
              onClick={() => handleSectionFocus('patient')}
              color={activeSection === 'patient' ? 'primary' : 'inherit'}
              sx={{ 
                minWidth: 0, 
                fontWeight: activeSection === 'patient' ? 600 : 400,
              }}
            >
              Patient
            </Button>
            
            {decisionArea && (
              <Button 
                onClick={() => handleSectionFocus('decision')}
                color={activeSection === 'decision' ? 'primary' : 'inherit'}
                sx={{ 
                  minWidth: 0,
                  fontWeight: activeSection === 'decision' ? 600 : 400,
                }}
              >
                Decisions
              </Button>
            )}
            
            {diagnosticArea && (
              <Button 
                onClick={() => handleSectionFocus('diagnostics')}
                color={activeSection === 'diagnostics' ? 'primary' : 'inherit'}
                sx={{ 
                  minWidth: 0,
                  fontWeight: activeSection === 'diagnostics' ? 600 : 400,
                }}
              >
                Tests
              </Button>
            )}
            
            {outcomeArea && (
              <Button 
                onClick={() => handleSectionFocus('outcome')}
                color={activeSection === 'outcome' ? 'primary' : 'inherit'}
                sx={{ 
                  minWidth: 0,
                  fontWeight: activeSection === 'outcome' ? 600 : 400,
                }}
              >
                Outcome
              </Button>
            )}
            
            {timelineArea && (
              <Button 
                onClick={() => handleSectionFocus('timeline')}
                color={activeSection === 'timeline' ? 'primary' : 'inherit'}
                sx={{ 
                  minWidth: 0,
                  fontWeight: activeSection === 'timeline' ? 600 : 400,
                }}
              >
                Timeline
              </Button>
            )}
          </Paper>
        </Container>
      );
    }

    // Standard desktop view
    if (view === 'standard') {
      return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* Left column */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ mb: 3 }}>{patientInfo}</Box>
              {decisionArea && <Box sx={{ mb: 3 }}>{decisionArea}</Box>}
            </Grid>
            
            {/* Right column */}
            <Grid item xs={12} lg={6}>
              {diagnosticArea && <Box sx={{ mb: 3 }}>{diagnosticArea}</Box>}
              {outcomeArea && <Box sx={{ mb: 3 }}>{outcomeArea}</Box>}
              {timelineArea && <Box>{timelineArea}</Box>}
            </Grid>
          </Grid>
        </Container>
      );
    }

    // Compact view
    if (view === 'compact') {
      return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ mb: 3 }}>{patientInfo}</Box>
          {timelineArea && <Box sx={{ mb: 3 }}>{timelineArea}</Box>}
          {decisionArea && <Box sx={{ mb: 3 }}>{decisionArea}</Box>}
          {diagnosticArea && <Box sx={{ mb: 3 }}>{diagnosticArea}</Box>}
          {outcomeArea && <Box sx={{ mb: 3 }}>{outcomeArea}</Box>}
        </Container>
      );
    }

    // Focused view - emphasizes current decision or outcome
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>{patientInfo}</Box>
        {decisionArea && <Box sx={{ mb: 3 }}>{decisionArea}</Box>}
        {outcomeArea && <Box sx={{ mb: 3 }}>{outcomeArea}</Box>}
        {diagnosticArea && <Box sx={{ mb: 3 }}>{diagnosticArea}</Box>}
        {timelineArea && <Box>{timelineArea}</Box>}
      </Container>
    );
  };

  // Main component render
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: clinicalColors.background.default,
      overflow: 'hidden',
    }}>
      {renderAppBar()}
      
      <Box sx={{ 
        display: 'flex',
        flexGrow: 1,
        overflow: 'hidden',
      }}>
        {/* Main content area */}
        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          width: contentWidth,
          transition: 'width 0.3s ease',
          pb: isMobile ? 8 : 0, // Add padding for mobile navigation
        }}>
          {renderContent()}
        </Box>
        
        {/* Sidebar */}
        {showEducational && renderSidebar()}
      </Box>
    </Box>
  );
};

export default SimulationLayout; 