import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

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
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  const handleCameraCapture = async () => {
    try {
      setIsLoading(true);
      setShowModal(false);
      
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
        }, 500);
        return;
      }
      
      // Configuración para ambas plataformas
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing,
        aspect,
        quality,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
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
      setShowModal(false);
      
      // Request gallery permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setTimeout(() => {
          Alert.alert(
            t('permission_denied'),
            t('allow_photo_access'),
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
        }, 500);
        return;
      }
      
      // Configuración para ambas plataformas
      // Configuration for both platforms
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing,
        aspect,
        quality,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
        ...(maxWidth && { maxWidth }),
        ...(maxHeight && { maxHeight }),
      };
      
      const result = await ImagePicker.launchImageLibraryAsync(options);
      const normalizedImage = normalizeImageInfo(result);
      
      if (normalizedImage) {
        onImageSelected(normalizedImage);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      setTimeout(() => {
        Alert.alert(t('error'), t('failed_to_select_image'));
      }, 500);
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
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.requiredMark}>*</Text>}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.uploadButton,
          error ? styles.uploadButtonError : null,
          image ? styles.uploadButtonWithImage : null
        ]}
        onPress={() => setShowModal(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#0458AB" />
        ) : image ? (
          renderImagePreview()
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>{t('upload_image')}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal para seleccionar fuente de imagen */}
      {/* Modal to select image source */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('select_image_source')}</Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCameraCapture}
            >
              <Text style={styles.modalButtonText}>{t('take_photo')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleGalleryPick}
            >
              <Text style={styles.modalButtonText}>{t('choose_from_gallery')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#f9f9f9',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20, 
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButton: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#0458AB',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 14,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CrossPlatformImageUpload;