import { me } from "@/lib/auth"
import type { AuthUser } from "@/lib/auth"

let currentUser: AuthUser | null = null
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

function getCurrentUser(): AuthUser | null {
  return currentUser
}

function setCurrentUser(user: AuthUser | null): void {
  currentUser = user
  listeners.forEach((listener) => listener())
}

function subscribeCurrentUser(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function loadCurrentUser(): Promise<void> {
  loading ??= me()
    .then(setCurrentUser)
    .catch(() => undefined)
    .finally(() => {
      loading = null
    })
  return loading
}

export { getCurrentUser, loadCurrentUser, setCurrentUser, subscribeCurrentUser }
