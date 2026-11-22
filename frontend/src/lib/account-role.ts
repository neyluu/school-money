export type AccountRole = "parent" | "treasurer"

const ROLE_PARAM = "role"
const DEFAULT_ROLE: AccountRole = "parent"

function parseRole(value: string | null): AccountRole {
  return value === "treasurer" || value === "parent" ? value : DEFAULT_ROLE
}

function hasRole(value: string | null): boolean {
  return value === "treasurer" || value === "parent"
}

function withRole(path: string, value: string | null): string {
  return hasRole(value) ? `${path}?${ROLE_PARAM}=${value}` : path
}

export { DEFAULT_ROLE, ROLE_PARAM, parseRole, withRole }
