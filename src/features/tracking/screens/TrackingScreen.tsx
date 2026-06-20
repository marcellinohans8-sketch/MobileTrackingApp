import React, { useState } from 'react';

import { View, Text, Button, StyleSheet } from 'react-native';

import { startTracking } from '../services/locationService';

import db from '../../../database/sqlite';

export default function TrackingScreen({ navigation }: any) {
  const [tracking, setTracking] = useState(false);

  const [location, setLocation] = useState<any>(null);

  let watchId: any;

  function start() {
    watchId = startTracking();

    setTracking(true);
  }

  function stop() {
    if (watchId) {
      useNavigation.geolocation.clearWatch(watchId);
    }

    setTracking(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracking Location</Text>

      <Text>Status :{tracking ? ' ACTIVE' : ' STOPPED'}</Text>

      <Button title="Start Tracking" onPress={start} />

      <Button title="Stop Tracking" onPress={stop} />

      <Button title="History" onPress={() => navigation.navigate('History')} />

      <Button title="Map" onPress={() => navigation.navigate('Map')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    fontSize: 25,
    marginBottom: 20,
  },
});
