import { apiRequest } from "@/lib/api-client"
import { clearToken, getToken, saveToken } from "@/lib/auth-store"

export type AuthUser = {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  createdAt: string
}

type AuthResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}

async function login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  })
  saveToken(response.accessToken, rememberMe)
  return response.user
}

function logout(): void {
  clearToken()
  window.location.assign("/login")
}

export { getToken, login, logout }
