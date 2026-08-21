// AI-assisted: drafted with AI tool, reviewed and modified by Tania Santana
import type * as Party from 'partykit/server'
import { gameReducer, INITIAL_STATE, type GameAction, type GameState } from '../src/engine/state'

export default class FrankenmergeParty implements Party.Server {
  state: GameState = { ...INITIAL_STATE }

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    // Send current state to new player immediately on join
    conn.send(JSON.stringify({ type: 'STATE', state: this.state }))
  }

  onMessage(message: string, _sender: Party.Connection) {
    const action = JSON.parse(message) as GameAction

    const next = gameReducer(this.state, action)
    if (next === this.state) return  // no change, nothing to broadcast

    this.state = next
    // Broadcast updated state to all connected clients
    this.room.broadcast(JSON.stringify({ type: 'STATE', state: this.state }))
  }
}
