const TOKEN_KEY = "sm.accessToken";
const ROLE_KEY = "sm.accountRole";

type IntendedRole = "parent" | "treasurer";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

function saveToken(token: string, persistent: boolean): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  (persistent ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

function isAuthenticated(): boolean {
  return getToken() != null;
}

function saveIntendedRole(role: IntendedRole): void {
  localStorage.setItem(ROLE_KEY, role);
}

function getIntendedRole(): IntendedRole | null {
  const value = localStorage.getItem(ROLE_KEY);
  return value === "parent" || value === "treasurer" ? value : null;
}

export {
  clearToken,
  getIntendedRole,
  getToken,
  isAuthenticated,
  saveIntendedRole,
  saveToken,
};
