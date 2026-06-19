import { useEffect, useState, useRef, useCallback } from 'react'
import PartySocket from 'partysocket'
import { INITIAL_STATE, type GameAction, type GameState } from '../engine/state'
import type { PartId } from '../engine/tree'

const PARTYKIT_HOST = import.meta.env.DEV
  ? 'localhost:1999'
  : (import.meta.env.VITE_PARTYKIT_HOST as string)

export function useGameRoom(roomId: string, playerId: string) {
  const [state, setState] = useState<GameState>(INITIAL_STATE)
  const socketRef = useRef<PartySocket | null>(null)

  useEffect(() => {
    const socket = new PartySocket({ host: PARTYKIT_HOST, room: roomId })
    socketRef.current = socket

    socket.onmessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data as string)
      if (msg.type === 'STATE') setState(msg.state as GameState)
    }

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [roomId])

  const send = useCallback((action: GameAction) => {
    socketRef.current?.send(JSON.stringify(action))
  }, [])

  const merge = useCallback((branch: PartId) => {
    send({ type: 'MERGE', branch, playerId })
  }, [send, playerId])

  const startConflict = useCallback((branch: PartId) => {
    send({ type: 'START_CONFLICT', branch, playerId })
  }, [send, playerId])

  const resolveConflict = useCallback((branch: PartId) => {
    send({ type: 'RESOLVE_CONFLICT', branch, playerId })
  }, [send, playerId])

  const triggerChaos = useCallback(() => send({ type: 'TRIGGER_CHAOS' }), [send])

  const rebase = useCallback((branch: PartId) => {
    send({ type: 'REBASE', branch, playerId })
  }, [send, playerId])

  const nextRound = useCallback(() => send({ type: 'NEXT_ROUND' }), [send])
  const reset = useCallback(() => send({ type: 'RESET' }), [send])

  return { state, merge, startConflict, resolveConflict, triggerChaos, rebase, nextRound, reset }
}
