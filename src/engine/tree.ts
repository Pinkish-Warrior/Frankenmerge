// AI-assisted: drafted with AI tool, reviewed and modified by Tania Santana
export type PartId =
  | 'torso'
  | 'head'
  | 'left-arm' | 'left-hand'
  | 'right-arm' | 'right-hand'
  | 'left-leg' | 'left-foot' | 'left-shoe'
  | 'right-leg' | 'right-foot' | 'right-shoe'

export interface Part {
  id: PartId
  label: string
  parent: PartId | null  // null = branches off main
  round: number
}

export const PARTS: Part[] = [
  { id: 'torso',       label: 'Torso',       parent: null,         round: 1 },
  { id: 'head',        label: 'Head',        parent: 'torso',      round: 2 },
  { id: 'left-arm',    label: 'Left Arm',    parent: 'torso',      round: 2 },
  { id: 'right-arm',   label: 'Right Arm',   parent: 'torso',      round: 2 },
  { id: 'left-leg',    label: 'Left Leg',    parent: 'torso',      round: 3 },
  { id: 'right-leg',   label: 'Right Leg',   parent: 'torso',      round: 3 },
  { id: 'left-foot',   label: 'Left Foot',   parent: 'left-leg',   round: 3 },
  { id: 'right-foot',  label: 'Right Foot',  parent: 'right-leg',  round: 3 },
  { id: 'left-hand',   label: 'Left Hand',   parent: 'left-arm',   round: 4 },
  { id: 'right-hand',  label: 'Right Hand',  parent: 'right-arm',  round: 4 },
  { id: 'left-shoe',   label: 'Left Shoe',   parent: 'left-foot',  round: 5 },
  { id: 'right-shoe',  label: 'Right Shoe',  parent: 'right-foot', round: 5 },
]

export const PARTS_BY_ID = Object.fromEntries(PARTS.map(p => [p.id, p])) as Record<PartId, Part>

export function partsForRound(round: number): Part[] {
  return PARTS.filter(p => p.round === round)
}
