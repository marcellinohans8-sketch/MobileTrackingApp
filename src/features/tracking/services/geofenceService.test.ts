import { OFFICE_GEOFENCE, evaluateGeofence } from './geofenceService';

test('geofence marks point inside the office radius', () => {
  const result = evaluateGeofence({
    latitude: OFFICE_GEOFENCE.latitude,
    longitude: OFFICE_GEOFENCE.longitude,
  });

  expect(result.geofenceStatus).toBe('inside');
});

test('geofence marks far point outside the office radius', () => {
  const result = evaluateGeofence({
    latitude: OFFICE_GEOFENCE.latitude + 1,
    longitude: OFFICE_GEOFENCE.longitude + 1,
  });

  expect(result.geofenceStatus).toBe('outside');
});
