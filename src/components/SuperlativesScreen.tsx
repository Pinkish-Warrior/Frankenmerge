import type { MergeEvent } from '../engine/state'

interface Superlative {
  title: string
  winner: string
  detail: string
}

function computeSuperlatives(history: MergeEvent[]): Superlative[] {
  if (history.length === 0) return []

  const results: Superlative[] = []

  // Fastest Merge — first event overall
  results.push({
    title: 'First to the Lab',
    winner: history[0].playerId,
    detail: `merged ${history[0].branch} first`,
  })

  // Most Prolific — most events by one player
  const counts: Record<string, number> = {}
  for (const e of history) counts[e.playerId] = (counts[e.playerId] ?? 0) + 1
  const topPlayer = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  if (topPlayer) {
    results.push({
      title: 'Most Prolific Surgeon',
      winner: topPlayer[0],
      detail: `performed ${topPlayer[1]} merge${topPlayer[1] !== 1 ? 's' : ''}`,
    })
  }

  // Conflict Resolver — first 'resolve' event
  const resolver = history.find(e => e.action === 'resolve')
  if (resolver) {
    results.push({
      title: 'Most Heroic Conflict Resolution',
      winner: resolver.playerId,
      detail: `resolved the ${resolver.branch} conflict`,
    })
  }

  // Master Rebaser — first 'rebase' event
  const rebaser = history.find(e => e.action === 'rebase')
  if (rebaser) {
    results.push({
      title: 'Master Rebaser',
      winner: rebaser.playerId,
      detail: `rebased ${rebaser.branch} onto the correct parent`,
    })
  }

  // Last Merge — for fun
  const last = history[history.length - 1]
  if (last && last.playerId !== history[0].playerId) {
    results.push({
      title: 'Final Stitch',
      winner: last.playerId,
      detail: `delivered the last piece — ${last.branch}`,
    })
  }

  return results
}

interface Props {
  mergeHistory: MergeEvent[]
  onReset: () => void
}

export function SuperlativesScreen({ mergeHistory, onReset }: Props) {
  const superlatives = computeSuperlatives(mergeHistory)

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.94)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100, gap: '1.5rem', padding: '2rem',
    }}>
      {/* alive header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.2rem', letterSpacing: '0.1em', color: '#00ff44', fontFamily: 'monospace', fontWeight: 'bold' }}>
          IT'S ALIVE!
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          <span style={{ animation: 'pulse 0.8s infinite' }}> ⚡</span>
        </div>
        <div style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.4rem' }}>
          All 12 parts correctly assembled. Topology validated.
        </div>
      </div>

      {/* superlatives grid */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1rem',
        justifyContent: 'center', maxWidth: 800,
      }}>
        {superlatives.map((s, i) => (
          <div key={i} style={{
            background: '#0a0a0a', border: '1px solid #222',
            borderRadius: 6, padding: '1rem 1.25rem',
            minWidth: 200, flex: '1 1 200px', maxWidth: 260,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.6rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
              {s.title}
            </div>
            <div style={{ fontSize: '1.1rem', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {s.winner}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#444' }}>
              {s.detail}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        style={{
          marginTop: '0.5rem', padding: '0.6rem 1.4rem',
          background: '#0a0a1a', border: '1px solid #4444aa',
          color: '#aaaaff', fontFamily: 'monospace', fontSize: '0.8rem',
          cursor: 'pointer', borderRadius: 4,
        }}
      >
        Play Again
      </button>
    </div>
  )
}
