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
  Alert
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '../Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import apiClient from '@/hooks/api/apiClient';
import { AdminInfo, PersonInfo } from '@/hooks/api/GetAdminByToken';
import { getPersonIdFromToken } from '@/utils/decodeToken';
import CrossPlatformImageUpload, { ImageInfo } from '@/components/CrossPlatformImageUpload';
import * as FileSystem from 'expo-file-system';

interface AdminFormData {
  user_name: string;
  password?: string;
  person: Omit<PersonInfo, 'phone' | 'id_company'> & {
    phone: number | null;
    birth_date: string;
  };
}

interface EditAdminModalProps {
  visible: boolean;
  onClose: () => void;
  admin: AdminInfo | null;
  onUpdate: (updatedAdmin: AdminInfo) => void;
}

const EditAdminModal: React.FC<EditAdminModalProps> = ({ visible, onClose, admin, onUpdate }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [profilePhoto, setProfilePhoto] = useState<ImageInfo | null>(null);
  const [formData, setFormData] = useState<AdminFormData>({
    user_name: '',
    password: '',
    person: {
      email: '',
      first_name: '',
      last_name: '',
      phone: 0,
      address: '',
      birth_date: '',
      id_number: '',
      type_id: 'ID Card'
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (admin) {
      setFormData({
        user_name: admin.user_name,
        password: '',
        person: {
          email: admin.person.email,
          first_name: admin.person.first_name,
          last_name: admin.person.last_name,
          phone: admin.person.phone,
          address: admin.person.address,
          birth_date: admin.person.birth_date,
          id_number: admin.person.id_number,
          type_id: admin.person.type_id
        }
      });
      if (admin.photo) {
        setProfilePhoto({ uri: admin.photo });
      }
    }
  }, [admin]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.person.email) {
      newErrors.email = t('email_required');
    } else if (!emailRegex.test(formData.person.email)) {
      newErrors.email = t('invalid_email');
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = t('password_length');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let base64Image = null;

      // Convertir imagen a base64
      if (profilePhoto?.uri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(profilePhoto.uri);
          if (fileInfo.exists) {
            const base64 = await FileSystem.readAsStringAsync(profilePhoto.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            base64Image = `data:image/jpeg;base64,${base64}`;
          }
        } catch (error) {
          console.error('Error convirtiendo imagen:', error);
          Toast.show({
            type: 'error',
            text1: t('image_conversion_error'),
          });
          return;
        }
      }

      const payload = {
        user_name: formData.user_name,
        password: formData.password || undefined,
        person: {
          ...formData.person,
          phone: Number(formData.person.phone),
        },
        photo: base64Image 
      };

      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        throw new Error(t('authentication_error'));
      }

      const personId = getPersonIdFromToken(token);

      const response = await apiClient.patch(`/profile/${personId}/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', 
        }
      });

      if (response.data.session_invalidated) {
        await AsyncStorage.clear();
        Toast.show({
          type: 'success',
          text1: t('session_invalidated'),
        });
        router.replace('/Login');
      } else {
        onUpdate(response.data);
        await AsyncStorage.setItem('currentUser', JSON.stringify(response.data));
        Toast.show({
          type: 'success',
          text1: t('update_success'),
        });
        onClose();
      }
    } catch (error: any) {
      console.error('Update error:', error.response?.data);
      const errorMessage = error.response?.data?.error || t('update_error');

      if (error.response?.status === 409) {
        Alert.alert(t('error'), errorMessage);
      } else {
        Toast.show({
          type: 'error',
          text1: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof AdminFormData | keyof AdminFormData['person'],
    value: string,
    isPersonField = false
  ) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (isPersonField) {
        newData.person = {
          ...newData.person,
          [field as keyof AdminFormData['person']]: value
        };
      } else {
        (newData as any)[field] = value;
      }
      return newData;
    });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const backgroundColor = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const textColor = isDarkMode ? colors.darkText : colors.lightText;
  const primaryColor = isDarkMode ? colors.darkText : colors.primary;
  const cardBackground = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const borderColor = isDarkMode ? colors.borderDark : colors.borderLight;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={primaryColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: primaryColor }]}>{t("edit_profile")}</Text>
          <TouchableOpacity onPress={handleUpdate} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={primaryColor} />
            ) : (
              <Ionicons name="checkmark" size={24} color={primaryColor} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>

            <CrossPlatformImageUpload
              label={t("profile_photo")}
              image={profilePhoto}
              onImageSelected={(image) => setProfilePhoto(image)}
              required={false}
            />

            <Text style={[styles.sectionTitle, { color: primaryColor }]}>{t("account_settings")}</Text>

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.user_name ? colors.warning : borderColor
              }]}
              placeholder={t("username")}
              value={formData.user_name}
              onChangeText={text => handleChange('user_name', text)}
              placeholderTextColor={colors.placeholderDark}
            />

            <TextInput
              style={[styles.input, {
                color: textColor,
                borderColor: errors.password ? colors.warning : borderColor
              }]}
              placeholder={t("new_password")}
              value={formData.password}
              onChangeText={text => handleChange('password', text)}
              secureTextEntry
              placeholderTextColor={colors.placeholderDark}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: primaryColor }]}>{t("personal_info")}</Text>

            {Object.entries({
              email: t("email"),
              first_name: t("first_name"),
              last_name: t("last_name"),
              phone: t("phone"),
              address: t("address"),
              birth_date: t("birth_date"),
              id_number: t("id_number"),
              type_id: t("id_type")
            }).map(([field, label]) => (
              <TextInput
                key={field}
                style={[
                  styles.input,
                  {
                    color: textColor,
                    borderColor: errors[field] ? colors.warning : borderColor
                  }
                ]}
                placeholder={label}
                value={formData.person[field as keyof AdminFormData['person']]?.toString() || ''}
                onChangeText={text => handleChange(field as keyof AdminFormData['person'], text, true)}
                keyboardType={
                  field === 'phone' || field === 'id_number' ? 'numeric' :
                    field === 'email' ? 'email-address' : 'default'
                }
                placeholderTextColor={colors.placeholderDark}
              />
            ))}
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  errorText: {
    color: colors.warning,
    marginBottom: 8,
    fontSize: 14,
  },
});

export default EditAdminModal;