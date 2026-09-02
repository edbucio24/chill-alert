import { useState, useEffect } from 'react'
import { AlertTriangle, AlertCircle, XCircle, CheckCircle } from 'lucide-react'
import { fetchLiveWeather } from '../lib/weatherAPI'
import type { LiveWeather } from '../lib/weatherAPI'

interface Props {
  latitude: number
  longitude: number
}

const FROST_THRESHOLD_F = 32

type RiskLevel = 'none' | 'watch' | 'warning' | 'critical'

function getRiskLevel(currentTemp: number): RiskLevel {
  if (currentTemp <= FROST_THRESHOLD_F - 4) return 'critical'
  if (currentTemp <= FROST_THRESHOLD_F) return 'warning'
  if (currentTemp <= FROST_THRESHOLD_F + 4) return 'watch'
  return 'none'
}

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; Icon: typeof CheckCircle; message: string }> = {
  none: {
    label: 'No Risk',
    color: '#1a7f4e',
    bg: '#e6f7ee',
    Icon: CheckCircle,
    message: 'Temperature is well above the frost threshold.',
  },
  watch: {
    label: 'Frost Watch',
    color: '#9a6b00',
    bg: '#fff6e0',
    Icon: AlertCircle,
    message: 'Temperature is approaching the frost threshold. Monitor conditions.',
  },
  warning: {
    label: 'Frost Warning',
    color: '#b45309',
    bg: '#fff0e0',
    Icon: AlertTriangle,
    message: 'Temperature is at or below the frost threshold. Take protective action.',
  },
  critical: {
    label: 'Critical Freeze',
    color: '#b91c1c',
    bg: '#fde8e8',
    Icon: XCircle,
    message: 'Temperature is well below the frost threshold. Crop damage likely.',
  },
}

export function RiskBanner({ latitude, longitude }: Props) {
  const [data, setData] = useState<LiveWeather | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setError(null)

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

  if (error) return null
  if (!data) return <div className="risk-banner">Checking frost risk…</div>

  const level = getRiskLevel(data.currenttemp)
  const cfg = riskConfig[level]
  const Icon = cfg.Icon

  return (
    <div className="risk-banner" style={{ background: cfg.bg, borderColor: `${cfg.color}33` }}>
      <Icon size={28} color={cfg.color} />
      <div style={{ textAlign: 'left' }}>
        <div className="risk-banner-label" style={{ color: cfg.color }}>
          {cfg.label}
        </div>
        <div className="risk-banner-message">{cfg.message}</div>
      </div>
      <div className="risk-banner-stats">
        <div>
          <div className="risk-banner-value">{data.currenttemp}°F</div>
          <div className="risk-banner-sublabel">Current</div>
        </div>
        <div>
          <div className="risk-banner-value">{FROST_THRESHOLD_F}°F</div>
          <div className="risk-banner-sublabel">Threshold</div>
        </div>
      </div>
    </div>
  )
}