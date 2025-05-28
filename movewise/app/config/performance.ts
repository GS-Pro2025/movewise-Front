import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';

export const usePerformance = () => {
  const [fontsLoaded] = useFonts({
    // Aquí puedes agregar tus fuentes personalizadas
    // Por ejemplo:
    // 'Inter': require('./assets/fonts/Inter-Regular.ttf'),
  });

  // Optimizaciones específicas para iOS
  const optimizeForIOS = () => {
    if (Platform.OS === 'ios') {
      // Configuración de cache para imágenes
      const imageCacheOptions = {
        maximumCacheSize: 500 * 1024 * 1024, // 500MB
        maximumDiskCacheSize: 1000 * 1024 * 1024, // 1GB
      };

      // Configuración de memoria
      const memoryOptions = {
        imageMemoryCacheSize: 200 * 1024 * 1024, // 200MB
      };

      return {
        imageCacheOptions,
        memoryOptions,
      };
    }
    return null;
  };

  // Optimizaciones específicas para Android
  const optimizeForAndroid = () => {
    if (Platform.OS === 'android') {
      // Configuración de hardware acceleration
      const hardwareAcceleration = {
        enable: true,
        priority: 'high',
      };

      // Configuración de cache
      const cacheSettings = {
        maximumCacheSize: 200 * 1024 * 1024, // 200MB
        maximumDiskCacheSize: 500 * 1024 * 1024, // 500MB
      };
    }
  };

  // Inicialización general
  const initialize = () => {
    // Cargar fuentes
    if (!fontsLoaded) {
      return;
    }

    // Aplicar optimizaciones según plataforma
    if (Platform.OS === 'ios') {
      optimizeForIOS();
    } else if (Platform.OS === 'android') {
      optimizeForAndroid();
    }

    // Finalizar splash screen
    SplashScreen.hideAsync();
  };

  const performanceSettings = optimizeForIOS();

  return {
    initialize,
    fontsLoaded,
    performanceSettings,
    ready: fontsLoaded,
  };
};

export default usePerformance;
