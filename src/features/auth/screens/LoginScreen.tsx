import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../app/store';
import { login } from '../authSlice';

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();

  function handleLogin() {
    dispatch(
      login({
        id: 1,
        name: 'Hans',
        role: 'Field Officer',
      }),
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Offline First</Text>
        </View>
        <Text style={styles.title}>Mobile Tracking</Text>
        <Text style={styles.subtitle}>
          Pantau lokasi petugas setiap 10 detik, simpan lokal saat offline, dan
          sync otomatis saat koneksi kembali.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Mock Account</Text>
        <Text style={styles.accountName}>Hans</Text>
        <Text style={styles.accountMeta}>Field Officer</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Masuk ke Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'space-between',
    padding: 24,
  },
  hero: {
    paddingTop: 56,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#14b8a6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 18,
  },
  badgeText: {
    color: '#042f2e',
    fontWeight: '800',
    fontSize: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 14,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
  },
  panelLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  accountName: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
  },
  accountMeta: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
