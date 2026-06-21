import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { saveLocation } from '../data/locationRepository';
import { TrackingSource } from '../domain/location';
import { evaluateGeofence } from './geofenceService';
import { syncPendingLocations } from './syncService';

const TRACKING_INTERVAL_MS = 10000;

let timerId: ReturnType<typeof setInterval> | null = null;

async function requestAndroidPermission() {
  const fineLocation = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  return fineLocation === PermissionsAndroid.RESULTS.GRANTED;
}

export async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    return requestAndroidPermission();
  }

  const authorization = await Geolocation.requestAuthorization('whenInUse');
  return authorization === 'granted';
}

export function captureLocation(source: TrackingSource = 'foreground') {
  return new Promise<number>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const geofence = evaluateGeofence({ latitude, longitude });
          const locationId = await saveLocation({
            latitude,
            longitude,
            accuracy,
            timestamp: new Date(position.timestamp).toISOString(),
            source,
            geofenceName: geofence.geofenceName,
            geofenceStatus: geofence.geofenceStatus,
          });

          syncPendingLocations();
          resolve(locationId);
        } catch (error) {
          reject(error);
        }
      },
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      },
    );
  });
}

export async function startTracking(onTick?: () => void) {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  if (timerId) {
    return;
  }

  await captureLocation('foreground');
  onTick?.();

  timerId = setInterval(() => {
    captureLocation('foreground').finally(() => onTick?.());
  }, TRACKING_INTERVAL_MS);
}

export function stopTracking() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

export function isTrackingActive() {
  return timerId !== null;
}
