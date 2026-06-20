import SQLite from "react-native-sqlite-storage";


const db=SQLite.openDatabase(
{
name:"tracking.db",
location:"default"
}
);


export function initDB(){


db.transaction(tx=>{


tx.executeSql(
`
CREATE TABLE IF NOT EXISTS locations(
id INTEGER PRIMARY KEY AUTOINCREMENT,
latitude REAL,
longitude REAL,
timestamp TEXT,
synced INTEGER
)
`
)


})


}



export default db;