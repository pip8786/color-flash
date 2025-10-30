# Color Flash Web App

A React TypeScript web application for flashing colors on screen with customizable settings.

**🌐 Live Demo:** [https://pip8786.github.io/color-flash/](https://pip8786.github.io/color-flash/)

## Features

- **Color Configuration**: Choose from predefined colors (Green, Blue, Yellow, Red, Purple, Pink, Orange, Cyan)
- **Timing Controls**:
  - Flash duration (how long each color shows)
  - Interval duration (pause between flashes, can be set to 0 for continuous flashing)
  - Session duration (finite or infinite sessions)
- **Full-Screen Experience**: 
  - Automatically enters fullscreen mode during flash sessions
  - Manual fullscreen toggle available during sessions
  - Colors fill the entire screen on all devices
- **Screen Wake Lock**: Prevents screen from dimming or locking during flash sessions (on supported devices)
- **Touch Controls**: Tap screen to reveal control buttons during flash sessions
- **URL Sharing**: Each configuration generates a unique shareable URL
- **Local Storage**: Automatically saves last 10 configurations for quick access
- **Settings Persistence**: Your last settings are automatically restored when returning to the app
- **Mobile-First Design**: Optimized for mobile with responsive layout

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- CSS for styling
- Local storage for persistence

## Getting Started

### Prerequisites

- Node.js (version 20.19.0+ or 22.12.0+)
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd color-flash
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/color-flash/`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for static hosting.

## Usage

1. **Configure Settings**:

   - Select desired colors from the predefined palette
   - Set flash duration (how long each color displays)
   - Set interval duration (pause between colors)
   - Choose session duration or set to infinite

2. **Start Session**: Click "Start Flash Session" to begin

3. **Full-Screen Mode**: The app automatically goes full-screen on mobile devices

4. **Controls**: Tap the screen to reveal control buttons:
   - **Exit button (✕)**: Return to settings
   - **Fullscreen button (⤢/⤓)**: Toggle fullscreen mode

5. **Screen Wake Lock**: The app automatically prevents your screen from dimming or locking during sessions

6. **History**: Recently used configurations are saved automatically and can be reloaded or started immediately

## Deployment

This app is configured for GitHub Pages deployment with the base path `/color-flash/`.

To deploy to GitHub Pages:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your GitHub Pages repository

## Configuration

Default colors and settings can be modified in `src/types.ts`:

```typescript
export const DEFAULT_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"];
export const DEFAULT_SETTINGS: ColorSettings = {
  colors: DEFAULT_COLORS,
  flashDuration: 1000,
  intervalDuration: 500,
  sessionDuration: null,
  isInfinite: true,
};
```

## Browser Support

- Modern browsers with ES2020 support
- Mobile Safari and Chrome
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## License

MIT License
