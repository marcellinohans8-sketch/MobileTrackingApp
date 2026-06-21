export type TrackingSource = 'foreground' | 'background';

export type GeofenceStatus = 'inside' | 'outside';

export type LocationPoint = {
  id?: number;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  timestamp: string;
  synced: 0 | 1;
  source: TrackingSource;
  geofenceStatus?: GeofenceStatus | null;
  geofenceName?: string | null;
  retryCount?: number;
  lastSyncAttempt?: string | null;
};

export type NewLocationPoint = Omit<
  LocationPoint,
  'id' | 'synced' | 'retryCount' | 'lastSyncAttempt'
>;
