import { api } from './api'

export interface SyncStatus {
  configured: boolean
  enabled?: boolean
  node: string
  node_label: string
  role?: 'client' | 'server'
  server_time?: string
  errors_24h?: number
  conflicts_24h?: number
  online?: boolean
  alert?: boolean
  // client (PC kasir)
  last_success_at?: string | null
  last_attempt_at?: string | null
  last_error?: { message: string; at: string } | null
  pending?: number
  // server (cloud)
  peer_node?: string | null
  peer_label?: string
  peer_last_seen_at?: string | null
}

export const syncService = {
  async getStatus(): Promise<SyncStatus> {
    const response = await api.get('/sync/status')
    return response.data
  },
}
