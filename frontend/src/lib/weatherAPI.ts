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
}

export async function fetchLiveWeather(stationId: string): Promise<LiveWeather> {
  console.log('Fetching weather for stationId:', stationId)
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

export async function fetchHourlyData(latitude: number, longitude: number): Promise<HourlyPoint[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,dew_point_2m,wind_speed_10m,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&past_days=1&forecast_days=1`

  console.log('Fetching hourly data:', url)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Hourly weather API error: ${res.status}`)
  }
  const json = await res.json()

  return json.hourly.time.map((t: string, i: number) => ({
    time: t,
    temperature: json.hourly.temperature_2m[i],
    dewPoint: json.hourly.dew_point_2m[i],
    windSpeed: json.hourly.wind_speed_10m[i],
    precipitation: json.hourly.precipitation[i],
  }))
}