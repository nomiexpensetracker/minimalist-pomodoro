# Minimalist Pomodoro

A clean, distraction-free Pomodoro timer with ambient soundscapes and motivational quotes. Built with React, TypeScript, and Tailwind CSS — deployed on Vercel.

## Features

- **4 Pomodoro presets** — The Classic (25/5), The Dash (15/5), The Remix (45/15), The Deep Dive (50/10)
- **Automatic phase transitions** — work session flows into rest session seamlessly
- **Ambient soundscapes** — Rain, Restaurant, and Nature (Web Audio API with graceful fade-out)
- **Live sound swapping** — change ambience mid-session without interruption
- **Motivational quotes** — fetched from ZenQuotes via a serverless proxy
- **Dark / light mode** — toggle with a single click
- **Vercel Analytics & Speed Insights** — built-in performance monitoring

---

## Installation

**Prerequisites:** Node.js ≥ 20, pnpm

```bash
# Clone the repository
git clone <your-repo-url>
cd minimalist-pomodoro

# Install dependencies
pnpm install
```

---

## Usage

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Build for production
pnpm build

# Preview the production build locally
pnpm preview
```

### Deploying to Vercel

The project is configured for zero-config Vercel deployment. The `api/quote.ts` serverless function is picked up automatically.

```bash
vercel deploy
```

---

## Configuration

### Timer Presets

Presets are defined in [`src/types.ts`](src/types.ts). Each preset specifies a label, work duration, and rest duration in minutes:

```ts
export const PRESETS: Preset[] = [
  { label: 'The Classic (25m work + 5m rest)',    workMinutes: 25, restMinutes: 5  },
  { label: 'The Dash (15m work + 5m rest)',        workMinutes: 15, restMinutes: 5  },
  { label: 'The Remix (45m work + 15m rest)',      workMinutes: 45, restMinutes: 15 },
  { label: 'The Deep Dive (50m work + 10m rest)', workMinutes: 50, restMinutes: 10 },
]
```

### Ambient Sounds

Sound options are defined in [`src/useAudio.ts`](src/useAudio.ts). Each entry maps to an audio file in `public/audio/`:

| ID           | Label      | File                           |
|--------------|------------|--------------------------------|
| `rain`       | Rain       | `public/audio/rain-ambience.mp3`        |
| `restaurant` | Restaurant | `public/audio/restaurant-ambience.mp3`  |
| `nature`      | Nature      | `public/audio/beach-ambience.mp3`       |

To add a new sound, place the `.mp3` in `public/audio/` and add an entry to the `SOUND_OPTIONS` array.

### Quote API Proxy

In development, Vite proxies `/api/quote` to `https://zenquotes.io/api/random` via [`vite.config.ts`](vite.config.ts). In production, the [`api/quote.ts`](api/quote.ts) Vercel serverless function handles the request server-side, avoiding CORS restrictions.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please keep PRs focused — one feature or fix per PR.

---

## License

This project is open source and available under the [MIT License](LICENSE).
