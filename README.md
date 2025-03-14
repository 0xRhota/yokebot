# YokeBot - Conversational Workout Tracking

YokeBot is a modern web application that allows users to track their workouts through natural conversation. It provides a chat interface for logging workouts, visualizing progress, and getting personalized recommendations.

## Features

- **Chat Interface**: Log your workouts through natural conversation with YokeBot
- **Workout Tracking**: Track your sets, reps, and weights with detailed history
- **Progress Analytics**: Visualize your progress with charts and analytics
- **No Login Required to Start**: Try the chat interface without creating an account
- **Seamless Authentication**: Login only when you're ready to save your workouts

## User Flow

1. **Landing Page**: Users can click "Start Chatting" to immediately use the chat interface without logging in
2. **Chat Interface**: Users can interact with YokeBot and log workouts
3. **Authentication**: When users try to save a workout, they're prompted to log in or sign up
4. **Dashboard**: After logging in, users can view their saved workouts and progress

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account for authentication and database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/yokebot.git
   cd yokebot/yokebot-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Testing

YokeBot includes a comprehensive test suite to ensure the application works correctly. The tests are written using Jest and React Testing Library.

### Running Tests

To run all tests:
```bash
npm test
```

To run tests in watch mode (useful during development):
```bash
npm run test:watch
```

To run tests with coverage report:
```bash
npm run test:ci
```

### Test Structure

- `src/__tests__/components/`: Tests for React components
- `src/__tests__/lib/`: Tests for utility functions and hooks
- `src/__tests__/pages/`: Tests for page components

## Deployment

YokeBot is configured for easy deployment to Vercel.

### Pre-Deployment Checks

Before deploying, you can run pre-deployment checks to ensure everything is working correctly:

```bash
npm run pre-deploy
```

This will:
1. Check if the required environment variables are set
2. Run linting to catch any code style issues
3. Run tests to ensure functionality is working
4. Build the application to check for build errors

### Deploying to Vercel

To deploy to Vercel:

```bash
npm run deploy
```

This will run the pre-deployment checks and then deploy the application to Vercel.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the need for a frictionless workout tracking experience
- Built with modern web technologies for optimal performance and user experience
