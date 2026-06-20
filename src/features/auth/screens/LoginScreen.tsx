import { View, Text, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../authSlice';
export default function LoginScreen({ navigation }: any) {
  const dispatch = useDispatch();
  function handleLogin() {
    dispatch(
      login({
        id: 1,
        name: 'Hans',
      }),
    );
    navigation.replace('Tracking');
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          marginBottom: 20,
        }}
      >
        Mobile Tracking
      </Text>
      <Button title="Mock Login" onPress={handleLogin} />
    </View>
  );
}
