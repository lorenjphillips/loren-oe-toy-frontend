# Clinical Decision Support Components

This directory contains React components for the Clinical Decision Support feature in Phase 4 of the OpenEvidence platform.

## Purpose

These components provide healthcare professionals with evidence-based information and guidance to enhance their decision-making process when viewing pharmaceutical advertisements.

## Components

- **EvidenceViewer**: Displays clinical evidence relevant to the current context
- **GuidelineSummary**: Shows applicable clinical guidelines
- **TreatmentComparison**: Compares different treatment options
- **EvidenceQualityIndicator**: Visual indicator of evidence quality
- **ClinicalAlertBanner**: Displays important clinical alerts

## Implementation Plan

1. Basic evidence display components
2. Integration with ad content
3. Interactive treatment comparison
4. User feedback collection

## Usage

Components in this directory should:
- Follow TypeScript interfaces defined in `app/models/clinical-support.ts`
- Integrate with the clinical support services
- Use the shared UI components for consistent styling
- Include appropriate unit tests

## Future Enhancements

- Integration with voice commands
- Personalized evidence recommendations
- Patient case simulators 