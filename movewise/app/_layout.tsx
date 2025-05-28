import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { AlertNotificationRoot } from "react-native-alert-notification";
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import '../languages/i18n'; // Importa la configuración de i18n
// Evita que la pantalla de carga desaparezca antes de que se carguen los assets
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function hideSplashScreen() {
      if (loaded) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [loaded]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }} />;
  }

  return (
    <ActionSheetProvider>
      <AlertNotificationRoot>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            {/* <Stack.Screen name="home" /> */}
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="screens/operators/OperatorView" options={{ presentation: 'modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
        <Toast />
      </AlertNotificationRoot>
    </ActionSheetProvider>
  );
}
