import { useState } from 'react'
import { stations } from './mockData'
import { measurementOptions } from './types'
import type { Measurement } from './types'

function App() {
  const [selectedId, setSelectedId] = useState(stations[0].id)
  const [measurement, setMeasurement] = useState<Measurement>('Temperature')

  const selectStyle = {
    padding: '10px 14px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: '#fff',
    color: 'var(--text-h)',
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>Chill Alert</h1>

      <div style={{ display: 'flex', gap: '12px' }}>
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

      <p style={{ marginTop: '20px' }}>
        Selected: <strong>{selectedId}</strong> — <strong>{measurement}</strong>
      </p>
    </div>
  )
}

export default App