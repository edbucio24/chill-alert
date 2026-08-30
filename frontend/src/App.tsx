import { useState } from 'react'
import { stations } from './mockData'

function App() {
  const [selectedId, setSelectedId] = useState(stations[0].id)

  return (
    <div style={{ padding: '40px' }}>
      <h1>Chill Alert</h1>

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        style={{
          padding: '10px 14px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: '#fff',
          color: 'var(--text-h)',
        }}
      >
        {stations.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} — {s.county} County
          </option>
        ))}
      </select>

      <p style={{ marginTop: '20px' }}>
        Selected station: <strong>{selectedId}</strong>
      </p>
    </div>
  )
}

export default App