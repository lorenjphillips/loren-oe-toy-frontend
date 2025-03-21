# Ethical AI Guardrail Components

This directory contains React components for the Ethical AI Guardrails feature in Phase 4 of the OpenEvidence platform.

## Purpose

These components enforce ethical guidelines for content delivery, detect potential biases, ensure balanced information presentation, and provide transparency in advertising to healthcare professionals.

## Components

- **EthicalGuardrailsBadge**: Visual indicator showing ethical compliance
- **ContentWarningOverlay**: Warning display for content that may require attention
- **TransparencyDisclosure**: Disclosure of funding sources and relationships
- **BiasIndicator**: Visual indicator of potential content bias
- **ContentBalanceReport**: Shows distribution of content across sources
- **UserPreferencesPanel**: Allows users to set ethical content preferences

## Implementation Plan

1. Basic guardrail indicator components
2. Warning system for potentially problematic content
3. User preference controls
4. Transparency reporting components

## Usage

Components in this directory should:
- Follow TypeScript interfaces defined in `app/models/ethical-ai.ts`
- Integrate with the ethical AI services
- Use the shared UI components for consistent styling
- Include appropriate unit tests

## Future Enhancements

- Interactive bias exploration tools
- Educational modules on recognizing bias
- User-controlled filtering system
- Personalized ethical preferences 