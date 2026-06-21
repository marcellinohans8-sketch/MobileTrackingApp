import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../app/store';
import { logout } from '../../auth/authSlice';
import {
  getLatestLocation,
  getLocationStats,
} from '../data/locationRepository';
import { LocationPoint } from '../domain/location';
import {
  startBackgroundTracking,
  stopBackgroundTracking,
} from '../services/backgroundService';
import {
  isTrackingActive,
  startTracking,
  stopTracking,
} from '../services/locationService';
import { isSocketConnected } from '../services/socketService';
import { syncPendingLocations } from '../services/syncService';

export default function TrackingScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [tracking, setTracking] = useState(isTrackingActive());
  const [background, setBackground] = useState(false);
  const [online, setOnline] = useState(false);
  const [socketOnline, setSocketOnline] = useState(isSocketConnected());
  const [syncing, setSyncing] = useState(false);
  const [latest, setLatest] = useState<LocationPoint | null>(null);
  const [stats, setStats] = useState({ total: 0, synced: 0, pending: 0 });

  const syncRate = useMemo(() => {
    if (!stats.total) {
      return '0%';
    }

    return `${Math.round((stats.synced / stats.total) * 100)}%`;
  }, [stats.synced, stats.total]);

  async function refreshDashboard() {
    const [latestLocation, locationStats] = await Promise.all([
      getLatestLocation(),
      getLocationStats(),
    ]);

    setLatest(latestLocation);
    setStats(locationStats);
    setSocketOnline(isSocketConnected());
  }

  useEffect(() => {
    refreshDashboard();
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
      refreshDashboard();
    });
    const dashboardTimer = setInterval(refreshDashboard, 5000);

    return () => {
      clearInterval(dashboardTimer);
      unsubscribe();
    };
  }, []);

  async function handleStart() {
    try {
      await startTracking(refreshDashboard);
      setTracking(true);
      refreshDashboard();
    } catch (error) {
      Alert.alert('Tracking gagal', (error as Error).message);
    }
  }

  function handleStop() {
    stopTracking();
    setTracking(false);
    refreshDashboard();
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await syncPendingLocations();
      await refreshDashboard();

      if (result.failed > 0) {
        Alert.alert(
          'Sync belum selesai',
          `${result.synced} data synced, ${result.failed} data masih pending.`,
        );
      }
    } finally {
      setSyncing(false);
    }
  }

  function handleBackgroundToggle() {
    if (background) {
      stopBackgroundTracking();
      setBackground(false);
      return;
    }

    startBackgroundTracking();
    setBackground(true);
  }

  function handleLogout() {
    stopTracking();
    stopBackgroundTracking();
    dispatch(logout());
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Halo, {user?.name}</Text>
            <Text style={styles.subtitle}>Interval tracking: 10 detik</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusPanel}>
          <View>
            <Text style={styles.statusLabel}>Live Tracking</Text>
            <Text style={styles.statusValue}>
              {tracking ? 'Aktif' : 'Berhenti'}
            </Text>
            <Text style={styles.statusHint}>
              {tracking
                ? 'Foreground capture berjalan tiap 10 detik'
                : 'Data tersimpan lokal dan siap sync otomatis'}
            </Text>
          </View>
          <View
            style={[
              styles.statusDot,
              tracking ? styles.statusDotActive : styles.statusDotInactive,
            ]}
          />
        </View>

        <View style={styles.grid}>
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Synced" value={stats.synced} />
          <StatCard label="Pending" value={stats.pending} highlight />
          <StatCard label="Sync Rate" value={syncRate} />
        </View>

        <View style={styles.healthPanel}>
          <HealthItem label="Network" active={online} />
          <HealthItem label="Socket.IO" active={socketOnline} />
          <HealthItem label="Background" active={background} />
        </View>

        <View style={styles.infoPanel}>
          <Text style={styles.sectionTitle}>Lokasi Terakhir</Text>
          {latest ? (
            <>
              <Text style={styles.coordinate}>
                {latest.latitude.toFixed(6)}, {latest.longitude.toFixed(6)}
              </Text>
              <Text style={styles.meta}>
                {new Date(latest.timestamp).toLocaleString()} |{' '}
                {latest.source} | {latest.synced ? 'synced' : 'pending'}
              </Text>
              <Text style={styles.meta}>
                Geofence {latest.geofenceName}: {latest.geofenceStatus}
              </Text>
              <Text style={styles.meta}>
                Retry: {latest.retryCount ?? 0} | Last attempt:{' '}
                {latest.lastSyncAttempt
                  ? new Date(latest.lastSyncAttempt).toLocaleString()
                  : '-'}
              </Text>
            </>
          ) : (
            <Text style={styles.emptyText}>Belum ada data lokasi.</Text>
          )}
        </View>

        <View style={styles.connectionRow}>
          <Text style={styles.connectionText}>
            Network: {online ? 'Online' : 'Offline'}
          </Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSync}
            disabled={syncing || !online}>
            <Text style={styles.secondaryButtonText}>
              {syncing ? 'Syncing...' : 'Sync Manual'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, tracking && styles.dangerButton]}
            onPress={tracking ? handleStop : handleStart}>
            <Text style={styles.primaryButtonText}>
              {tracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineButton, background && styles.activeOutline]}
            onPress={handleBackgroundToggle}>
            <Text style={styles.outlineButtonText}>
              {background ? 'Stop Background' : 'Start Background'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('History')}>
            <Text style={styles.navText}>Riwayat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Map')}>
            <Text style={styles.navText}>Map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.statCard, highlight && styles.highlightCard]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HealthItem({label, active}: {label: string; active: boolean}) {
  return (
    <View style={styles.healthItem}>
      <View
        style={[
          styles.healthDot,
          active ? styles.healthDotActive : styles.healthDotInactive,
        ]}
      />
      <Text style={styles.healthText}>
        {label}: {active ? 'On' : 'Off'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 18,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  greeting: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748b',
    marginTop: 4,
  },
  logoutButton: {
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#334155',
    fontWeight: '700',
  },
  statusPanel: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    padding: 18,
  },
  statusLabel: {
    color: '#a7f3d0',
    fontSize: 13,
    fontWeight: '700',
  },
  statusValue: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 2,
  },
  statusHint: {
    color: '#cbd5e1',
    lineHeight: 20,
    marginTop: 6,
  },
  statusDot: {
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  statusDotActive: {
    backgroundColor: '#22c55e',
  },
  statusDotInactive: {
    backgroundColor: '#ef4444',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  healthPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
    padding: 12,
  },
  healthItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    minWidth: '30%',
  },
  healthDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  healthDotActive: {
    backgroundColor: '#14b8a6',
  },
  healthDotInactive: {
    backgroundColor: '#f97316',
  },
  healthText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 84,
    padding: 14,
    width: '48.5%',
  },
  highlightCard: {
    borderColor: '#f59e0b',
  },
  statValue: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  infoPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  coordinate: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
  },
  meta: {
    color: '#64748b',
    lineHeight: 20,
    marginTop: 6,
  },
  emptyText: {
    color: '#64748b',
  },
  connectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  connectionText: {
    color: '#334155',
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#0369a1',
    fontWeight: '800',
  },
  actions: {
    gap: 10,
    marginBottom: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 16,
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  outlineButton: {
    alignItems: 'center',
    borderColor: '#2563eb',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 15,
  },
  activeOutline: {
    backgroundColor: '#dbeafe',
  },
  outlineButtonText: {
    color: '#1d4ed8',
    fontSize: 15,
    fontWeight: '900',
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  navText: {
    color: '#0f172a',
    fontWeight: '900',
  },
});
