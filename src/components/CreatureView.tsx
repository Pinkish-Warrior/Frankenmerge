import { attachStatus } from '../engine/state'
import { PARTS_BY_ID, type PartId } from '../engine/tree'

const SKIN = '#5a8a6a'
const SKIN_DARK = '#3d6b4f'
const SEAM = '#cc2222'
const BOLT = '#cccccc'
const FLOAT_COLOR = '#ff9800'

type Status = 'unmerged' | 'attached' | 'floating'

// How far each part drifts when floating (disconnected)
const FLOAT_OFFSETS: Record<PartId, [number, number]> = {
  torso:       [0, 0],
  head:        [0, -60],
  'left-arm':  [-50, -5],
  'right-arm': [50, -5],
  'left-hand': [-55, 0],
  'right-hand':[55, 0],
  'left-leg':  [-12, 50],
  'right-leg': [12, 50],
  'left-foot': [-28, 55],
  'right-foot':[28, 55],
  'left-shoe': [-32, 65],
  'right-shoe':[32, 65],
}

function partStyle(status: Status, id: PartId) {
  const [dx, dy] = FLOAT_OFFSETS[id]
  if (status === 'unmerged') return { opacity: 0.12, transform: 'none', filter: 'none' }
  if (status === 'floating') return {
    opacity: 0.65,
    transform: `translate(${dx}px, ${dy}px)`,
    filter: `drop-shadow(0 0 6px ${FLOAT_COLOR})`,
    transition: 'transform 0.6s ease, opacity 0.3s',
  }
  return {
    opacity: 1,
    transform: 'none',
    filter: 'none',
    transition: 'transform 0.6s ease, opacity 0.3s',
  }
}

function Seam({ d, visible }: { d: string; visible: boolean }) {
  if (!visible) return null
  return (
    <path
      d={d}
      stroke={SEAM}
      strokeWidth={2.5}
      strokeDasharray="4 3"
      fill="none"
      opacity={0.9}
    />
  )
}

function Bolt({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 4} y={cy - 8} width={8} height={16} rx={2} fill={BOLT} />
      <circle cx={cx} cy={cy} r={5} fill={BOLT} stroke="#888" strokeWidth={1} />
    </g>
  )
}

interface Props {
  merged: PartId[]
  isAlive: boolean
}

export function CreatureView({ merged, isAlive }: Props) {
  function status(id: PartId): Status {
    return attachStatus(id, merged)
  }

  const alive = isAlive

  return (
    <svg
      viewBox="0 0 400 510"
      style={{ width: '100%', maxWidth: 400, display: 'block', margin: '0 auto' }}
    >
      {/* Alive glow background */}
      {alive && (
        <ellipse cx={200} cy={255} rx={160} ry={220} fill="#00ff44" opacity={0.04}>
          <animate attributeName="opacity" values="0.04;0.1;0.04" dur="1.2s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* ── TORSO ── */}
      <g style={partStyle(status('torso'), 'torso')}>
        <rect x={132} y={158} width={136} height={148} rx={12}
          fill={status('torso') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={status('torso') === 'attached' && alive ? '#00ff44' : SKIN_DARK}
          strokeWidth={alive ? 2.5 : 1.5}
        />
        {/* chest plate */}
        <rect x={154} y={178} width={92} height={68} rx={6} fill={SKIN_DARK} opacity={0.6} />
        <line x1={200} y1={178} x2={200} y2={246} stroke={SKIN} strokeWidth={1} opacity={0.4} />
      </g>

      {/* ── LEFT ARM ── */}
      <g style={partStyle(status('left-arm'), 'left-arm')}>
        <rect x={53} y={165} width={79} height={110} rx={10}
          fill={status('left-arm') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        <Seam d="M 132 175 L 132 265" visible={status('left-arm') === 'attached'} />
      </g>

      {/* ── RIGHT ARM ── */}
      <g style={partStyle(status('right-arm'), 'right-arm')}>
        <rect x={268} y={165} width={79} height={110} rx={10}
          fill={status('right-arm') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        <Seam d="M 268 175 L 268 265" visible={status('right-arm') === 'attached'} />
      </g>

      {/* ── LEFT HAND ── */}
      <g style={partStyle(status('left-hand'), 'left-hand')}>
        <ellipse cx={82} cy={296} rx={37} ry={25}
          fill={status('left-hand') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        {/* fingers suggestion */}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={50 + i * 11} y1={287} x2={50 + i * 11} y2={278}
            stroke={SKIN_DARK} strokeWidth={5} strokeLinecap="round"
          />
        ))}
        <Seam d="M 60 275 L 132 275" visible={status('left-hand') === 'attached'} />
      </g>

      {/* ── RIGHT HAND ── */}
      <g style={partStyle(status('right-hand'), 'right-hand')}>
        <ellipse cx={318} cy={296} rx={37} ry={25}
          fill={status('right-hand') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={286 + i * 11} y1={287} x2={286 + i * 11} y2={278}
            stroke={SKIN_DARK} strokeWidth={5} strokeLinecap="round"
          />
        ))}
        <Seam d="M 268 275 L 340 275" visible={status('right-hand') === 'attached'} />
      </g>

      {/* ── LEFT LEG ── */}
      <g style={partStyle(status('left-leg'), 'left-leg')}>
        <rect x={141} y={306} width={54} height={118} rx={10}
          fill={status('left-leg') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        <Seam d="M 141 307 L 195 307" visible={status('left-leg') === 'attached'} />
      </g>

      {/* ── RIGHT LEG ── */}
      <g style={partStyle(status('right-leg'), 'right-leg')}>
        <rect x={205} y={306} width={54} height={118} rx={10}
          fill={status('right-leg') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        <Seam d="M 205 307 L 259 307" visible={status('right-leg') === 'attached'} />
      </g>

      {/* ── LEFT FOOT ── */}
      <g style={partStyle(status('left-foot'), 'left-foot')}>
        <rect x={108} y={416} width={90} height={34} rx={8}
          fill={status('left-foot') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        <Seam d="M 141 416 L 195 416" visible={status('left-foot') === 'attached'} />
      </g>

      {/* ── RIGHT FOOT ── */}
      <g style={partStyle(status('right-foot'), 'right-foot')}>
        <rect x={202} y={416} width={90} height={34} rx={8}
          fill={status('right-foot') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        <Seam d="M 205 416 L 259 416" visible={status('right-foot') === 'attached'} />
      </g>

      {/* ── LEFT SHOE ── */}
      <g style={partStyle(status('left-shoe'), 'left-shoe')}>
        <rect x={94} y={444} width={102} height={30} rx={6}
          fill={status('left-shoe') === 'floating' ? FLOAT_COLOR : SKIN_DARK}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        <Seam d="M 108 444 L 198 444" visible={status('left-shoe') === 'attached'} />
      </g>

      {/* ── RIGHT SHOE ── */}
      <g style={partStyle(status('right-shoe'), 'right-shoe')}>
        <rect x={204} y={444} width={102} height={30} rx={6}
          fill={status('right-shoe') === 'floating' ? FLOAT_COLOR : SKIN_DARK}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        <Seam d="M 202 444 L 292 444" visible={status('right-shoe') === 'attached'} />
      </g>

      {/* ── HEAD (rendered last so it's on top) ── */}
      <g style={partStyle(status('head'), 'head')}>
        {/* flat-top Frankenstein head */}
        <path
          d="M 158 55 L 158 25 L 242 25 L 242 55 Q 242 145 200 148 Q 158 145 158 55 Z"
          fill={status('head') === 'floating' ? FLOAT_COLOR : SKIN}
          stroke={SKIN_DARK} strokeWidth={1.5}
        />
        {/* brow ridge */}
        <line x1={162} y1={72} x2={238} y2={72} stroke={SKIN_DARK} strokeWidth={3} />
        {/* eyes */}
        <ellipse cx={182} cy={90} rx={14} ry={10} fill="#1a2a1a" />
        <ellipse cx={218} cy={90} rx={14} ry={10} fill="#1a2a1a" />
        <circle cx={182} cy={90} r={5} fill="#ff4444" opacity={0.8} />
        <circle cx={218} cy={90} r={5} fill="#ff4444" opacity={0.8} />
        {/* stitched mouth */}
        <path d="M 178 128 Q 200 136 222 128" stroke={SEAM} strokeWidth={2}
          strokeDasharray="3 2" fill="none" />
        {/* bolts */}
        <Bolt cx={148} cy={118} />
        <Bolt cx={252} cy={118} />
        {/* neck seam */}
        <Seam d="M 175 148 L 225 148" visible={status('head') === 'attached'} />
      </g>

      {/* ── IT'S ALIVE label ── */}
      {alive && (
        <text x={200} y={498} textAnchor="middle"
          fill="#00ff44" fontSize={22} fontFamily="'Courier New', monospace" fontWeight="bold"
          letterSpacing={3}
        >
          IT'S ALIVE!
          <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
        </text>
      )}

      {/* floating part labels */}
      {(Object.keys(PARTS_BY_ID) as PartId[]).map(id => {
        if (status(id) !== 'floating') return null
        const [dx, dy] = FLOAT_OFFSETS[id]
        const label = PARTS_BY_ID[id].label
        // approximate center of each part + float offset
        const centers: Record<PartId, [number, number]> = {
          torso:       [200, 232], head:        [200, 88],
          'left-arm':  [92, 220],  'right-arm': [308, 220],
          'left-hand': [82, 296],  'right-hand':[318, 296],
          'left-leg':  [168, 365], 'right-leg': [232, 365],
          'left-foot': [153, 433], 'right-foot':[247, 433],
          'left-shoe': [145, 459], 'right-shoe':[255, 459],
        }
        const [cx, cy] = centers[id]
        return (
          <text key={id}
            x={cx + dx} y={cy + dy - 28}
            textAnchor="middle" fill={FLOAT_COLOR}
            fontSize={9} fontFamily="monospace"
          >
            ⚠ {label}
          </text>
        )
      })}
    </svg>
  )
}
