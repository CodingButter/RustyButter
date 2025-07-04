import type { ServerStatus, ApiError as ApiErrorType } from '@/types'

const API_BASE_URL = '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const api = {
  async getServerStatus(): Promise<ServerStatus> {
    const response = await fetch(`${API_BASE_URL}/server/status`)

    if (!response.ok) {
      const errorData: ApiErrorType = await response.json()
      throw new ApiError(response.status, errorData.message || 'Failed to fetch server status')
    }

    return response.json()
  },

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`)

    if (!response.ok) {
      throw new ApiError(response.status, 'Health check failed')
    }

    return response.json()
  },
}
