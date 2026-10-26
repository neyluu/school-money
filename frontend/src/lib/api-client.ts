const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "/api"

export type FieldErrors = Record<string, string>

type BackendErrorBody = {
  message?: string
  fieldErrors?: FieldErrors | null
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  token?: string | null
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

function buildHeaders(options?: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = {}

  if (options?.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }
  if (options?.token != null) {
    headers.Authorization = `Bearer ${options.token}`
  }

  return headers
}

function buildBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined
  }

  return body instanceof FormData ? body : JSON.stringify(body)
}

async function send(path: string, options?: RequestOptions): Promise<Response> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options?.method ?? "GET",
      headers: buildHeaders(options),
      body: buildBody(options?.body),
    })
  } catch {
    throw new ApiError(0, "Network request failed")
  }

  if (response.ok) {
    return response
  }

  const errorBody = await readErrorBody(response)
  throw new ApiError(
    response.status,
    errorBody.message ?? `Request failed with status ${response.status}`,
    errorBody.fieldErrors ?? null
  )
}

export async function apiRequest<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  const response = await send(path, options)

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export async function apiBlob(
  path: string,
  options?: RequestOptions
): Promise<Blob> {
  const response = await send(path, options)
  return response.blob()
}
