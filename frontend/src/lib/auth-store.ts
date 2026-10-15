// Token persistence. Only the opaque access token is stored here — never
// credentials. "Remember me" keeps the token in localStorage, otherwise it
// lives in sessionStorage and disappears when the tab closes.

const TOKEN_KEY = "sm.accessToken"

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

function saveToken(token: string, persistent: boolean): void {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  ;(persistent ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

function isAuthenticated(): boolean {
  return getToken() != null
}

export { clearToken, getToken, isAuthenticated, saveToken }
