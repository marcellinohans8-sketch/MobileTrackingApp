import NetInfo from '@react-native-community/netinfo';
import {
  listPendingLocations,
  markLocationSyncAttempt,
  markLocationSynced,
} from '../data/locationRepository';
import { sendLocation } from './socketService';
import { retryQueue } from '../../../utils/retry';

let syncing = false;

export async function syncPendingLocations() {
  if (syncing) {
    return {synced: 0, failed: 0};
  }

  const networkState = await NetInfo.fetch();

  if (!networkState.isConnected) {
    return {synced: 0, failed: 0};
  }

  syncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const pendingLocations = await listPendingLocations();

    for (const item of pendingLocations) {
      try {
        await retryQueue(() => sendLocation(item), {
          retries: 3,
          initialDelayMs: 1000,
          maxDelayMs: 8000,
        });
        await markLocationSynced(item.id!);
        synced += 1;
      } catch {
        await markLocationSyncAttempt(item.id!);
        failed += 1;
      }
    }

    return {synced, failed};
  } finally {
    syncing = false;
  }
}

export function autoSync() {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncPendingLocations();
    }
  });

  syncPendingLocations();

  return unsubscribe;
}
