import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import AppNavigator from './src/app/navigation/AppNavigator';
import { initDB } from './src/database/sqlite';
import { configureBackgroundTracking } from './src/features/tracking/services/backgroundService';
import { autoSync } from './src/features/tracking/services/syncService';

function AppBootstrap() {
  useEffect(() => {
    initDB();
    configureBackgroundTracking();
    const unsubscribeSync = autoSync();

    return () => {
      unsubscribeSync();
    };
  }, []);

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <AppBootstrap />
    </Provider>
  );
}
