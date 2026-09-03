# Chill Alert

A full-stack frost-risk monitoring dashboard for agricultural weather stations across Washington State. Chill Alert tracks live conditions, visualizes temperature trends, and flags when a station crosses into frost-risk territory — inspired by real ag-weather platforms like WSU's AgWeatherNet.

<img width="1167" height="893" alt="Screenshot 2026-09-03 at 12 12 37 PM" src="https://github.com/user-attachments/assets/d0059bf9-f397-475b-b479-b50aa4691bd0" />


## Features

- **Live weather dashboard** — current temperature, condition, precipitation, wind, and a 3-day forecast for each station
- **Frost risk detection** — automatically classifies each station's current conditions as None / Watch / Warning / Critical based on distance from a configurable frost threshold
- **Interactive temperature chart** — 24 hours past + 24 hours forecast, with a visual "frost line" marking the danger threshold; switch between Temperature, Dew Point, Wind Speed, and Precipitation views
- **Historical logging** — a background job polls every station every 5 minutes and stores readings in a local SQLite database, building a real historical record over time (not just live snapshots)
- **Multi-station support** — covers five real Washington agricultural regions: Pullman, Prosser, Wenatchee, Mount Vernon, and Walla Walla

## Architecture
```
┌──────────────────┐         ┌───────────────────┐         ┌────────────────┐
│                  │         │                    │         │                │
│  React Frontend  │  HTTP   │   Go / Gin Backend │  HTTP   │  Open-Meteo    │
│  (Vite + TS)     │ ──────> │                    │ ──────> │  Weather API   │
│                  │ <────── │                    │ <────── │                │
│                  │  JSON   │                    │  JSON   │                │
└──────────────────┘         └─────────┬──────────┘         └────────────────┘
                                        │
                                        │ background poller
                                        │ writes every 5 min
                                        ▼
                              ┌───────────────────┐
                              │   SQLite Database  │
                              │   (readings log)   │
                              └───────────────────┘
```


The frontend never talks to Open-Meteo directly — every live data request goes through the Go backend, which fetches from Open-Meteo, computes frost risk, and returns a clean response. A background goroutine independently polls all stations every 5 minutes and logs readings to SQLite, building a historical dataset over time.

### Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Recharts (data visualization)
- Lucide React (icons)

**Backend**
- Go
- Gin (HTTP routing)
- SQLite via `modernc.org/sqlite` (pure Go, no CGO required)

**External API**
- [Open-Meteo](https://open-meteo.com/) — free, no API key required, used for current/hourly/forecast weather data

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ping` | Health check |
| GET | `/api/stations` | List all monitored stations |
| GET | `/api/stations/:id/weather` | Current conditions, frost risk, and 3-day forecast for a station |
| GET | `/api/stations/:id/hourly` | Hourly temperature/dew point/wind/precipitation, past 24h + next 24h |
| GET | `/api/stations/:id/history?hours=24` | Logged historical readings from the local database |

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [Go](https://go.dev/) 1.22+

### 1. Clone the repo
```bash
git clone https://github.com/edbucio24/chill-alert.git
cd chill-alert
```

### 2. Start the backend
```bash
cd backend
go run .
```
This starts the Go server on `http://localhost:8080`, initializes the SQLite database (`chillalert.db`), and starts the background poller. Keep this terminal running.

### 3. Start the frontend
In a **new terminal tab**:
```bash
cd frontend
npm install
npm run dev
```
This starts the Vite dev server, usually at `http://localhost:5173`. Requests to `/api/*` are automatically proxied to the Go backend (see `vite.config.ts`).

### 4. Open the app
Visit `http://localhost:5173` in your browser. Pick a station and measurement from the dropdowns to see live data.

> Both the frontend and backend need to be running simultaneously during local development.

## Project Structure

```
chill-alert/
├── frontend/                    # React + TypeScript + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── WeatherCard.tsx      # Current conditions + 3-day forecast card
│   │   │   ├── WeatherCard.css
│   │   │   ├── TempChart.tsx        # Hourly trend chart with frost line
│   │   │   └── RiskBanner.tsx       # Frost risk status banner
│   │   ├── lib/
│   │   │   └── weatherAPI.ts        # API client — calls the Go backend
│   │   ├── App.tsx                  # Main app layout, station/measurement state
│   │   ├── main.tsx                 # React entry point
│   │   ├── mockData.ts              # Static station metadata (id, name, coords)
│   │   ├── types.ts                 # Shared TypeScript types
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts               # Includes /api proxy to backend
│
├── backend/                     # Go + Gin API server
│   ├── main.go                      # Server setup, routes
│   ├── stations.go                  # Station definitions, lookup helper
│   ├── weather.go                   # Open-Meteo integration, risk logic
│   ├── db.go                        # SQLite setup, reading storage/queries
│   ├── poller.go                    # Background job that logs readings
│   ├── dateutil.go                  # Date parsing helper
│   ├── go.mod
│   └── chillalert.db                # SQLite database (created on first run)
│
└── README.md
```

## How Frost Risk Is Calculated

Each station has a frost threshold (default: 32°F). The backend classifies current conditions as:

| Level | Condition |
|-------|-----------|
| **None** | Current temp is more than 4°F above threshold |
| **Watch** | Current temp is within 4°F above threshold |
| **Warning** | Current temp is at or below threshold |
| **Critical** | Current temp is 4°F or more below threshold |


