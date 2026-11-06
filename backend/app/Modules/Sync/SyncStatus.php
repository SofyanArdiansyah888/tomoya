<?php

namespace App\Modules\Sync;

use App\Support\SyncNode;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SyncStatus
{
    public function __construct(private readonly SyncExporter $exporter)
    {
    }

    public function toArray(): array
    {
        if (!Schema::hasTable('sync_state')) {
            return ['configured' => false, 'node' => SyncNode::code(), 'node_label' => SyncNode::label()];
        }

        $alertMinutes = (int) config('sync.offline_alert_minutes', 5);
        $isClient = SyncNode::isClient();

        $data = [
            'configured' => (bool) config('sync.enabled') && (bool) config('sync.token'),
            'enabled' => (bool) config('sync.enabled'),
            'node' => SyncNode::code(),
            'node_label' => SyncNode::label(),
            'role' => config('sync.role'),
            'server_time' => now()->toIso8601String(),
            'errors_24h' => DB::table('sync_logs')
                ->where('level', 'error')
                ->where('created_at', '>=', now()->subDay())
                ->count(),
            'conflicts_24h' => DB::table('sync_logs')
                ->where('level', 'conflict')
                ->where('created_at', '>=', now()->subDay())
                ->count(),
        ];

        if ($isClient) {
            $lastSuccess = SyncState::get('client:last_success_at');
            $data += [
                'last_success_at' => $lastSuccess,
                'last_attempt_at' => SyncState::get('client:last_attempt_at'),
                'last_error' => SyncState::get('client:last_error'),
                'pending' => $this->pendingCount(),
                'online' => $lastSuccess && Carbon::parse($lastSuccess)->gt(now()->subMinutes(2))
                    && !SyncState::get('client:last_error'),
                'alert' => !$lastSuccess || Carbon::parse($lastSuccess)->lt(now()->subMinutes($alertMinutes)),
            ];
        } else {
            $peerSeen = SyncState::get('peer:last_seen_at');
            $data += [
                'peer_node' => SyncState::get('peer:node'),
                'peer_label' => SyncNode::label(SyncState::get('peer:node', 'L')),
                'peer_last_seen_at' => $peerSeen,
                'online' => $peerSeen && Carbon::parse($peerSeen)->gt(now()->subMinutes(2)),
                'alert' => !$peerSeen || Carbon::parse($peerSeen)->lt(now()->subMinutes($alertMinutes)),
            ];
        }

        return $data;
    }

    private function pendingCount(): int
    {
        $total = 0;
        foreach (SyncRegistry::names() as $table) {
            $total += $this->exporter->pendingCount($table, SyncState::get('push:cursor:' . $table));
        }

        $total += DB::table('sync_tombstones')
            ->where('received', false)
            ->where('id', '>', (int) SyncState::get('push:tombstone_cursor', 0))
            ->count();

        return $total;
    }
}
