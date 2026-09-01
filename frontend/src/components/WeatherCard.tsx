import { useState, useEffect } from "react"
import { Cloud, CloudSun, Sun, Droplet, Wind, ChevronDown } from 'lucide-react'
import { fetchLiveWeather } from "../lib/weatherAPI"
import type { LiveWeather } from "../lib/weatherAPI"

interface Props {
  stationName: string
  latitude: number
  longitude: number
}

function ConditionIcon({ condition, size = 20 }: { condition: string; size?: number }) {
  const c = condition.toLowerCase()
  if (c.includes('sun') && !c.includes('partly')) return <Sun size={size} />
  if (c.includes('partly')) return <CloudSun size={size} />
  return <Cloud size={size} />
}

export function WeatherCard({ stationName, latitude, longitude }: Props) {
  const [data, setData] = useState<LiveWeather | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setError(null)

    console.log('WeatherCard received:', { latitude, longitude })
    
    fetchLiveWeather(latitude, longitude)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [latitude, longitude])

  if (error) {
    return <div className="weather-card">Couldn't load weather: {error}</div>
  }

  if (!data) {
    return <div className="weather-card">Loading weather…</div>
  }

  return (
    <div className="weather-card">
      <div className="weather-card-header">
        <div className="weather-card-title">
          <span>{stationName}</span>
          <ChevronDown size={16} />
        </div>
        <span className="weather-card-badge">Live</span>
      </div>

      <div className="weather-card-main">
        <ConditionIcon condition={data.condition} size={56} />
        <div className="weather-card-temp">
          <span className="temp-value">{data.currenttemp}</span>
          <span className="temp-unit">°F</span>
        </div>
      </div>
      <div className="weather-card-condition">{data.condition}</div>

      <div className="weather-card-stats">
        <div className="stat-item">
          <Droplet size={16} />
          <div>
            <div className="stat-value">{data.preicpation.toFixed(2)} in</div>
            <div className="stat-label">Precip</div>
          </div>
        </div>
        <div className="stat-item">
          <Wind size={16} />
          <div>
            <div className="stat-value">{data.windmph} mph</div>
            <div className="stat-label">Wind</div>
          </div>
        </div>
      </div>

      <div className="weather-card-divider" />

      <div className="weather-card-row">
        <span>Today</span>
        <span className="row-range">
          <ConditionIcon condition={data.condition} size={16} />
          {data.todaylow}°F — {data.todayshigh}°F
        </span>
      </div>

      <div className="weather-card-forecast-label">3-Day Forecast</div>

      {data.forecast.map((f) => (
        <div className="weather-card-row" key={f.day}>
          <span>{f.day}</span>
          <span className="row-range">
            <ConditionIcon condition={f.condition} size={16} />
            {f.low}°F — {f.high}°F
          </span>
        </div>
      ))}
    </div>
  )
}