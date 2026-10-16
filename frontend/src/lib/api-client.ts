const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "/api"

export type FieldErrors = Record<string, string>

type BackendErrorBody = {
  message?: string
  fieldErrors?: FieldErrors | null
}

export class ApiError extends Error {
  status: number
  fieldErrors: FieldErrors | null

  constructor(
    status: number,
    message: string,
    fieldErrors: FieldErrors | null = null
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function readErrorBody(response: Response): Promise<BackendErrorBody> {
  return response
    .json()
    .then((body: unknown) => (body ?? {}) as BackendErrorBody)
    .catch(() => ({}))
}

export async function apiRequest<T>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
    body?: unknown
    token?: string | null
  }
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options?.token != null
          ? { Authorization: `Bearer ${options.token}` }
          : {}),
      },
      ...(options?.body !== undefined
        ? { body: JSON.stringify(options.body) }
        : {}),
    })
  } catch {
    throw new ApiError(0, "Network request failed")
  }

  if (response.ok) {
    if (response.status === 204) {
      return undefined as T
    }
    return (await response.json()) as T
  }

  const errorBody = await readErrorBody(response)
  throw new ApiError(
    response.status,
    errorBody.message ?? `Request failed with status ${response.status}`,
    errorBody.fieldErrors ?? null
  )
}
