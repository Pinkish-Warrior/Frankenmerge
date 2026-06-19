import { useState } from 'react'
import { JoinScreen, type Mode } from './components/JoinScreen'
import { CreatureView } from './components/CreatureView'
import { GraphView } from './components/GraphView'
import { ConflictScreen } from './components/ConflictScreen'
import { SuperlativesScreen } from './components/SuperlativesScreen'
import { useGameRoom } from './hooks/useGameRoom'
import { canMerge, CONFLICT_PARTS, REBASE_PARTS } from './engine/state'
import { PARTS, partsForRound, type PartId } from './engine/tree'

interface Session {
  roomId: string
  playerId: string
  mode: Mode
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  if (!session) {
    return (
      <JoinScreen onJoin={(roomId, playerName, mode) =>
        setSession({ roomId, playerId: playerName, mode })
      } />
    )
  }

  return session.mode === 'host'
    ? <HostView session={session} onLeave={() => setSession(null)} />
    : <PlayerView session={session} onLeave={() => setSession(null)} />
}

// ── HOST VIEW ──────────────────────────────────────────────────────────────
function HostView({ session, onLeave }: { session: Session; onLeave: () => void }) {
  const { state, nextRound, reset, triggerChaos } = useGameRoom(session.roomId, session.playerId)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100vh' }}>
      {/* Left: creature */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem', borderRight: '1px solid #1a1a1a' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>⚡ FRANKENMERGE</h1>
            <p style={{ color: '#555', fontSize: '0.7rem' }}>Room: {session.roomId} · Round {state.currentRound}/5</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {state.currentRound === 5 && !state.chaosTriggered && (
              <button onClick={triggerChaos} style={smallBtn('#1a0a00', '#884400', '#ffaa44')}>
                ⚡ Trigger Chaos
              </button>
            )}
            {state.currentRound === 5 && state.chaosTriggered && (
              <span style={{ fontSize: '0.65rem', color: '#ff9800', padding: '0.35rem 0.5rem', border: '1px solid #663300', borderRadius: 4 }}>
                ⚠ Chaos active
              </span>
            )}
            <button onClick={nextRound} style={smallBtn('#0a0a2a', '#4444aa', '#aaaaff')}>Next Round →</button>
            <button onClick={reset} style={smallBtn('#1a0a0a', '#661111', '#ff8888')}>Reset</button>
            <button onClick={onLeave} style={smallBtn('#111', '#333', '#666')}>Leave</button>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <CreatureView merged={state.merged} isAlive={state.isAlive} />
        </div>

        <RoundCard round={state.currentRound} chaosActive={state.chaosTriggered} />
      </div>

      {/* Right: git graph */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Git graph — main
        </h2>
        <GraphView merged={state.merged} mergeHistory={state.mergeHistory} />
      </div>

      {/* Overlays */}
      {state.conflicts.length > 0 && (
        <ConflictScreen conflicts={state.conflicts} onResolve={() => {}} />
      )}
      {state.isAlive && (
        <SuperlativesScreen mergeHistory={state.mergeHistory} onReset={reset} />
      )}
    </div>
  )
}

// ── PLAYER VIEW ────────────────────────────────────────────────────────────
function PlayerView({ session, onLeave }: { session: Session; onLeave: () => void }) {
  const { state, merge, startConflict, resolveConflict, rebase } = useGameRoom(session.roomId, session.playerId)
  const [log, setLog] = useState<Array<{ text: string; ok: boolean }>>([])

  function handleAction(part: PartId) {
    const isConflictPart = CONFLICT_PARTS.includes(part)
    const isRebasePart = REBASE_PARTS.includes(part)
    const ok = canMerge(part, state.merged)

    if (!ok) {
      const parent = PARTS.find(p => p.id === part)?.parent ?? '?'
      addLog(`[rejected] git merge ${part} — merge ${parent} first`, false)
      return
    }

    if (isConflictPart) {
      // Already in conflict state — shouldn't reach here (button disabled)
      if (state.conflicts.includes(part)) return
      addLog(`$ git merge ${part}  ← conflict!`, true)
      startConflict(part)
    } else if (isRebasePart && state.chaosTriggered) {
      const parent = PARTS.find(p => p.id === part)?.parent ?? '?'
      addLog(`$ git rebase --onto ${parent} main ${part}`, true)
      rebase(part)
    } else {
      addLog(`$ git merge ${part}`, true)
      merge(part)
    }
  }

  function handleResolve(branch: PartId) {
    addLog(`$ git add . && git commit  ← conflict resolved in ${branch}`, true)
    resolveConflict(branch)
  }

  function addLog(text: string, ok: boolean) {
    setLog(l => [{ text, ok }, ...l.slice(0, 19)])
  }

  const roundParts = partsForRound(state.currentRound)

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100vh', padding: '1.25rem', gap: '1rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>⚡ FRANKENMERGE</h1>
          <p style={{ color: '#555', fontSize: '0.7rem' }}>
            {session.roomId} · {session.playerId} · Round {state.currentRound}/5
          </p>
        </div>
        <button onClick={onLeave} style={smallBtn('#111', '#333', '#666')}>Leave</button>
      </header>

      {/* Main: creature (small) + commands */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <CreatureView merged={state.merged} isAlive={state.isAlive} />
          <RoundCard round={state.currentRound} compact chaosActive={state.chaosTriggered} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <section>
            <h2 style={sectionLabel}>Round {state.currentRound} — branches</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {roundParts.map(part => {
                const isMerged = state.merged.includes(part.id)
                const inConflict = state.conflicts.includes(part.id)
                const allowed = canMerge(part.id, state.merged)
                const isRebase = REBASE_PARTS.includes(part.id) && state.chaosTriggered
                const waitingForChaos = REBASE_PARTS.includes(part.id) && !state.chaosTriggered

                let label: string
                let borderColor: string
                let color: string
                let bg: string
                let cursor: string

                if (isMerged) {
                  label = `✓ git ${inConflict ? 'merge' : isRebase ? 'rebase' : 'merge'} ${part.id}`
                  bg = '#0d200d'; borderColor = '#2d6a2d'; color = '#4caf50'; cursor = 'default'
                } else if (inConflict) {
                  label = `⚡ CONFLICT — ${part.id} (resolving...)`
                  bg = '#1a0500'; borderColor = '#ff4444'; color = '#ff6666'; cursor = 'default'
                } else if (waitingForChaos) {
                  label = `○ git rebase ${part.id}  (waiting for chaos event)`
                  bg = '#111'; borderColor = '#333'; color = '#444'; cursor = 'not-allowed'
                } else if (isRebase) {
                  label = `▶ git rebase --onto ${PARTS.find(p => p.id === part.id)?.parent} main ${part.id}`
                  bg = allowed ? '#1a0f00' : '#111'
                  borderColor = allowed ? '#884400' : '#333'
                  color = allowed ? '#ff9800' : '#444'
                  cursor = allowed ? 'pointer' : 'not-allowed'
                } else {
                  label = `${allowed ? '▶' : '○'} git merge ${part.id}`
                  bg = allowed ? '#0a0a22' : '#111'
                  borderColor = allowed ? '#4444cc' : '#222'
                  color = allowed ? '#8888ff' : '#444'
                  cursor = allowed ? 'pointer' : 'not-allowed'
                }

                return (
                  <button
                    key={part.id}
                    onClick={() => !isMerged && !inConflict && !waitingForChaos && handleAction(part.id)}
                    disabled={isMerged || inConflict || waitingForChaos || (!allowed && !isRebase)}
                    style={{
                      padding: '0.55rem 0.9rem', background: bg,
                      border: `1px solid ${borderColor}`, color,
                      cursor, fontFamily: 'monospace', fontSize: '0.82rem',
                      textAlign: 'left', borderRadius: 4,
                    }}
                  >
                    {label}
                    {!allowed && !isMerged && !inConflict && !waitingForChaos && (
                      <span style={{ float: 'right', fontSize: '0.7rem', color: '#444' }}>
                        needs: {part.parent}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <section style={{ flex: 1, minHeight: 0 }}>
            <h2 style={sectionLabel}>Command log</h2>
            <div style={{
              background: '#080808', border: '1px solid #1a1a1a', borderRadius: 4,
              padding: '0.6rem 0.8rem', height: '100%', overflowY: 'auto',
              fontSize: '0.75rem', lineHeight: 1.7,
            }}>
              {log.length === 0 && <span style={{ color: '#333' }}>awaiting commands...</span>}
              {log.map((entry, i) => (
                <div key={i} style={{ color: entry.ok ? '#4caf50' : '#ff6b6b' }}>{entry.text}</div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer: state summary */}
      <footer style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {PARTS.map(p => {
          const s = state.merged.includes(p.id)
            ? (p.parent === null || state.merged.includes(p.parent) ? 'attached' : 'floating')
            : state.conflicts.includes(p.id) ? 'conflict' : 'unmerged'
          return (
            <span key={p.id} style={{
              fontSize: '0.65rem', fontFamily: 'monospace',
              color: s === 'attached' ? '#2d6a2d' : s === 'floating' ? '#ff9800' : s === 'conflict' ? '#ff4444' : '#222',
            }}>
              {s === 'attached' ? '✓' : s === 'floating' ? '⚠' : s === 'conflict' ? '⚡' : '·'} {p.id}
            </span>
          )
        })}
      </footer>

      {/* Overlays */}
      {state.conflicts.length > 0 && (
        <ConflictScreen conflicts={state.conflicts} onResolve={handleResolve} />
      )}
      {state.isAlive && (
        <SuperlativesScreen mergeHistory={state.mergeHistory} onReset={() => {}} />
      )}
    </div>
  )
}

// ── SHARED COMPONENTS ──────────────────────────────────────────────────────
const ROUND_CONCEPTS: Record<number, { title: string; desc: string }> = {
  1: { title: 'Branch + Merge',        desc: 'Create a branch off main, add a commit, merge it back.' },
  2: { title: 'Parallel Branches',     desc: 'Multiple branches off the same base, merged independently.' },
  3: { title: 'Chained Dependencies',  desc: 'A foot needs its leg merged first. Order matters.' },
  4: { title: 'Merge Conflict',        desc: 'Two versions of the same part collide. Resolve together.' },
  5: { title: 'Rebase (Chaos Event)',  desc: 'A shoe was branched off main by mistake. Rebase it onto foot.' },
}

function RoundCard({ round, compact = false, chaosActive = false }: { round: number; compact?: boolean; chaosActive?: boolean }) {
  const concept = ROUND_CONCEPTS[round]
  if (!concept) return null
  return (
    <div style={{
      background: '#0a0a16', border: `1px solid ${round === 5 && chaosActive ? '#663300' : '#22224a'}`, borderRadius: 4,
      padding: compact ? '0.5rem 0.6rem' : '0.6rem 0.8rem',
    }}>
      <div style={{ fontSize: compact ? '0.65rem' : '0.7rem', color: round === 5 && chaosActive ? '#ff9800' : '#4a4aaa', marginBottom: 2 }}>
        Round {round}: {concept.title}{round === 5 && chaosActive ? ' ⚠' : ''}
      </div>
      {!compact && (
        <div style={{ fontSize: '0.72rem', color: '#666' }}>{concept.desc}</div>
      )}
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: '0.7rem', color: '#555', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: '0.5rem',
}

function smallBtn(bg: string, border: string, color: string): React.CSSProperties {
  return {
    padding: '0.35rem 0.7rem', background: bg, border: `1px solid ${border}`,
    color, fontFamily: 'monospace', fontSize: '0.75rem', cursor: 'pointer', borderRadius: 4,
  }
}
