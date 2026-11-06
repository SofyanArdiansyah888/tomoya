import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { syncService, type SyncStatus } from '../../services/sync'

const timeAgo = (iso?: string | null): string => {
  if (!iso) return 'belum pernah'
  const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (diffSec < 60) return 'baru saja'
  const min = Math.round(diffSec / 60)
  if (min < 60) return `${min} menit lalu`
  const hour = Math.round(min / 60)
  if (hour < 24) return `${hour} jam lalu`
  return `${Math.round(hour / 24)} hari lalu`
}

const formatTime = (iso?: string | null): string =>
  iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

export const useSyncStatus = () =>
  useQuery<SyncStatus>({
    queryKey: ['sync-status'],
    queryFn: syncService.getStatus,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 15_000,
  })

/**
 * Indikator kecil di header: status sinkron PC kasir <-> cloud.
 */
export const SyncStatusBadge = () => {
  const { data } = useSyncStatus()

  if (!data || !data.configured) return null

  const isClient = data.role === 'client'
  const pending = data.pending ?? 0
  const online = !!data.online

  let label: string
  let tone: string
  let Icon = Cloud

  if (isClient) {
    if (online && pending === 0) {
      label = `Tersinkron · ${timeAgo(data.last_success_at)}`
      tone = 'bg-emerald-50 text-emerald-700 border-emerald-200'
    } else if (online) {
      label = `Menyinkronkan · ${pending} data`
      tone = 'bg-sky-50 text-sky-700 border-sky-200'
      Icon = RefreshCw
    } else {
      label = pending > 0 ? `Offline · ${pending} data menunggu` : 'Offline'
      tone = 'bg-amber-50 text-amber-800 border-amber-300'
      Icon = CloudOff
    }
  } else {
    label = online
      ? `${data.peer_label ?? 'Kasir Lokal'} terhubung`
      : `${data.peer_label ?? 'Kasir Lokal'} terputus · ${timeAgo(data.peer_last_seen_at)}`
    tone = online
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-800 border-amber-300'
    Icon = online ? Cloud : CloudOff
  }

  const title = [
    `Instance: ${data.node_label} (${data.node})`,
    isClient ? `Sinkron terakhir: ${formatTime(data.last_success_at)}` : `Terakhir terhubung: ${formatTime(data.peer_last_seen_at)}`,
    data.last_error ? `Error: ${data.last_error.message}` : null,
    data.errors_24h ? `${data.errors_24h} error sinkron (24 jam)` : null,
    data.conflicts_24h ? `${data.conflicts_24h} konflik data (24 jam)` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}
      title={title}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="whitespace-nowrap">{label}</span>
      {(data.errors_24h ?? 0) > 0 && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
    </div>
  )
}

/**
 * Banner di cloud saat PC kasir lama tidak terhubung (indikasi PC mati / internet toko putus).
 */
export const SyncOfflineBanner = () => {
  const { data } = useSyncStatus()

  if (!data || !data.configured || data.role !== 'server' || !data.alert) return null

  return (
    <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-sm px-4 sm:px-6 py-2 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <span>
        {data.peer_label ?? 'PC kasir'} tidak terhubung sejak{' '}
        <strong>{formatTime(data.peer_last_seen_at)}</strong>. Jika PC kasir mati, transaksi bisa dilanjutkan di
        sini (mode cadangan): buka shift baru, nomor pesanan akan berawalan <strong>PSN-{data.node}-</strong>. Data
        otomatis tersinkron saat PC kasir menyala kembali.
      </span>
    </div>
  )
}
