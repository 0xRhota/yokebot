# YokeBotUI

YokeBotUI is a conversational workout tracking application that eliminates the friction traditionally associated with logging exercises. Using natural language processing, the app allows users to quickly record their workouts through a chat interface, similar to messaging a personal trainer.

## Features

- **Conversational Workout Logging**: Log your workouts using natural language
- **Smart Workout Recognition**: The app learns your routine over time
- **Adaptive Memory System**: Remembers your previous weights, sets, and reps
- **Visual Progress Tracking**: Track your progress with intuitive visualizations
- **AI-Powered Insights**: Get personalized recommendations based on your progress

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/yokebot-app.git
   cd yokebot-app
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **State Management**: React Context API, React Hooks
- **UI Components**: Radix UI, Framer Motion
- **Backend**: Supabase (PostgreSQL, Authentication)
- **AI/ML**: Natural language processing for workout parsing

## Project Structure

```
yokebot-app/
├── src/
│   ├── app/              # Next.js App Router
│   │   └── ...           # Feature components
│   ├── lib/              # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── ...                   # Config files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the need for a frictionless workout tracking experience
- Built with modern web technologies for optimal performance and user experience
