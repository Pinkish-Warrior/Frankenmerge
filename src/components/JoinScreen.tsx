// AI-assisted: drafted with AI tool, reviewed and modified by Tania Santana
import { useState } from 'react'

export type Mode = 'host' | 'player'

interface Props {
  onJoin: (roomId: string, playerName: string, mode: Mode) => void
}

export function JoinScreen({ onJoin }: Props) {
  const [room, setRoom] = useState('lab-001')
  const [name, setName] = useState('')

  function join(mode: Mode) {
    if (!name.trim()) return
    onJoin(room.trim() || 'lab-001', name.trim(), mode)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: '2rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>
          ⚡ FRANKENMERGE
        </h1>
        <p style={{ color: '#666', fontSize: '0.85rem' }}>a git workflow game</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 320 }}>
        <label style={labelStyle}>
          <span style={labelText}>Room code</span>
          <input
            value={room}
            onChange={e => setRoom(e.target.value)}
            style={inputStyle}
            placeholder="lab-001"
          />
        </label>

        <label style={labelStyle}>
          <span style={labelText}>Your name</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && join('player')}
            style={inputStyle}
            placeholder="e.g. alice"
            autoFocus
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button onClick={() => join('player')} style={playerBtn} disabled={!name.trim()}>
            Join as Player
          </button>
          <button onClick={() => join('host')} style={hostBtn} disabled={!name.trim()}>
            Host (Big Screen)
          </button>
        </div>
      </div>

      <p style={{ color: '#333', fontSize: '0.75rem', maxWidth: 320, textAlign: 'center' }}>
        Players merge branches on their device. The host screen shows the shared creature assembling in real time.
      </p>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '0.4rem',
}
const labelText: React.CSSProperties = {
  fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em',
}
const inputStyle: React.CSSProperties = {
  padding: '0.6rem 0.8rem',
  background: '#111', border: '1px solid #333', color: '#e8e8e8',
  fontFamily: 'monospace', fontSize: '0.9rem', borderRadius: 4, outline: 'none',
}
const playerBtn: React.CSSProperties = {
  padding: '0.75rem', background: '#0a1a2e', border: '1px solid #4a4aff',
  color: '#aaaaff', fontFamily: 'monospace', fontSize: '0.85rem',
  cursor: 'pointer', borderRadius: 4,
}
const hostBtn: React.CSSProperties = {
  padding: '0.75rem', background: '#1a0a0a', border: '1px solid #884444',
  color: '#ffaaaa', fontFamily: 'monospace', fontSize: '0.85rem',
  cursor: 'pointer', borderRadius: 4,
}
