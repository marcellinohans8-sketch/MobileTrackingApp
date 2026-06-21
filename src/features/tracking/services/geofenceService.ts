import { GeofenceStatus } from '../domain/location';

export const OFFICE_GEOFENCE = {
  name: 'Office Zone',
  latitude: -6.2,
  longitude: 106.816666,
  radiusMeters: 250,
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceInMeters(
  from: {latitude: number; longitude: number},
  to: {latitude: number; longitude: number},
) {
  const earthRadius = 6371000;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function evaluateGeofence(point: {
  latitude: number;
  longitude: number;
}): {geofenceName: string; geofenceStatus: GeofenceStatus; distance: number} {
  const distance = distanceInMeters(point, OFFICE_GEOFENCE);

  return {
    geofenceName: OFFICE_GEOFENCE.name,
    geofenceStatus:
      distance <= OFFICE_GEOFENCE.radiusMeters ? 'inside' : 'outside',
    distance,
  };
}
