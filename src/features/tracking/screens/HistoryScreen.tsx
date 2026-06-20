import React, { useEffect, useState } from 'react';

import { View, Text, FlatList } from 'react-native';

import db from '../../../database/sqlite';

export default function HistoryScreen() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        `
SELECT * FROM locations
ORDER BY id DESC
`,
        [],
        (_, result) => {
          let rows = [];

          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }

          setData(rows);
        },
      );
    });
  }, []);

  return (
    <View
      style={{
        padding: 20,
      }}
    >
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              marginBottom: 15,
            }}
          >
            <Text>Latitude : {item.latitude}</Text>

            <Text>Longitude : {item.longitude}</Text>

            <Text>Time : {item.timestamp}</Text>
          </View>
        )}
      />
    </View>
  );
}
