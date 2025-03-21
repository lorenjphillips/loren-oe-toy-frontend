import { keyframes } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';

// Keyframes for animations
export const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.3);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(66, 153, 225, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 153, 225, 0);
  }
`;

export const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

// Custom staggered entrance animation
export const staggeredFadeIn = (delay: number = 0) => keyframes`
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Customizable transition settings
export interface TransitionSettings {
  // General settings
  durationBase: number; // Base duration for animations in ms
  durationShort: number; // Shorter duration for quick animations in ms
  durationLong: number; // Longer duration for elaborate animations in ms
  
  // Specific feature toggles
  enablePulse: boolean; // Enable pulse effect during processing
  enableStaggered: boolean; // Enable staggered entrance for elements
  enableFadeTransitions: boolean; // Enable fade transitions between states
  
  // Fade settings
  fadeInDuration: number;
  fadeOutDuration: number;
  
  // Staggered timing - delays between elements in ms
  staggerDelay: number;
  
  // Easing functions
  easingIn: string;
  easingOut: string;
  easingInOut: string;
}

// Default transition settings optimized for clinical professionalism
export const defaultTransitionSettings: TransitionSettings = {
  durationBase: 500,
  durationShort: 300,
  durationLong: 800,
  
  enablePulse: true,
  enableStaggered: true,
  enableFadeTransitions: true,
  
  fadeInDuration: 500,
  fadeOutDuration: 300,
  
  staggerDelay: 100,
  
  easingIn: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  easingOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easingInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
};

// Custom transition components and utilities
export const getStaggeredStyles = (
  index: number,
  settings: TransitionSettings = defaultTransitionSettings
) => ({
  animation: `${fadeInUp} ${settings.durationBase}ms ${settings.easingInOut} forwards`,
  animationDelay: `${index * settings.staggerDelay}ms`,
  opacity: 0,
});

// Helper to create optimized transition props for Material UI components
export const createTransitionProps = (
  timeout: number,
  settings: TransitionSettings = defaultTransitionSettings
): TransitionProps => ({
  timeout: {
    enter: settings.fadeInDuration,
    exit: settings.fadeOutDuration,
  },
  style: {
    transition: `opacity ${timeout}ms ${settings.easingInOut}`,
  },
});

// Helper for creating theme-aware transition strings
export const getTransitionString = (
  properties: string[],
  duration: number = defaultTransitionSettings.durationBase,
  easing: string = defaultTransitionSettings.easingInOut
): string => {
  return properties
    .map(prop => `${prop} ${duration}ms ${easing}`)
    .join(', ');
};

// Performance optimization - create style objects with will-change property
export const getOptimizedStyles = (
  properties: string[]
): React.CSSProperties => ({
  willChange: properties.join(', '),
}); 