import { ApiError, apiRequest } from "@/lib/api-client"
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

export type ClassInfo = {
  id: number
  name: string
  school: string
  city: string
}

async function lookupClass(code: string): Promise<ClassInfo> {
  return apiRequest<ClassInfo>(
    `/classes/lookup?code=${encodeURIComponent(code)}`
  )
}

async function me(): Promise<AuthUser> {
  const token = getToken()
  if (token == null) {
    throw new ApiError(401, "Missing access token")
  }
  try {
    return await apiRequest<AuthUser>("/auth/me", { token })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearToken()
    }
    throw error
  }
}

async function register(input: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: input,
  })
  saveToken(response.accessToken, true)
  return response.user
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

export { getToken, login, logout, lookupClass, me, register }
