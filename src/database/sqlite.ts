import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(false);

const db = SQLite.openDatabase({
  name: 'tracking.db',
  location: 'default',
});

const migrationStatements = [
  'ALTER TABLE locations ADD COLUMN accuracy REAL',
  'ALTER TABLE locations ADD COLUMN source TEXT',
  'ALTER TABLE locations ADD COLUMN geofenceStatus TEXT',
  'ALTER TABLE locations ADD COLUMN geofenceName TEXT',
  'ALTER TABLE locations ADD COLUMN retryCount INTEGER DEFAULT 0',
  'ALTER TABLE locations ADD COLUMN lastSyncAttempt TEXT',
];

export function initDB() {
  db.transaction((tx: any) => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS locations(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL,
        timestamp TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        source TEXT NOT NULL DEFAULT 'foreground',
        geofenceStatus TEXT,
        geofenceName TEXT,
        retryCount INTEGER NOT NULL DEFAULT 0,
        lastSyncAttempt TEXT
      )
    `);

    migrationStatements.forEach(statement => {
      tx.executeSql(statement, [], undefined, () => false);
    });
  });
}

export default db;
