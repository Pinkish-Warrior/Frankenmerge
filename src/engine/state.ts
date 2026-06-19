import { PARTS_BY_ID, type PartId } from './tree'

export type AttachStatus = 'unmerged' | 'attached' | 'floating'

export interface MergeEvent {
  branch: PartId
  playerId: string
  timestamp: number
}

export interface GameState {
  merged: PartId[]               // ordered list of merged branches
  mergeHistory: MergeEvent[]
  currentRound: number
  isAlive: boolean               // true when win condition passes
}

export const INITIAL_STATE: GameState = {
  merged: [],
  mergeHistory: [],
  currentRound: 1,
  isAlive: false,
}

// Can this branch be merged? Parent must already be in main (or parent is null = off main directly)
export function canMerge(branch: PartId, merged: PartId[]): boolean {
  const part = PARTS_BY_ID[branch]
  if (!part) return false
  if (merged.includes(branch)) return false        // already merged
  if (part.parent === null) return true            // torso: always allowed
  return merged.includes(part.parent)
}

// How does this part render on the creature?
export function attachStatus(branch: PartId, merged: PartId[]): AttachStatus {
  if (!merged.includes(branch)) return 'unmerged'
  const part = PARTS_BY_ID[branch]
  if (part.parent === null || merged.includes(part.parent)) return 'attached'
  return 'floating'  // merged but parent wasn't — visually disconnected
}

// Walk the full merge history and confirm every part is attached (not floating)
export function validateTree(merged: PartId[]): boolean {
  return Object.keys(PARTS_BY_ID).every(id =>
    attachStatus(id as PartId, merged) === 'attached'
  )
}

export type GameAction =
  | { type: 'MERGE'; branch: PartId; playerId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MERGE': {
      if (!canMerge(action.branch, state.merged)) return state
      const merged = [...state.merged, action.branch]
      const mergeHistory = [
        ...state.mergeHistory,
        { branch: action.branch, playerId: action.playerId, timestamp: Date.now() },
      ]
      const isAlive = validateTree(merged)
      return { ...state, merged, mergeHistory, isAlive }
    }
    case 'NEXT_ROUND':
      return { ...state, currentRound: Math.min(state.currentRound + 1, 5) }
    case 'RESET':
      return { ...INITIAL_STATE }
    default:
      return state
  }
}
