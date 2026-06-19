import { attachStatus } from '../engine/state'
import { PARTS, type PartId } from '../engine/tree'
import type { MergeEvent } from '../engine/state'

interface Props {
  merged: PartId[]
  mergeHistory: MergeEvent[]
}

const STATUS_COLOR = {
  unmerged: '#333',
  attached: '#4caf50',
  floating: '#ff9800',
}

function depthOf(id: PartId): number {
  const part = PARTS.find(p => p.id === id)!
  if (!part.parent) return 0
  return 1 + depthOf(part.parent as PartId)
}

export function GraphView({ merged, mergeHistory }: Props) {
  const SPACING = 38
  const START_Y = 24
  const MAIN_X = 20

  // All parts in merge-history order first, then unmerged in tree order
  const ordered = [
    ...mergeHistory.map(e => e.branch),
    ...PARTS.map(p => p.id).filter(id => !merged.includes(id)),
  ]

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      <svg
        viewBox={`0 0 260 ${Math.max(300, ordered.length * SPACING + 60)}`}
        style={{ width: '100%', fontFamily: 'monospace' }}
      >
        {/* main branch line */}
        <line
          x1={MAIN_X} y1={START_Y}
          x2={MAIN_X} y2={START_Y + ordered.length * SPACING}
          stroke="#555" strokeWidth={2}
        />
        <text x={MAIN_X} y={14} textAnchor="middle" fill="#888" fontSize={9}>main</text>

        {ordered.map((id, i) => {
          const y = START_Y + i * SPACING
          const status = attachStatus(id, merged)
          const color = STATUS_COLOR[status]
          const depth = depthOf(id)
          const branchX = MAIN_X + 18 + depth * 22
          const part = PARTS.find(p => p.id === id)!

          return (
            <g key={id}>
              {/* branch line from main */}
              <path
                d={`M ${MAIN_X} ${y} C ${MAIN_X + 12} ${y} ${branchX - 8} ${y - 10} ${branchX} ${y}`}
                stroke={color} strokeWidth={1.5} fill="none" opacity={status === 'unmerged' ? 0.3 : 1}
              />

              {/* merge-back line to main (only if merged) */}
              {status !== 'unmerged' && (
                <path
                  d={`M ${branchX} ${y} C ${branchX + 8} ${y + 10} ${MAIN_X + 12} ${y + 12} ${MAIN_X} ${y + 12}`}
                  stroke={color} strokeWidth={1.5} fill="none" opacity={0.5}
                />
              )}

              {/* merge commit dot on main */}
              <circle
                cx={MAIN_X} cy={y}
                r={status === 'unmerged' ? 3 : 5}
                fill={status === 'unmerged' ? '#222' : color}
                stroke={color} strokeWidth={1.5}
              />

              {/* branch commit dot */}
              <circle
                cx={branchX} cy={y}
                r={4}
                fill={status === 'unmerged' ? '#111' : color}
                stroke={color} strokeWidth={1.5}
                opacity={status === 'unmerged' ? 0.4 : 1}
              />

              {/* branch label */}
              <text
                x={branchX + 10} y={y + 4}
                fill={color} fontSize={10}
                opacity={status === 'unmerged' ? 0.35 : 1}
              >
                {id}
              </text>

              {/* round badge */}
              <text
                x={240} y={y + 4}
                fill="#555" fontSize={8} textAnchor="end"
              >
                R{part.round}
              </text>

              {/* floating warning */}
              {status === 'floating' && (
                <text x={branchX + 10} y={y + 15} fill="#ff9800" fontSize={8}>
                  ⚠ orphan
                </text>
              )}
            </g>
          )
        })}

        {/* legend */}
        <g transform={`translate(4, ${ordered.length * SPACING + 36})`}>
          {[
            { color: '#4caf50', label: 'attached' },
            { color: '#ff9800', label: 'floating' },
            { color: '#333',    label: 'unmerged' },
          ].map(({ color, label }, i) => (
            <g key={label} transform={`translate(${i * 80}, 0)`}>
              <circle cx={6} cy={6} r={4} fill={color} />
              <text x={14} y={10} fill="#666" fontSize={8}>{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
