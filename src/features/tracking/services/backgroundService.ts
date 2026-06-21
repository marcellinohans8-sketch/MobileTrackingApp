import BackgroundGeolocation from 'react-native-background-geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import { saveLocation } from '../data/locationRepository';
import { evaluateGeofence } from './geofenceService';
import { syncPendingLocations } from './syncService';

let configured = false;

export function configureBackgroundTracking() {
  if (configured) {
    return;
  }

  configured = true;

  BackgroundGeolocation.onLocation(async location => {
    const { latitude, longitude, accuracy } = location.coords;
    const geofence = evaluateGeofence({ latitude, longitude });

    await saveLocation({
      latitude,
      longitude,
      accuracy,
      timestamp: new Date(location.timestamp).toISOString(),
      source: 'background',
      geofenceName: geofence.geofenceName,
      geofenceStatus: geofence.geofenceStatus,
    });

    syncPendingLocations();
  });

  BackgroundGeolocation.ready({
    geolocation: {
      desiredAccuracy: BackgroundGeolocation.DesiredAccuracy.High,
      distanceFilter: 10,
    },
    logger: {
      logLevel: BackgroundGeolocation.LogLevel.Off,
    },
    app: {
      stopOnTerminate: false,
      startOnBoot: true,
      preventSuspend: true,
    },
  });
}

export function startBackgroundTracking() {
  configureBackgroundTracking();

  if (Platform.OS === 'android' && Number(Platform.Version) >= 29) {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    );
  }

  BackgroundGeolocation.start();
}

export function stopBackgroundTracking() {
  BackgroundGeolocation.stop();
}
