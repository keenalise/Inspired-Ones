# Nepali Traditional Instruments

An interactive AI Studio app that explores and simulates Nepali traditional musical instruments. The project combines instrument identification, cultural context, and browser-based sound synthesis to create a digital showroom for the Madal, Bansuri, Nepali Sarangi, and Murchunga.

View the app in AI Studio: https://ai.studio/apps/97dbfb66-773c-4495-95f3-7b8025f793c6

## Overview

This project is a React + TypeScript + Vite application with a small Express server. It is designed to:

- Identify an instrument from an uploaded image using Gemini.
- Show detailed cultural and historical information about traditional Nepali instruments.
- Let users interact with browser-synthesized instrument models.
- Present each instrument in a polished, dark-themed UI inspired by a museum exhibit or digital gallery.

The app focuses on four playable instruments:

- Madal
- Bansuri
- Nepali Sarangi
- Murchunga

## Features

- AI-powered image identification for traditional instruments.
- Rich instrument profiles with names, local names, history, facts, and playing guidance.
- Interactive playback modules for each instrument.
- Web Audio API synthesis for real-time sound generation in the browser.
- Tab-based switching between instrument workbenches.
- Sample image loading for quick demonstrations.
- Responsive layout built with Tailwind CSS.

## How It Works

The app has two main parts:

1. A front-end experience built with React.
2. A Node/Express server that exposes an `/api/identify` endpoint for Gemini-based image analysis.

When a user uploads or captures an image, the server sends it to Gemini with a structured prompt. The response is parsed into a consistent instrument metadata object. If the instrument matches one of the four core playable instruments, the interface switches to that tab automatically.

Each instrument also has its own interactive component that connects to a shared audio helper:

- [src/components/PlayMadal.tsx](src/components/PlayMadal.tsx)
- [src/components/PlayBansuri.tsx](src/components/PlayBansuri.tsx)
- [src/components/PlaySarangi.tsx](src/components/PlaySarangi.tsx)
- [src/components/PlayMurchunga.tsx](src/components/PlayMurchunga.tsx)

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Express
- Gemini API via `@google/genai`
- Web Audio API
- Lucide React icons
- Motion for animation support

## Project Structure

```text
.
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   ├── components/
│   │   ├── AIIdentifier.tsx
│   │   ├── Navigation.tsx
│   │   ├── PlayBansuri.tsx
│   │   ├── PlayMadal.tsx
│   │   ├── PlayMurchunga.tsx
│   │   ├── PlaySarangi.tsx
│   │   └── sampleImages.ts
│   ├── data/
│   │   └── presets.ts
│   └── utils/
│       └── audioHelper.ts
└── README.md
```

## Setup

### Prerequisites

- Node.js
- A Gemini API key

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file in the project root and add:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

The app uses this key in `server.ts` to call Gemini for instrument identification.

## Run Locally

Start the development server with:

```bash
npm run dev
```

The app starts an Express server on port `3000` and serves the Vite app through that server in development.

## Build For Production

```bash
npm run build
```

This command builds the client with Vite and bundles `server.ts` into `dist/server.cjs`.

## Start Production Server

After building:

```bash
npm start
```

## Available Scripts

- `npm run dev` - start the development server.
- `npm run build` - create a production build.
- `npm start` - run the production server from `dist/server.cjs`.
- `npm run lint` - type-check the project with `tsc --noEmit`.
- `npm run clean` - remove the `dist` folder.

## Using The App

### 1. Identify An Instrument

Use the AI identification panel to upload or provide an image. The app sends the image to the `/api/identify` endpoint, which asks Gemini to classify the instrument and return structured metadata.

### 2. Explore The Instrument Details

After identification, the app shows:

- instrument name
- local name
- category
- short description
- historical context
- cultural and acoustic facts
- playing guidance

If no AI result is selected, the app shows the preset catalog for the currently active instrument tab.

### 3. Play The Instrument

Choose one of the four instrument tabs:

- Madal
- Bansuri
- Nepali Sarangi
- Murchunga

Each tab opens a dedicated interactive player that uses synthesized audio behavior designed to resemble the instrument’s playing style.

## Instrument Notes

### Madal

The Madal is the app’s drum instrument. It focuses on rhythmic tapping and dual-surface drum interactions.

### Bansuri

The Bansuri module models breath-based flute playing and pitch changes through finger-hole style interaction.

### Nepali Sarangi

The Sarangi module represents a bowed string instrument and focuses on sliding, bowing, and expressive frequency control.

### Murchunga

The Murchunga module simulates a jaw harp style instrument using a plucked resonant sound and mouth-shaping controls.

## Environment Variables

- `GEMINI_API_KEY` - required for image-based instrument identification.

If this variable is missing, the app can still load, but identification requests will fail until the key is provided.

## Troubleshooting

- If the app fails to identify instruments, confirm that `GEMINI_API_KEY` is present in `.env.local`.
- If audio does not start, click the audio initialization button first and make sure the browser allows sound playback.
- If image analysis fails with a large upload, check that the payload is valid base64 and that the file is not too large.
- If the production server does not serve the app correctly, rebuild with `npm run build` before running `npm start`.

## Notes On Content

The app is educational and cultural in tone. It presents traditional Nepali instruments with descriptive metadata, but it should still be treated as a digital simulation rather than a physical instrument reference.

## Future Improvements

- Add more Nepali instruments.
- Improve the realism of the synthesized audio models.
- Add screenshots or a walkthrough GIF.
- Expand the cultural notes and citations for each instrument.

## License

Add a license here if you want to publish the project publicly.
