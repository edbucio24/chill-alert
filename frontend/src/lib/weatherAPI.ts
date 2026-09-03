export interface ForecastDay {
  day: string
  condition: string
  low: number
  high: number
}

export interface LiveWeather {
  stationId: string
  currentTemp: number
  condition: string
  precip: number
  wind: number
  todayLow: number
  todayHigh: number
  riskLevel: 'none' | 'watch' | 'warning' | 'critical'
  threshold: number
  forecast: ForecastDay[]
}

export async function fetchLiveWeather(stationId: string): Promise<LiveWeather> {
  const res = await fetch(`/api/stations/${stationId}/weather`)
  if (!res.ok) {
    throw new Error(`Weather API Error: ${res.status}`)
  }
  return res.json()
}

export interface HourlyPoint {
  time: string
  temperature: number
  dewPoint: number
  windSpeed: number
  precipitation: number
}

export async function fetchHourlyData(stationId: string): Promise<HourlyPoint[]> {
  const res = await fetch(`/api/stations/${stationId}/hourly`)
  if (!res.ok) {
    throw new Error(`Hourly weather API error: ${res.status}`)
  }
  return res.json()
}
