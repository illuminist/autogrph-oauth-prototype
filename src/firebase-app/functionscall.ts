import { makeMakeCallableFunction } from './functions'

export type GamePlayCount = {
  [gameId: string]: number
}

const makeCallableFunction = makeMakeCallableFunction()

export type CreateGameSession = (e: {
  gamePlayCount: GamePlayCount
  selectionScreen: {
    title: string
    backgroundMedia: string
  }
}) => Promise<{ sessionId: string }>
export const createGameSession = makeCallableFunction<CreateGameSession>(
  'createGameSession',
)

export type JoinGameSession = (e: {
  passphrase: string
  name: { firstname: string; lastname: string; nickname: string }
}) => void
export const joinGameSession = makeCallableFunction<JoinGameSession>(
  'joinGameSession',
)

export type LeaveGameSession = (e: {}) => void
export const leaveGameSession = makeCallableFunction<LeaveGameSession>(
  'leaveGameSession',
)

export type ClaimAdmin = (e?: {}) => Promise<any>
export const claimAdmin = makeCallableFunction<ClaimAdmin>('claimAdmin')

export type GenerateSessionPassport = (e?: {}) => Promise<{
  passportId: string
  passphrase: string
}>
export const generateSessionPassport = makeCallableFunction<
  GenerateSessionPassport
>('generateSessionPassport')

export type TerminateSession = (e?: { sessionId: string }) => Promise<void>
export const terminateSession = makeCallableFunction<TerminateSession>(
  'terminateSession',
)
