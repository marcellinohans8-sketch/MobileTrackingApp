# Dokumentasi Arsitektur

## Ringkasan

Mobile Tracking App memakai clean architecture ringan agar logic tracking tidak terkunci di UI. Screen hanya memanggil use case/service, sedangkan operasi SQLite dikumpulkan di repository.

## Layer

### Presentation

Lokasi:

- `src/features/auth/screens`
- `src/features/tracking/screens`
- `src/app/navigation`

Tanggung jawab:

- Menampilkan login, dashboard tracking, riwayat, dan map.
- Memicu start/stop tracking, sync manual, background tracking, dan logout.
- Membaca state auth dari Redux.

### Domain

Lokasi:

- `src/features/tracking/domain/location.ts`

Tanggung jawab:

- Mendefinisikan model `LocationPoint`, `NewLocationPoint`, `TrackingSource`, dan `GeofenceStatus`.

### Data

Lokasi:

- `src/database/sqlite.ts`
- `src/features/tracking/data/locationRepository.ts`

Tanggung jawab:

- Inisialisasi database SQLite dan migration kolom.
- Insert lokasi baru.
- Query history/latest/pending.
- Mark data sebagai synced atau mencatat percobaan sync.

### Services

Lokasi:

- `src/features/tracking/services/locationService.ts`
- `src/features/tracking/services/syncService.ts`
- `src/features/tracking/services/socketService.ts`
- `src/features/tracking/services/backgroundService.ts`
- `src/features/tracking/services/geofenceService.ts`
- `src/utils/retry.ts`

Tanggung jawab:

- Request permission lokasi.
- Capture lokasi foreground setiap 10 detik.
- Background tracking.
- Evaluasi geofence.
- Auto sync saat online.
- Kirim data melalui Socket.IO.
- Retry queue dengan exponential backoff.

## Alur Tracking

1. User login menggunakan akun mock.
2. User menekan `Start Tracking`.
3. App meminta permission lokasi.
4. App mengambil lokasi saat ini, lalu mengulang setiap 10 detik.
5. Setiap lokasi dievaluasi terhadap geofence.
6. Lokasi disimpan ke SQLite dengan `synced = 0`.
7. App mencoba sync pending data ke Socket.IO.
8. Jika offline atau socket gagal, data tetap pending.
9. Saat koneksi kembali, `autoSync` mengambil data pending dan retry pengiriman.
10. Jika pengiriman berhasil, data ditandai `synced = 1`.

## Offline First

Database lokal adalah sumber data utama. Network tidak menjadi syarat penyimpanan lokasi. Semua screen membaca data dari SQLite, sehingga riwayat dan map tetap dapat dibuka ketika offline.

## Geofencing

`geofenceService` memakai `OFFICE_GEOFENCE` sebagai area default:

- Nama: `Office Zone`
- Koordinat: `-6.2, 106.816666`
- Radius: `250 meter`

Setiap lokasi disimpan dengan status `inside` atau `outside`.

## WebSocket

`socketService` menggunakan Socket.IO client dan mengirim event:

```text
location:update
```

Endpoint default:

```text
http://10.0.2.2:3000
```

Untuk device fisik, ganti endpoint ke IP komputer/server yang dapat diakses device.

## Risiko dan Pengembangan Lanjutan

- Untuk produksi, endpoint socket sebaiknya dipindahkan ke env/config.
- Auth saat ini mock sesuai studi kasus, belum memakai backend token.
- Background tracking membutuhkan pengujian langsung di device karena behavior Android/iOS berbeda.
- Server Socket.IO idealnya memberi ack agar app dapat memastikan data benar-benar diterima server.
