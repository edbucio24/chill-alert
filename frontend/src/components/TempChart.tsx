import { useState, useEffect } from "react";
import{
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer
} from 'recharts'
import { fetchHourlyData } from "../lib/weatherAPI";
import type { HourlyPoint } from "../lib/weatherAPI";
import type { Measurement } from "../types";

interface Props{
    latitude: number
    longitude:number
    measurement:Measurement
}

const FROST = 32

const metricConfig: Record<Measurement, {key: keyof HourlyPoint; unit:string;label:string}>={
  Temperature: { key: 'temperature', unit: '°F', label: 'Temperature' },
  'Dew Point': { key: 'dewPoint', unit: '°F', label: 'Dew Point' },
  'Wind Speed': { key: 'windSpeed', unit: 'mph', label: 'Wind Speed' },
  Precipitation: { key: 'precipitation', unit: 'in', label: 'Precipitation' },
}

function formatTime(iso:string){
    const date = new Date(iso)
    return date.toLocaleDateString([], {hour:'numeric'})
}

export function TempChart({latitude,longitude,measurement}:Props){
const [hourly, setHourly] = useState<HourlyPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setHourly(null)
    setError(null)

    fetchHourlyData(latitude, longitude)
      .then((result) => {
        if (!cancelled) setHourly(result)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [latitude, longitude])

  if (error) return <div className="chart-panel">Couldn't load chart data: {error}</div>
  if (!hourly) return <div className="chart-panel">Loading chart…</div>

  const config = metricConfig[measurement]
  const data = hourly.map((h) => ({
    time: formatTime(h.time),
    value: Math.round((h[config.key] as number) * 10) / 10,
  }))

  return (
    <div className="chart-panel">
      <h3 className="chart-title">{config.label} — last 24h / next 24h</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#aa3bff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#aa3bff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 5" stroke="#e5e4e7" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={30} />
          <YAxis tick={{ fontSize: 11 }} width={40} tickFormatter={(v) => `${v}`} />
            <Tooltip formatter={(v) => [`${v}${config.unit}`, config.label]} />          {measurement === 'Temperature' && (
            <ReferenceLine
              y={FROST}
              stroke="#3b9cd9"
              strokeDasharray="4 4"
              label={{ value: `Frost line ${FROST}°F`, fontSize: 11, fill: '#3b9cd9', position: 'insideTopRight' }}
            />
          )}
          <Area type="monotone" dataKey="value" stroke="#aa3bff" strokeWidth={2} fill="url(#chartFill)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}