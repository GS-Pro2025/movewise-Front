import React, { useState, useEffect } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '@/app/Colors';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import apiClient from '@/hooks/api/apiClient';
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';
import { ImageInfo } from '@/components/CrossPlatformImageUpload';
interface OperatorFormData {
  number_licence: string;
  code: string;
  n_children: number;
  size_t_shift: string;
  name_t_shift: string;
  salary: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  type_id: string;
  id_number: string;
  address: string;
  phone: string;
  email: string;
}

interface ImageData {
  uri: string;
  type: string;
  name: string;
}

interface EditOperatorModalProps {
  visible: boolean;
  onClose: () => void;
  operator: any;
  onUpdate: (updatedOperator: any) => void;
}

const EditOperatorModal: React.FC<EditOperatorModalProps> = ({ visible, onClose, operator, onUpdate }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [formData, setFormData] = useState<OperatorFormData>({
    number_licence: '',
    code: '',
    n_children: 0,
    size_t_shift: '',
    name_t_shift: '',
    salary: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    type_id: 'ID Card',
    id_number: '',
    address: '',
    phone: '',
    email: ''
  });

  // Estados para las imágenes
  const [selectedImages, setSelectedImages] = useState<{
    photo: ImageData | null;
    licenseFront: ImageData | null;
    licenseBack: ImageData | null;
  }>({
    photo: null,
    licenseFront: null,
    licenseBack: null
  });

  const [imageStatus, setImageStatus] = useState<{
    photo: 'loading' | 'valid' | 'invalid';
    licenseFront: 'loading' | 'valid' | 'invalid';
    licenseBack: 'loading' | 'valid' | 'invalid';
  }>({ photo: 'loading', licenseFront: 'loading', licenseBack: 'loading' });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Colores dinámicos
  const backgroundColor = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBackground = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textDark : colors.textLight;
  const primaryColor = colors.primary;
  const borderColor = isDarkMode ? colors.borderDark : colors.borderLight;

  useEffect(() => {
    if (operator) {
      setFormData({
        number_licence: operator.number_licence || '',
        code: operator.code || '',
        n_children: operator.n_children || 0,
        size_t_shift: operator.size_t_shift || '',
        name_t_shift: operator.name_t_shift || '',
        salary: operator.salary || '',
        first_name: operator.first_name || '',
        last_name: operator.last_name || '',
        birth_date: operator.birth_date || '',
        type_id: operator.type_id || 'ID Card',
        id_number: operator.id_number || '',
        address: operator.address || '',
        phone: operator.phone || '',
        email: operator.email || ''
      });

      // Verificar imágenes existentes
      verifyExistingImages();
    }
  }, [operator]);

  const verifyExistingImages = async () => {
    if (!operator) return;

    const checkImage = async (url: string | null): Promise<'valid' | 'invalid'> => {
      if (!url) return 'invalid';
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok ? 'valid' : 'invalid';
      } catch (error) {
        return 'invalid';
      }
    };

    const [photoStatus, licenseFrontStatus, licenseBackStatus] = await Promise.all([
      checkImage(operator.photo),
      checkImage(operator.license_front),
      checkImage(operator.license_back)
    ]);

    setImageStatus({
      photo: photoStatus,
      licenseFront: licenseFrontStatus,
      licenseBack: licenseBackStatus
    });
  };



  const removeImage = (imageType: 'photo' | 'licenseFront' | 'licenseBack') => {
    setSelectedImages(prev => ({
      ...prev,
      [imageType]: null
    }));
  };

  const handleImageSelected = (imageType: 'photo' | 'licenseFront' | 'licenseBack', imageInfo: ImageInfo) => {
    const imageData: ImageData = {
      uri: imageInfo.uri,
      type: imageInfo.type || 'image/jpeg',
      name: imageInfo.name || `${imageType}_${Date.now()}.jpg`,
    };

    setSelectedImages(prev => ({
      ...prev,
      [imageType]: imageData
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.first_name.trim()) newErrors.first_name = t('first_name_required');
    if (!formData.last_name.trim()) newErrors.last_name = t('last_name_required');
    if (!formData.phone.trim()) newErrors.phone = t('phone_required');
    if (!formData.number_licence.trim()) newErrors.number_licence = t('license_required');
    if (!formData.birth_date.trim()) newErrors.birth_date = t('birth_date_required');
    if (!formData.type_id.trim()) newErrors.type_id = t('id_type_required');
    if (!formData.id_number.trim()) newErrors.id_number = t('id_number_required');
    if (!formData.address.trim()) newErrors.address = t('address_required');

    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t('invalid_email');
    }

    if (!selectedImages.photo && imageStatus.photo !== 'valid') {
      newErrors.photo = t('photo_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const operatorId = operator.id_operator;

      // Crear FormData para el envío
      const formDataToSend = new FormData();

      // Agregar campos de texto
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value.toString());
        }
      });

      // Agregar imágenes si fueron seleccionadas
      if (selectedImages.photo) {
        formDataToSend.append('photo', {
          uri: selectedImages.photo.uri,
          type: selectedImages.photo.type,
          name: selectedImages.photo.name,
        } as any);
      }

      if (selectedImages.licenseFront) {
        formDataToSend.append('license_front', {
          uri: selectedImages.licenseFront.uri,
          type: selectedImages.licenseFront.type,
          name: selectedImages.licenseFront.name,
        } as any);
      }

      if (selectedImages.licenseBack) {
        formDataToSend.append('license_back', {
          uri: selectedImages.licenseBack.uri,
          type: selectedImages.licenseBack.type,
          name: selectedImages.licenseBack.name,
        } as any);
      }

      const response = await apiClient.patch(
        `/operators/update/${operatorId}/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 200) {
        onUpdate(response.data.data);

        const currentUserId = await AsyncStorage.getItem('currentUserId');
        if (currentUserId === operatorId.toString()) {
          await AsyncStorage.setItem('currentUser', JSON.stringify(response.data.data));
        }

        Toast.show({
          type: 'success',
          text1: t('update_success'),
          text2: response.data.message
        });
        onClose();
      } else {
        throw new Error(response.data.message || t('update_error'));
      }
    } catch (error: any) {
      console.error('Update error:', error.response?.data || error.message);

      let errorMessage = t('update_error');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else {
          errorMessage = firstError as string;
        }
      }

      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof OperatorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'n_children' ? parseInt(value) || 0 : value
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={primaryColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: primaryColor }]}>
            {t("edit_profile")}
          </Text>
          <TouchableOpacity onPress={handleUpdate} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={primaryColor} />
            ) : (
              <Ionicons name="checkmark" size={24} color={primaryColor} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Sección de Imágenes */}
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: primaryColor }]}>
              {t("images") || "Images"}
            </Text>

            {/* Foto del operario */}
            <View style={styles.imageSection}>
              <CrossPlatformImageUpload
                label={t('operator_photo') || 'Operator Photo'}
                image={
                  selectedImages.photo
                    ? { uri: selectedImages.photo.uri }
                    : (imageStatus.photo === 'valid' && operator?.photo)
                      ? { uri: operator.photo }
                      : null
                }
                onImageSelected={(img) => handleImageSelected('photo', img)}
                error={errors.photo}
                required
                aspect={[1, 1]}
                allowsEditing={true}
              />
            </View>

            {/* Licencia frontal */}
            <View style={styles.imageSection}>
              <CrossPlatformImageUpload
                label={t('license_front') || 'License Front'}
                image={
                  selectedImages.licenseFront
                    ? { uri: selectedImages.licenseFront.uri }
                    : (imageStatus.licenseFront === 'valid' && operator?.license_front)
                      ? { uri: operator.license_front }
                      : null
                }
                onImageSelected={(img) => handleImageSelected('licenseFront', img)}
                aspect={[16, 10]}
                allowsEditing={true}
              />
              {(selectedImages.licenseFront || imageStatus.licenseFront === 'valid') && (
                <TouchableOpacity
                  style={[styles.removeButton, { borderColor: colors.warning }]}
                  onPress={() => removeImage('licenseFront')}
                >
                  <Ionicons name="trash" size={16} color={colors.warning} />
                  <Text style={[styles.removeButtonText, { color: colors.warning }]}>
                    {t('remove') || 'Remove'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Licencia trasera */}
            <View style={styles.imageSection}>
              <CrossPlatformImageUpload
                label={t('license_back') || 'License Back'}
                image={
                  selectedImages.licenseBack
                    ? { uri: selectedImages.licenseBack.uri }
                    : (imageStatus.licenseBack === 'valid' && operator?.license_back)
                      ? { uri: operator.license_back }
                      : null
                }
                onImageSelected={(img) => handleImageSelected('licenseBack', img)}
                aspect={[16, 10]}
                allowsEditing={true}
              />
              {(selectedImages.licenseBack || imageStatus.licenseBack === 'valid') && (
                <TouchableOpacity
                  style={[styles.removeButton, { borderColor: colors.warning }]}
                  onPress={() => removeImage('licenseBack')}
                >
                  <Ionicons name="trash" size={16} color={colors.warning} />
                  <Text style={[styles.removeButtonText, { color: colors.warning }]}>
                    {t('remove') || 'Remove'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Información Personal */}
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: primaryColor }]}>
              {t("personal_info")}
            </Text>

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.first_name ? colors.warning : borderColor
              }]}
              placeholder={t("first_name")}
              value={formData.first_name}
              onChangeText={text => handleChange('first_name', text)}
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.last_name ? colors.warning : borderColor
              }]}
              placeholder={t("last_name")}
              value={formData.last_name}
              onChangeText={text => handleChange('last_name', text)}
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.email ? colors.warning : borderColor
              }]}
              placeholder={t("email")}
              value={formData.email}
              onChangeText={text => handleChange('email', text)}
              keyboardType="email-address"
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.phone ? colors.warning : borderColor
              }]}
              placeholder={t("phone")}
              value={formData.phone}
              onChangeText={text => handleChange('phone', text)}
              keyboardType="phone-pad"
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.address ? colors.warning : borderColor
              }]}
              placeholder={t("address")}
              value={formData.address}
              onChangeText={text => handleChange('address', text)}
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.birth_date ? colors.warning : borderColor
              }]}
              placeholder={t("birth_date") + " (YYYY-MM-DD)"}
              value={formData.birth_date}
              onChangeText={text => handleChange('birth_date', text)}
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.birth_date && <Text style={styles.errorText}>{errors.birth_date}</Text>}

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.type_id ? colors.warning : borderColor
              }]}
              placeholder={t("id_type")}
              value={formData.type_id}
              onChangeText={text => handleChange('type_id', text)}
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.type_id && <Text style={styles.errorText}>{errors.type_id}</Text>}

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.id_number ? colors.warning : borderColor
              }]}
              placeholder={t("id_number")}
              value={formData.id_number}
              onChangeText={text => handleChange('id_number', text)}
              keyboardType="numeric"
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.id_number && <Text style={styles.errorText}>{errors.id_number}</Text>}
          </View>

          {/* Información Profesional */}
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: primaryColor }]}>
              {t("professional_info")}
            </Text>

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.number_licence ? colors.warning : borderColor
              }]}
              placeholder={t("license_number")}
              value={formData.number_licence}
              onChangeText={text => handleChange('number_licence', text)}
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.number_licence && <Text style={styles.errorText}>{errors.number_licence}</Text>}

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.code ? colors.warning : borderColor
              }]}
              placeholder={t("operator_code")}
              value={formData.code}
              onChangeText={text => handleChange('code', text)}
              placeholderTextColor={colors.placeholderDark}
            />

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.n_children ? colors.warning : borderColor
              }]}
              placeholder={t("number_of_children")}
              value={formData.n_children.toString()}
              onChangeText={text => handleChange('n_children', text)}
              keyboardType="numeric"
              placeholderTextColor={colors.placeholderDark}
            />

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.size_t_shift ? colors.warning : borderColor
              }]}
              placeholder={t("shift_size")}
              value={formData.size_t_shift}
              onChangeText={text => handleChange('size_t_shift', text)}
              placeholderTextColor={colors.placeholderDark}
            />

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.name_t_shift ? colors.warning : borderColor
              }]}
              placeholder={t("shift_name")}
              value={formData.name_t_shift}
              onChangeText={(text: string) => handleChange('name_t_shift', text)}
              placeholderTextColor={colors.placeholderDark}
            />

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.salary ? colors.warning : borderColor
              }]}
              placeholder={t("salary")}
              value={formData.salary}
              onChangeText={text => handleChange('salary', text)}
              keyboardType="numeric"
              placeholderTextColor={colors.placeholderDark}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  errorText: {
    color: colors.warning,
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  // Estilos para imágenes
  imageSection: {
    marginBottom: 20,
  },
  imageTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  imageContainer: {
    height: 150,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  circularContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  circularImage: {
    borderRadius: 75,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default EditOperatorModal;