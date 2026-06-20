import Geolocation from 'react-native-geolocation-service';
import { sendLocation } from './socketService';
import db from '../../../database/sqlite';

export function startTracking() {
  return Geolocation.watchPosition(
    position => {
      const { latitude, longitude } = position.coords;

      db.transaction(tx => {
        tx.executeSql(
          `
INSERT INTO locations
(latitude,longitude,timestamp,synced)
VALUES (?,?,?,?)
sendLocation({

latitude,

longitude,

timestamp:new Date()

})
`,

          [latitude, longitude, new Date().toISOString(), 0],
        );
      });
    },

    error => console.log(error),

    {
      enableHighAccuracy: true,
      distanceFilter: 0,
      interval: 10000,
      fastestInterval: 10000,
    },
  );
}
