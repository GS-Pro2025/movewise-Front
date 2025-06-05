import React, { JSX, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { FormInputProps, DateInputProps, DropdownInputProps, RadioGroupProps, ImageUploadProps, ImageInfo } from '@/types/operator.types';
import styles from '@/app/components/operators/FormStyle';
import { useTranslation } from 'react-i18next';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Linking } from 'react-native';
import { Modal, Image } from 'react-native';
import colors from '@/app/Colors';

// Componentes de Ayuda
function FormInput({ label, value, onChangeText, keyboardType = 'default', error, required = false }: FormInputProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
      <Text style={[styles.inputLabel, { color: isDarkMode ? colors.textDark : colors.primary }]}>{label}</Text>
      <View style={[styles.textInputContainer, error ? styles.inputError : null]}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function DateInput({ label, value, onChangeDate, error, required = false }: DateInputProps): JSX.Element {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse date string to Date object in local timezone
  const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date in local timezone
    return new Date(year, month - 1, day);
  };

  const handleDateChange = (event: any, selectedDate?: Date): void => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Format the date as YYYY-MM-DD without timezone conversion
      const formattedDate = formatDate(selectedDate);
      onChangeDate(formattedDate);
    }
  };

  // Get the current date value as a Date object
  const getCurrentDate = (): Date => {
    if (!value) return new Date();
    try {
      return parseDateString(value);
    } catch (e) {
      return new Date();
    }
  };

  // Format the displayed date (DD/MM/YYYY for display)
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
      <Text style={[styles.inputLabel, { color: isDarkMode ? colors.textDark : colors.primary }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.textInputContainer, error ? styles.inputError : null]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={value ? styles.dateText : styles.placeholderText}>
          {value ? formatDisplayDate(value) : t("select_date")}
        </Text>
        <Text style={styles.dateIcon}>📅</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {showDatePicker && (
        <DateTimePicker
          value={getCurrentDate()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

function DropdownInput({ label, value, onChange, options, error, required = false }: DropdownInputProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
      <Text style={[styles.inputLabel, { color: isDarkMode ? colors.textDark : colors.primary }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.textInputContainer, error ? styles.inputError : null]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text>{value || t("select_option")}</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {isOpen && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              onPress={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              <Text>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function RadioGroup({ label, options, selectedValue, onSelect, error, required = false }: RadioGroupProps): JSX.Element {
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
      <Text style={[styles.inputLabel, { color: isDarkMode ? colors.textDark : colors.primary }]}>{label}</Text>
      <View style={styles.radioGroupContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.label}
            style={styles.radioOption}
            onPress={() => onSelect(option.value)}
          >
            <View style={styles.radioCircle}>
              {selectedValue === option.value && <View style={styles.selectedRadio} />}
            </View>
            <Text style={styles.radioLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
  
  function ImageUpload({ label, image, onImageSelected, error, required = false }: ImageUploadProps): JSX.Element {
    const { t } = useTranslation();
    const [showOverlay, setShowOverlay] = useState(false);

    
    const handleImagePicker = async (type: 'camera' | 'gallery') => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('permission_required'), t('camera_permission_needed'));
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: t("permission_denied"),
            textBody: t("allow_photo_access"),
            autoClose: 3000,
          });
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const imageInfo: ImageInfo = {
          uri: selectedAsset.uri,
          name: `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
        };
        onImageSelected(imageInfo);
      }
    } catch (error) {
      // console.log(t("error_picking_image"), error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: t("error"),
        textBody: `${t("failed_to_select_image")}: ${error}`,
        autoClose: 3000,
      });
    }
  };


  const openOverlay = () => setShowOverlay(true);


return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.imageUploadContainer, error ? styles.inputError : null]}
        onPress={openOverlay}
      >
        {image ? (
          <View style={styles.imagePreview}>
            <Text>{t("image_selected")}</Text>
            <Text style={styles.imageFilename}>{image.uri.split('/').pop()}</Text>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>{t("upload_image")}</Text>
          </View>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Overlay Modal */}
      <Modal
        visible={showOverlay}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOverlay(false)}
      >
        <View style={uploadModalStyles.uploadModal_overlay}>
          <View style={uploadModalStyles.uploadModal_container}>
            <Text style={uploadModalStyles.uploadModal_title}>{t("select_image_source")}</Text>

            <TouchableOpacity
              style={uploadModalStyles.uploadModal_button}
              onPress={() => { setShowOverlay(false); handleImagePicker('camera'); }}
            >
              <Text style={uploadModalStyles.uploadModal_buttonText}>{t('take_photo')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={uploadModalStyles.uploadModal_button}
              onPress={() => { setShowOverlay(false); handleImagePicker('gallery'); }}
            >
              <Text style={uploadModalStyles.uploadModal_buttonText}>{t('choose_from_gallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={uploadModalStyles.uploadModal_cancelButton}
              onPress={() => setShowOverlay(false)}
            >
              <Text style={uploadModalStyles.uploadModal_cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const uploadModalStyles = StyleSheet.create({
  uploadModal_overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  uploadModal_container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  uploadModal_title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  uploadModal_button: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  uploadModal_cancelButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  uploadModal_buttonText: {
    color: '#0458AB',
    fontSize: 16,
  },
  uploadModal_cancelText: {
    color: '#e74c3c',
    fontSize: 16,
  },
});

export {
  FormInput,
  DateInput,
  DropdownInput,
  RadioGroup,
  ImageUpload
};

export default {
  FormInput,
  DateInput,
  DropdownInput,
  RadioGroup,
  ImageUpload
};
