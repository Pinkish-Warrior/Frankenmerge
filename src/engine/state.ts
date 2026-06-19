import { PARTS_BY_ID, type PartId } from './tree'

export type AttachStatus = 'unmerged' | 'attached' | 'floating'

// Parts that trigger the conflict mechanic in Round 4
export const CONFLICT_PARTS: PartId[] = ['left-hand', 'right-hand']
// Parts that use the rebase mechanic in Round 5
export const REBASE_PARTS: PartId[] = ['left-shoe', 'right-shoe']

export interface MergeEvent {
  branch: PartId
  playerId: string
  timestamp: number
  action: 'merge' | 'resolve' | 'rebase'
}

export interface GameState {
  merged: PartId[]
  mergeHistory: MergeEvent[]
  currentRound: number
  isAlive: boolean
  conflicts: PartId[]      // hands currently in the conflict-resolution screen
  chaosTriggered: boolean  // Round 5: shoes were "branched off main by mistake"
}

export const INITIAL_STATE: GameState = {
  merged: [],
  mergeHistory: [],
  currentRound: 1,
  isAlive: false,
  conflicts: [],
  chaosTriggered: false,
}

export function canMerge(branch: PartId, merged: PartId[]): boolean {
  const part = PARTS_BY_ID[branch]
  if (!part) return false
  if (merged.includes(branch)) return false
  if (part.parent === null) return true
  return merged.includes(part.parent)
}

export function attachStatus(branch: PartId, merged: PartId[]): AttachStatus {
  if (!merged.includes(branch)) return 'unmerged'
  const part = PARTS_BY_ID[branch]
  if (part.parent === null || merged.includes(part.parent)) return 'attached'
  return 'floating'
}

export function validateTree(merged: PartId[]): boolean {
  return Object.keys(PARTS_BY_ID).every(id =>
    attachStatus(id as PartId, merged) === 'attached'
  )
}

export type GameAction =
  | { type: 'MERGE'; branch: PartId; playerId: string }
  | { type: 'START_CONFLICT'; branch: PartId; playerId: string }
  | { type: 'RESOLVE_CONFLICT'; branch: PartId; playerId: string }
  | { type: 'TRIGGER_CHAOS' }
  | { type: 'REBASE'; branch: PartId; playerId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MERGE': {
      if (!canMerge(action.branch, state.merged)) return state
      const merged = [...state.merged, action.branch]
      const mergeHistory = [
        ...state.mergeHistory,
        { branch: action.branch, playerId: action.playerId, timestamp: Date.now(), action: 'merge' as const },
      ]
      return { ...state, merged, mergeHistory, isAlive: validateTree(merged) }
    }
    case 'START_CONFLICT': {
      if (!canMerge(action.branch, state.merged)) return state
      if (state.conflicts.includes(action.branch)) return state
      return { ...state, conflicts: [...state.conflicts, action.branch] }
    }
    case 'RESOLVE_CONFLICT': {
      if (!state.conflicts.includes(action.branch)) return state
      const conflicts = state.conflicts.filter(c => c !== action.branch)
      const merged = [...state.merged, action.branch]
      const mergeHistory = [
        ...state.mergeHistory,
        { branch: action.branch, playerId: action.playerId, timestamp: Date.now(), action: 'resolve' as const },
      ]
      return { ...state, conflicts, merged, mergeHistory, isAlive: validateTree(merged) }
    }
    case 'TRIGGER_CHAOS':
      return { ...state, chaosTriggered: true }
    case 'REBASE': {
      if (!state.chaosTriggered) return state
      if (!REBASE_PARTS.includes(action.branch)) return state
      if (!canMerge(action.branch, state.merged)) return state
      const merged = [...state.merged, action.branch]
      const mergeHistory = [
        ...state.mergeHistory,
        { branch: action.branch, playerId: action.playerId, timestamp: Date.now(), action: 'rebase' as const },
      ]
      return { ...state, merged, mergeHistory, isAlive: validateTree(merged) }
    }
    case 'NEXT_ROUND':
      return { ...state, currentRound: Math.min(state.currentRound + 1, 5) }
    case 'RESET':
      return { ...INITIAL_STATE }
    default:
      return state
  }
}
