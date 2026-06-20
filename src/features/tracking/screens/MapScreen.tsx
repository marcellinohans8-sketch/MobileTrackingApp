import React, { useEffect, useState } from 'react';

import { View } from 'react-native';

import MapView, { Marker } from 'react-native-maps';

import db from '../../../database/sqlite';

export default function MapScreen() {
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        `
SELECT *
FROM locations
ORDER BY id DESC
LIMIT 1
`,

        [],

        (_, result) => {
          if (result.rows.length) {
            setLocation(result.rows.item(0));
          }
        },
      );
    });
  }, []);

  if (!location) return null;

  return (
    <MapView
      style={{
        flex: 1,
      }}
      initialRegion={{
        latitude: location.latitude,

        longitude: location.longitude,

        latitudeDelta: 0.01,

        longitudeDelta: 0.01,
      }}
    >
      <Marker
        coordinate={{
          latitude: location.latitude,

          longitude: location.longitude,
        }}
      />
    </MapView>
  );
}
