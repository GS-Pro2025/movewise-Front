import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
  useColorScheme
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useActionSheet } from '@expo/react-native-action-sheet';
import colors from '@/app/Colors';

export interface ImageInfo {
  uri: string;
  name?: string;
  type?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  exif?: any;
}

// Props del componente de carga de imagen
export interface ImageUploadProps {
  label: string;
  image: ImageInfo | null;
  onImageSelected: (image: ImageInfo) => void;
  error?: string;
  required?: boolean;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspect?: [number, number];
  allowsEditing?: boolean;
}


const CrossPlatformImageUpload: React.FC<ImageUploadProps> = ({
  label,
  image,
  onImageSelected,
  error,
  required = false,
  quality = 0.8,
  maxWidth,
  maxHeight,
  aspect = [4, 3],
  allowsEditing = true
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  /**
   * Normalizes image information to be consistent across platforms
   */
  const normalizeImageInfo = (result: ImagePicker.ImagePickerResult): ImageInfo | null => {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileNameMatch = asset.uri.split('/').pop() || '';
    const fileExtMatch = /\.(\w+)$/.exec(fileNameMatch);
    const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : 'jpg';
    const mimeType = fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' : `image/${fileExt}`;

    return {
      uri: asset.uri,
      name: fileNameMatch || `image_${Date.now()}.${fileExt}`,
      type: mimeType,
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
      exif: asset.exif
    };
  };


  /**
   * Manages image selection from the camera
   */
  const handleImageSelection = () => {
    const options = [
      t('take_photo'),
      t('choose_from_gallery'),
      t('cancel')
    ];
    
    const cancelButtonIndex = 2;
    
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        // Para iOS podemos añadir un título y mensaje descriptivo
        title: t('select_image_source'),
        message: t('how_would_you_like_to_add_a_photo'),
        // Índice del botón destructivo (rojo) - ninguno en este caso
        destructiveButtonIndex: undefined,
        // Podemos también personalizar el estilo en iOS
        userInterfaceStyle: 'light',
        // Usamos la API de anchorToView para tablets en iOS (opcional)
        // containerStyle: { ... } // estilos adicionales si necesitas
      },
      async (buttonIndex) => {
        if (buttonIndex === 0) {
          // Take photo
          await handleCameraCapture();
        } else if (buttonIndex === 1) {
          // Choose from gallery
          await handleGalleryPick();
        }
        // Si es cancelButtonIndex, no hacemos nada
      }
    );
  };
  const handleCameraCapture = async () => {
    try {
      setIsLoading(true);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        setTimeout(() => {
          Alert.alert(
            t('permission_required'),
            t('camera_permission_needed'),
            [
              { text: t('cancel'), style: 'cancel' },
              {
                text: t('settings'),
                onPress: () => Platform.OS === 'ios' ?
                  // En iOS, abre la configuración de la app
                  // On iOS, open the app settings
                  Linking.openURL('app-settings:') :
                  // En Android, intenta abrir la configuración de la app
                  // On Android, try opening the app settings
                  Linking.openSettings()
              }
            ]
          );
        }, 300);
        return;
      }

      // Configuración para ambas plataformas usando la nueva API
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing,
        aspect,
        quality,
        ...(maxWidth && { maxWidth }),
        ...(maxHeight && { maxHeight }),
      };

      const result = await ImagePicker.launchCameraAsync(options);
      const normalizedImage = normalizeImageInfo(result);

      if (normalizedImage) {
        onImageSelected(normalizedImage);
      }
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      setTimeout(() => {
        Alert.alert(t('error'), t('failed_to_capture_image'));
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manages the selection of images from the gallery.
   */
  const handleGalleryPick = async () => {
    try {
      setIsLoading(true);

      // Solicitar permisos usando requestMediaLibraryPermissionsAsync directamente
      // Request permissions using requestMediaLibraryPermissionsAsync directly
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setTimeout(() => {
          Alert.alert(
            t('permission_required'),
            t('gallery_permission_needed'),
            [
              { text: t('cancel'), style: 'cancel' },
              {
                text: t('settings'),
                onPress: () => Platform.OS === 'ios' ?
                  Linking.openURL('app-settings:') :
                  Linking.openSettings()
              }
            ]
          );
        }, 300);
        return;
      }

      // Configuración simplificada para ambas plataformas usando la nueva API
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing,
        aspect,
        quality,
        ...(maxWidth && { maxWidth }),
        ...(maxHeight && { maxHeight }),
      };

      // Usar el método correcto sin opciones específicas de plataforma problemáticas
      const result = await ImagePicker.launchImageLibraryAsync(options);
      
      // Procesar el resultado solo si no fue cancelado
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const normalizedImage = normalizeImageInfo(result);
        if (normalizedImage) {
          onImageSelected(normalizedImage);
        }
      }
    } catch (error) {
      console.error('Error en selección de imagen:', error);
      setTimeout(() => {
        Alert.alert(t('error'), t('failed_to_select_image'));
      }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Renderiza la vista previa de la imagen si existe
   * Renders the image preview if it exists
   */
  const renderImagePreview = () => {
    if (!image) return null;

    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: image.uri }}
          style={styles.imagePreview}
          resizeMode="cover"
        />
        <Text style={styles.imageFilename} numberOfLines={1} ellipsizeMode="middle">
          {image.name || image.uri.split('/').pop() || t('image_selected')}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
      <Text style={[styles.label, { color: isDarkMode ? colors.textDark : colors.primary }]}>
        {label} {required && <Text style={styles.requiredMark}>*</Text>}
      </Text>

      <TouchableOpacity
        style={[
          styles.uploadButton,
          error ? styles.uploadButtonError : null,
          image ? styles.uploadButtonWithImage : null,
          { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }
        ]}
        onPress={handleImageSelection}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#0458AB" />
        ) : image ? (
          renderImagePreview()
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={[styles.placeholderText, { color: isDarkMode ? colors.textDark : colors.primary }]}>{t('upload_image')}</Text>
          </View>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  requiredMark: {
    color: 'red',
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonError: {
    borderColor: 'red',
  },
  uploadButtonWithImage: {
    backgroundColor: '#f0f0f0',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: '#666',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  imagePreview: {
    width: '100%',
    height: '80%',
    backgroundColor: '#e0e0e0',
  },
  imageFilename: {
    fontSize: 12,
    color: '#444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '100%',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CrossPlatformImageUpload;