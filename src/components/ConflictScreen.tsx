// AI-assisted: drafted with AI tool, reviewed and modified by Tania Santana
import type { PartId } from '../engine/tree'

// Simulated conflict content for each conflicted part
const CONFLICT_CONTENT: Record<string, { ours: string; theirs: string }> = {
  'left-hand': {
    ours:   'A large, bolt-studded hand\nwith an extra stitched knuckle\nand green-tinted skin',
    theirs: 'A clawed hand with cracked\ngrey nails and exposed tendons\nwrapped in copper wire',
  },
  'right-hand': {
    ours:   'A nimble hand, mismatched fingers\ntriple-stitched at the wrist\nwith a visible pulse',
    theirs: 'A massive hand, green-veined\nwith a rusty staple at the thumb\nand one extra knuckle',
  },
}

interface Props {
  conflicts: PartId[]
  onResolve: (branch: PartId) => void
}

export function ConflictScreen({ conflicts, onResolve }: Props) {
  if (conflicts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100, gap: '1.5rem',
      padding: '2rem',
    }}>
      <div style={{ color: '#ff4444', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        ⚡ Merge Conflict Detected
      </div>
      <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#fff' }}>
        Resolve together before continuing
      </h2>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 860 }}>
        {conflicts.map(branch => {
          const content = CONFLICT_CONTENT[branch] ?? { ours: '???', theirs: '???' }
          return (
            <div key={branch} style={{
              background: '#0d0d0d', border: '1px solid #ff4444',
              borderRadius: 6, padding: '1.25rem', flex: '1 1 360px', maxWidth: 420,
            }}>
              <div style={{ fontSize: '0.7rem', color: '#ff6666', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
                CONFLICT — {branch}
              </div>

              {/* conflict markers */}
              <pre style={{
                fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: 1.7,
                background: '#080808', padding: '0.8rem', borderRadius: 4,
                margin: 0, whiteSpace: 'pre-wrap',
              }}>
                <span style={{ color: '#4caf50' }}>{'<<<<<<< HEAD (ours)\n'}</span>
                <span style={{ color: '#ccc' }}>{content.ours + '\n'}</span>
                <span style={{ color: '#888' }}>{'=======\n'}</span>
                <span style={{ color: '#ff9800' }}>{content.theirs + '\n'}</span>
                <span style={{ color: '#4caf50' }}>{`>>>>>>> ${branch} (theirs)`}</span>
              </pre>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={() => onResolve(branch)}
                  style={{
                    flex: 1, padding: '0.55rem', background: '#0a1a0a',
                    border: '1px solid #2d6a2d', color: '#4caf50',
                    fontFamily: 'monospace', fontSize: '0.78rem', cursor: 'pointer', borderRadius: 4,
                  }}
                >
                  ✓ Accept Ours
                </button>
                <button
                  onClick={() => onResolve(branch)}
                  style={{
                    flex: 1, padding: '0.55rem', background: '#1a0f00',
                    border: '1px solid #6a4a00', color: '#ff9800',
                    fontFamily: 'monospace', fontSize: '0.78rem', cursor: 'pointer', borderRadius: 4,
                  }}
                >
                  ✓ Accept Theirs
                </button>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#444', marginTop: '0.5rem', textAlign: 'center' }}>
                Both choices produce a valid merge — decide together which hand you want.
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
