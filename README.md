# KrishiMitra AI — Smart Agriculture Platform (Hackathon Demo)

A frontend demo of an AI-powered farming assistant: weather intelligence, crop
disease detection, an AI chat assistant (with simulated voice input), soil
analysis, and mandi (market) price predictions.

This is a **frontend-only** build using mock data so it runs instantly with
no API keys. See "Going further" below for wiring up real backends.

## Run it in VS Code

You need [Node.js](https://nodejs.org) (v18+) installed.

```bash
# 1. Open this folder in VS Code, then in the integrated terminal:
npm install

# 2. Start the dev server
npm run dev
```

This opens the app at **http://localhost:5173** and hot-reloads on save.

To build a production bundle:

```bash
npm run build
npm run preview
```

## Project structure

```
krishimitra-ai/
├── index.html            # Vite entry HTML
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx           # React root
│   ├── App.jsx            # All pages + components (single file for simplicity)
│   └── index.css          # Tailwind + fonts + small custom classes
└── README.md
```

## What's included

- **Landing page** — hero, live field readout panel, feature highlights
- **Overview dashboard** — weather/soil/price stats, charts, activity feed
- **Weather intelligence** — 7-day forecast with temperature & rainfall charts
- **Disease scan** — upload a leaf photo, see a simulated diagnosis (disease,
  confidence, symptoms, treatment, prevention)
- **AI Assistant** — chat UI with keyword-based Hindi/English replies and a
  simulated voice input button ("Krishi Voice")
- **Soil analysis** — sliders for N / P / K / moisture / pH, live health
  score and crop recommendations
- **Mandi prices** — current vs predicted prices table + 6-week trend chart
- **Alerts** — weather, pest, and price notification center
- **Profile** — farmer details and language preference

## Tech stack

- React 18 + Vite
- Tailwind CSS
- [Recharts](https://recharts.org) for charts
- [lucide-react](https://lucide.dev) for icons

## Going further (for a real deployment)

Everything here runs on mock/hardcoded data. To make it production-real:

1. **Weather** — swap `WEATHER_WEEK` in `App.jsx` for a call to the
   [OpenWeather API](https://openweathermap.org/api) or IMD data.
2. **Disease detection** — replace the random pick in `DiseasePage` with a
   call to Gemini Vision (or a fine-tuned vision model) that sends the
   uploaded image and returns a structured diagnosis.
3. **AI Assistant** — replace `replyFor()` with a real call to the Gemini
   API (or any LLM), and optionally use the Web Speech API
   (`SpeechRecognition`) for real voice input instead of the simulated
   "Listening…" state.
4. **Mandi prices** — connect to a real mandi price API (e.g. data.gov.in's
   Agmarknet dataset) instead of `MANDI_PRICES`.
5. **Backend** — add a Node.js/Express API layer with MongoDB to persist
   farmer profiles, scan history, and alerts, and to keep API keys off the
   client.

Each of these is a drop-in replacement — the UI components already expect
the same data shapes, so you mainly need to swap the data source.
