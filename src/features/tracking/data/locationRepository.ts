import db from '../../../database/sqlite';
import { LocationPoint, NewLocationPoint } from '../domain/location';

function rowsToArray<T>(rows: any): T[] {
  const items: T[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    items.push(rows.item(i));
  }

  return items;
}

function executeSql<T = unknown>(sql: string, params: unknown[] = []) {
  return new Promise<T>((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        sql,
        params,
        (_: any, result: any) => resolve(result as T),
        (_: any, error: any) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

export async function saveLocation(point: NewLocationPoint) {
  const result: any = await executeSql(
    `
      INSERT INTO locations
        (latitude, longitude, accuracy, timestamp, synced, source, geofenceStatus, geofenceName)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?)
    `,
    [
      point.latitude,
      point.longitude,
      point.accuracy ?? null,
      point.timestamp,
      point.source,
      point.geofenceStatus ?? null,
      point.geofenceName ?? null,
    ],
  );

  return result.insertId as number;
}

export async function listLocations(limit = 100) {
  const result: any = await executeSql(
    `
      SELECT *
      FROM locations
      ORDER BY id DESC
      LIMIT ?
    `,
    [limit],
  );

  return rowsToArray<LocationPoint>(result.rows);
}

export async function getLatestLocation() {
  const result: any = await executeSql(
    `
      SELECT *
      FROM locations
      ORDER BY id DESC
      LIMIT 1
    `,
  );

  return rowsToArray<LocationPoint>(result.rows)[0] ?? null;
}

export async function listPendingLocations(limit = 50) {
  const result: any = await executeSql(
    `
      SELECT *
      FROM locations
      WHERE synced = 0
      ORDER BY id ASC
      LIMIT ?
    `,
    [limit],
  );

  return rowsToArray<LocationPoint>(result.rows);
}

export function markLocationSynced(id: number) {
  return executeSql(
    `
      UPDATE locations
      SET synced = 1,
          lastSyncAttempt = ?,
          retryCount = retryCount + 1
      WHERE id = ?
    `,
    [new Date().toISOString(), id],
  );
}

export function markLocationSyncAttempt(id: number) {
  return executeSql(
    `
      UPDATE locations
      SET lastSyncAttempt = ?,
          retryCount = retryCount + 1
      WHERE id = ?
    `,
    [new Date().toISOString(), id],
  );
}

export async function getLocationStats() {
  const result: any = await executeSql(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN synced = 1 THEN 1 ELSE 0 END) as synced,
      SUM(CASE WHEN synced = 0 THEN 1 ELSE 0 END) as pending
    FROM locations
  `);

  const stats = result.rows.item(0);

  return {
    total: Number(stats.total ?? 0),
    synced: Number(stats.synced ?? 0),
    pending: Number(stats.pending ?? 0),
  };
}
