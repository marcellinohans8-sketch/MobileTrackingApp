import BackgroundGeolocation from 'react-native-background-geolocation';

export function startBackground() {
  BackgroundGeolocation.ready(
    {
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,

      distanceFilter: 10,

      stopOnTerminate: false,

      startOnBoot: true,
    },

    state => {
      if (!state.enabled) {
        BackgroundGeolocation.start();
      }
    },
  );
}
