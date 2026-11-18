import { ApiError, apiBlob, apiRequest } from "@/lib/api-client"
import type { RequestOptions } from "@/lib/api-client"
import { clearToken, getToken } from "@/lib/auth-store"

type AuthorizedOptions = Omit<RequestOptions, "token">

function requireToken(): string {
  const token = getToken()
  if (token == null) {
    throw new ApiError(401, "Missing access token")
  }
  return token
}

function dropTokenWhenUnauthorized(error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    clearToken()
  }
}

async function authorizedRequest<T>(
  path: string,
  options?: AuthorizedOptions
): Promise<T> {
  const token = requireToken()
  try {
    return await apiRequest<T>(path, { ...options, token })
  } catch (error) {
    dropTokenWhenUnauthorized(error)
    throw error
  }
}

async function authorizedBlob(
  path: string,
  options?: AuthorizedOptions
): Promise<Blob> {
  const token = requireToken()
  try {
    return await apiBlob(path, { ...options, token })
  } catch (error) {
    dropTokenWhenUnauthorized(error)
    throw error
  }
}

export { authorizedBlob, authorizedRequest }
