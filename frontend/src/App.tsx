import { useState } from 'react'
import { stations } from './mockData'
import { measurementOptions } from './types'
import type { Measurement } from './types'
import { WeatherCard } from './components/WeatherCard'
import './components/WeatherCard.css'
import { TempChart } from './components/TempChart'
import { RiskBanner } from './components/RiskBanner'

function App() {
  const [selectedId, setSelectedId] = useState(stations[0].id)
  const [measurement, setMeasurement] = useState<Measurement>('Temperature')

  const selected = stations.find((s) => s.id === selectedId)
  console.log('selected station:', selected)

  const selectStyle = {
    padding: '10px 14px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: '#fff',
    color: 'var(--text-h)',
  }

  return (
    <div
      style={{
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <h1>Chill Alert</h1>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={selectStyle}
        >
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.county} County
            </option>
          ))}
        </select>

        <select
          value={measurement}
          onChange={(e) => setMeasurement(e.target.value as Measurement)}
          style={selectStyle}
        >
          {measurementOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      {selected && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <RiskBanner stationId={selectedId} />
        </div>
      )}


      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
        {selected && (
          <>
          <WeatherCard
            stationName={selected.name}
            stationId={selectedId}
          />
          <TempChart
          latitude={selected.latitude}
          longitude={selected.longitude}
          measurement={measurement}
          />
          </>
        )}
      </div>
    </div>
  )
}

export default App