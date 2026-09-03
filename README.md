# Chill Alert

A full-stack frost-risk monitoring dashboard for agricultural weather stations across Washington State. Chill Alert tracks live conditions, visualizes temperature trends, and flags when a station crosses into frost-risk territory — inspired by real ag-weather platforms like WSU's AgWeatherNet.

## Features

- **Live weather dashboard** — current temperature, condition, precipitation, wind, and a 3-day forecast for each station
- **Frost risk detection** — automatically classifies each station's current conditions as None / Watch / Warning / Critical based on distance from a configurable frost threshold
- **Interactive temperature chart** — 24 hours past + 24 hours forecast, with a visual "frost line" marking the danger threshold; switch between Temperature, Dew Point, Wind Speed, and Precipitation views
- **Historical logging** — a background job polls every station every 5 minutes and stores readings in a local SQLite database, building a real historical record over time (not just live snapshots)
- **Multi-station support** — covers five real Washington agricultural regions: Pullman, Prosser, Wenatchee, Mount Vernon, and Walla Walla

## Architecture
