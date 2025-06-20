import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { AlertNotificationRoot } from "react-native-alert-notification";
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import LottieView from 'lottie-react-native';
import '../languages/i18n'; // Importa la configuración de i18n

// Evita que la pantalla de carga desaparezca antes de que se carguen los assets
SplashScreen.preventAutoHideAsync();

const CustomSplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const colorScheme = useColorScheme();
  const [animationFinished, setAnimationFinished] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  
  useEffect(() => {
    // Timer mínimo de 3 segundos
    const timer = setTimeout(() => {
      setTimerFinished(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Solo cierra cuando ambos hayan terminado
    if (animationFinished && timerFinished) {
      onFinish();
    }
  }, [animationFinished, timerFinished, onFinish]);
  
  return (
    <View style={[
      styles.splashContainer, 
      { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }
    ]}>
      <LottieView
        source={require('../assets/images/splashScreen.json')}
        autoPlay
        loop={false}
        onAnimationFinish={() => setAnimationFinished(true)}
        style={styles.lottieAnimation}
        resizeMode="contain"
        renderMode="AUTOMATIC"
        speed={1}
      />
    </View>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Espera a que las fuentes se carguen
        if (loaded) {
          // Oculta el splash screen nativo de Expo INMEDIATAMENTE
          await SplashScreen.hideAsync();
          // Marca la app como lista
          setAppReady(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, [loaded]);

  const handleSplashFinish = () => {
    setShowCustomSplash(false);
  };

  // Mientras las fuentes no se carguen, mantén una pantalla básica
  if (!loaded || !appReady) {
    return (
      <View style={[
        styles.loadingContainer, 
        { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }
      ]} />
    );
  }

  // Muestra el splash screen personalizado
  if (showCustomSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  // Renderiza la aplicación principal
  return (
    <ActionSheetProvider>
      <AlertNotificationRoot>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="+not-found" />
            <Stack.Screen 
              name="screens/operators/OperatorView" 
              options={{ presentation: 'modal' }} 
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
        <Toast />
      </AlertNotificationRoot>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 300,
    height: 300,
    // Para iOS, asegúrate de que la animación se vea bien
    maxWidth: '80%',
    maxHeight: '80%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});