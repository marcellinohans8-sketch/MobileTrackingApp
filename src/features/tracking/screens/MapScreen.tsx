import React, { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { listLocations } from '../data/locationRepository';
import { LocationPoint } from '../domain/location';

export default function MapScreen() {
  const [locations, setLocations] = useState<LocationPoint[]>([]);

  useFocusEffect(
    useCallback(() => {
      listLocations(100).then(items => setLocations(items.reverse()));
    }, []),
  );

  const latest = locations[locations.length - 1];

  if (!latest) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Map belum tersedia</Text>
        <Text style={styles.emptyText}>
          Mulai tracking untuk menampilkan titik lokasi di peta.
        </Text>
      </SafeAreaView>
    );
  }

  const coordinates = locations.map(item => ({
    latitude: item.latitude,
    longitude: item.longitude,
  }));

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latest.latitude,
          longitude: latest.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        <Polyline
          coordinates={coordinates}
          strokeColor="#2563eb"
          strokeWidth={4}
        />
        {locations.map((item, index) => (
          <Marker
            key={`${item.id}-${index}`}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            pinColor={index === locations.length - 1 ? '#dc2626' : '#2563eb'}
            title={index === locations.length - 1 ? 'Lokasi terbaru' : 'Lokasi'}
            description={`${new Date(item.timestamp).toLocaleString()} | ${
              item.synced ? 'synced' : 'pending'
            }`}
          />
        ))}
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Lokasi Terbaru</Text>
        <Text style={styles.overlayCoordinate}>
          {latest.latitude.toFixed(6)}, {latest.longitude.toFixed(6)}
        </Text>
        <Text style={styles.overlayMeta}>
          {new Date(latest.timestamp).toLocaleString()} |{' '}
          {latest.geofenceStatus}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    bottom: 18,
    left: 18,
    padding: 14,
    position: 'absolute',
    right: 18,
  },
  overlayTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  overlayCoordinate: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
  },
  overlayMeta: {
    color: '#64748b',
    marginTop: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
  },
});
