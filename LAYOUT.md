# OpenEvidence Frontend Layout Documentation

## Overview

This document provides an in-depth explanation of the frontend architecture for the OpenEvidence application. The frontend is built using Next.js with TypeScript and integrates with OpenAI's API for question answering functionality.

## Tech Stack

### Core Technologies

- **Next.js** (v14.2.5): React framework with server-side rendering capabilities
- **TypeScript** (v5+): Provides static typing for better code quality and developer experience
- **React** (v18+): UI library for component-based development
- **Material UI** (v5.16.7): UI component library with pre-styled components
- **Axios** (v1.7.4): HTTP client for API requests
- **OpenAI SDK** (v4.55.7): For interacting with OpenAI's API

### Development Dependencies

- ESLint for code linting
- TypeScript configuration for type checking
- Next.js specific configurations

## Project Structure

```
├── app/                     # Next.js app directory (App Router)
│   ├── api/                 # API routes directory (implied)
│   │   └── ask/            # Endpoint for question answering (implied)
│   ├── components/         # Reusable React components (implied)
│   ├── globals.css         # Global CSS styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main page component (home page)
├── public/                 # Static assets (implied)
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore file
├── next.config.mjs        # Next.js configuration
├── package.json           # Project dependencies and scripts
├── README.md              # Project documentation
└── tsconfig.json          # TypeScript configuration
```

## Component Architecture

### Root Layout (`app/layout.tsx`)

The root layout defines the base HTML structure and includes:
- Font configuration using Google Fonts (Roboto and Open Sans)
- Metadata for the application (title, description)
- The root HTML structure where all page components are rendered

### Main Page (`app/page.tsx`)

The main page is a client-side component that implements:
- A question-answering interface
- Chat history display
- State management for questions, answers, and loading states
- API integration with the backend

Key features:
- Chat-like interface for question and answer display
- Form for submitting questions
- Loading indicators
- Conversation history management
- Auto-scrolling to the latest message

## State Management

The application uses React's useState hooks for local state management:
- `question`: Stores the current user input
- `history`: Maintains the conversation history as an array of message objects
- `answer`: Stores the latest AI response
- `loading`: Tracks the loading state during API calls

## API Integration

The frontend makes POST requests to `/api/ask` endpoint with:
- The current question
- The conversation history

Expected request format:
```typescript
{
  question: string;
  history: Array<{ role: string; content: string }>;
}
```

Expected response format:
```typescript
{
  answer: string;
}
```

## Styling

The application uses a combination of:
- Material UI components
- Styled components using `@mui/system`
- Global CSS for base styling
- Google Fonts (Roboto for primary text, Open Sans for content)

## Authentication

The current implementation does not include authentication. The backend implementation will need to consider:
- User authentication mechanism if required
- API key handling for OpenAI (currently expected as an environment variable)

## Environment Variables

The application requires:
- `OPENAI_API_KEY`: API key for OpenAI services

## Backend Requirements

To implement a compatible backend, the following endpoints should be created:

1. **POST /api/ask**
   - Accepts: `{ question: string, history: Array<{ role: string, content: string }> }`
   - Returns: `{ answer: string }`
   - Should handle passing the conversation to OpenAI and returning the response

## Deployment Considerations

- The application is configured for Next.js deployment
- Environment variables need to be properly set in the deployment environment
- OpenAI API key security should be maintained

## Future Improvements

Potential areas for enhancement:
- User authentication and personalization
- Persistent storage for conversation history
- Enhanced error handling
- Streaming responses from OpenAI
- Additional UI features like message formatting, attachments, etc.

## Development Workflow

To run the application locally:
```bash
OPENAI_API_KEY=YOUR_API_KEY npm run dev
```

The development server will start at http://localhost:3000. 