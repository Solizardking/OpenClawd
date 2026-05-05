import { useConvexAuth, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import { loadWalletSession } from './nanosolanaWalletSession'
import { usePhantomState } from './phantomContext'

export function useAuthStatus() {
  const convexAuth = useConvexAuth()
  const me = useQuery(
    api.users.me,
    convexAuth.isAuthenticated ? {} : 'skip',
  ) as Doc<'users'> | null | undefined

  // Phantom SDK wallet (safe — returns disconnected if outside PhantomProvider)
  const { isConnected: phantomConnected, address: phantomAddress } = usePhantomState()

  // Gateway / pairing wallet session
  const [walletSession, setWalletSession] = useState(() =>
    typeof window !== 'undefined' ? loadWalletSession() : null,
  )
  useEffect(() => {
    const session = loadWalletSession()
    setWalletSession(session)
  }, [])
  const activeWalletSession =
    walletSession && walletSession.sessionExpiresAt > Date.now() ? walletSession : null

  // Unified wallet address: Convex linked > Phantom > wallet session
  const walletAddress =
    (me as Record<string, unknown> | null | undefined)?.solanaWalletAddress as string | null ??
    phantomAddress ??
    activeWalletSession?.walletAddress ??
    null

  // Authenticated if ANY auth source is active
  const isConvexAuthed = convexAuth.isAuthenticated && Boolean(me)
  const isAuthenticated = isConvexAuthed || phantomConnected || Boolean(activeWalletSession)

  return {
    me,
    isLoading:
      convexAuth.isLoading ||
      (convexAuth.isAuthenticated && me === undefined && !phantomConnected && !activeWalletSession),
    isAuthenticated,
    /** True only when the user has a Convex/GitHub account */
    isConvexAuthed,
    phantomConnected,
    phantomAddress,
    walletSession: activeWalletSession,
    /** Best available wallet address from any auth source */
    walletAddress,
  }
}
