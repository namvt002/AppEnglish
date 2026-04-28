import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootTabs } from './src/navigation/RootTabs';
import { getDatabase } from './src/db/database';
import { rescheduleAllNotifications } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    void (async () => {
      await getDatabase();
      await rescheduleAllNotifications();
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
