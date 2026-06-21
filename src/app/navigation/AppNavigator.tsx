import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import HistoryScreen from '../../features/tracking/screens/HistoryScreen';
import MapScreen from '../../features/tracking/screens/MapScreen';
import TrackingScreen from '../../features/tracking/screens/TrackingScreen';

export type RootStackParamList = {
  Login: undefined;
  Tracking: undefined;
  History: undefined;
  Map: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const isLogin = useSelector((state: RootState) => state.auth.isLogin);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#f8fafc' },
        }}>
        {!isLogin ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Tracking"
              component={TrackingScreen}
              options={{ title: 'Live Tracking' }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: 'Riwayat Lokasi' }}
            />
            <Stack.Screen
              name="Map"
              component={MapScreen}
              options={{ title: 'Peta Lokasi' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
