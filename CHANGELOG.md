# CHANGELOG

## v0.1.1 - User Flow Improvements (March 13, 2024)

### Added
- Chat route added as a public route in middleware to allow unauthenticated users to access the chat

### Changed
- Removed automatic redirect from landing page to chat page for authenticated users
- Modified "Sign Up" button on landing page to read "Login" for clarity
- Enhanced login/signup forms to allow easy switching between tabs
- Improved chat interface to handle unauthenticated users better by redirecting to login when trying to save workouts

### Fixed
- Fixed issue where "Start Chatting" button redirected to auth page instead of chat page in production

## v0.1.0 - Initial Development

### Added
- Project setup with Next.js and TypeScript
- Tailwind CSS for UI styling
- Chat interface with message bubbles
- Basic workout parsing
- Voice input capability
- Tab navigation
- Supabase authentication
- Database schema design
- LLM integration
- Core UI components (Button, Input, Avatar, etc.)
- Workout parser for natural language processing
- Theme support with light/dark mode
- Responsive design for mobile and desktop

## Format

Each version should include:
- Version number and title
- Date (when released)
- Changes grouped by: Added, Changed, Fixed, Removed 