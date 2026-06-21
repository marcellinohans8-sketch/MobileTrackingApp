# Mobile Tracking App

Aplikasi React Native untuk studi kasus mobile tracking dengan prinsip offline-first.

## Fitur

- Mock login dan logout.
- Tracking lokasi foreground setiap 10 detik.
- Penyimpanan lokal ke SQLite.
- Offline-first: data selalu disimpan lokal lebih dulu.
- Auto sync saat koneksi kembali menggunakan NetInfo.
- Integrasi Socket.IO untuk event `location:update`.
- Halaman dashboard, riwayat lokasi, dan map.
- Background tracking menggunakan `react-native-background-geolocation`.
- Geofencing sederhana untuk `Office Zone`.
- Retry queue dengan exponential backoff.
- Unit test untuk retry queue.
- Struktur clean architecture ringan: `domain`, `data`, `services`, dan `screens`.

## Menjalankan Project

```sh
npm install
npm start
npm run android
```

## Build APK Debug

```sh
cd android
./gradlew assembleDebug
```

Output APK:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Di Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleDebug
```

## Socket.IO Server

Default endpoint ada di:

```ts
src/features/tracking/services/socketService.ts
```

Untuk emulator Android, default menggunakan `http://10.0.2.2:3000`.
Server perlu menerima event dan mengirim ACK agar aplikasi hanya menandai data
sebagai `synced` setelah server benar-benar menerima payload:

```js
socket.on('location:update', (payload, ack) => {
  console.log(payload);
  ack({ success: true });
});
```

Payload berisi `latitude`, `longitude`, `accuracy`, `timestamp`, `source`, `geofenceStatus`, dan status sync lokal.
Jika server membalas `{ success: false, message: '...' }` atau tidak mengirim
ACK dalam 5 detik, data tetap pending dan akan dicoba lagi oleh retry queue.

## Catatan Permission

Android manifest sudah mencakup:

- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_LOCATION`
- `INTERNET`

Background location di Android 10+ tetap membutuhkan approval user dari runtime permission/settings.

## Test

```sh
npm test
```

## Dokumentasi

Lihat [ARCHITECTURE.md](./ARCHITECTURE.md) untuk alur data dan pembagian layer.
