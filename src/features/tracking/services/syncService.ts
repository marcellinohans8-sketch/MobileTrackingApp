import NetInfo from '@react-native-community/netinfo';

import db from '../../../database/sqlite';

import { sendLocation } from './socketService';

export function autoSync() {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      db.transaction(tx => {
        tx.executeSql(
          `
SELECT *
FROM locations
WHERE synced=0
`,

          [],

          (_, result) => {
            for (let i = 0; i < result.rows.length; i++) {
              let item = result.rows.item(i);

              sendLocation(item);

              tx.executeSql(
                `
UPDATE locations
SET synced=1
WHERE id=?
`,

                [item.id],
              );
            }
          },
        );
      });
    }
  });
}
