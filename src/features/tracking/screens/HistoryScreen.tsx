import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listLocations } from '../data/locationRepository';
import { LocationPoint } from '../domain/location';

export default function HistoryScreen() {
  const [data, setData] = useState<LocationPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    const items = await listLocations(200);
    setData(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  async function refresh() {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.list}
        data={data}
        keyExtractor={item => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
            <Text style={styles.emptyText}>
              Mulai tracking untuk menyimpan titik lokasi pertama.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.coordinate}>
                {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
              </Text>
              <View
                style={[
                  styles.badge,
                  item.synced ? styles.syncedBadge : styles.pendingBadge,
                ]}>
                <Text style={styles.badgeText}>
                  {item.synced ? 'Synced' : 'Pending'}
                </Text>
              </View>
            </View>

            <Text style={styles.meta}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
            <Text style={styles.meta}>
              Source: {item.source} | Accuracy: {Math.round(item.accuracy ?? 0)}
              m
            </Text>
            <Text style={styles.meta}>
              Geofence {item.geofenceName}: {item.geofenceStatus}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  list: {
    padding: 16,
    paddingBottom: 28,
  },
  item: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 15,
  },
  itemHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  coordinate: {
    color: '#0f172a',
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  syncedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '900',
  },
  meta: {
    color: '#64748b',
    lineHeight: 20,
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 120,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
  },
});
