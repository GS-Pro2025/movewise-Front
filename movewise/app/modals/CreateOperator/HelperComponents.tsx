import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { FormInputProps, DateInputProps, DropdownInputProps, RadioGroupProps, ImageUploadProps, ImageInfo } from './Types';
import { styles } from './FormStyle';
import { useTranslation } from 'react-i18next';
// Componentes de Ayuda
export function FormInput({ label, value, onChangeText, keyboardType = 'default', error, required = false }: FormInputProps): JSX.Element {
  
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
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

export function DateInput({ label, value, onChangeDate, error, required = false }: DateInputProps): JSX.Element {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { t } = useTranslation();
  const handleDateChange = (event: any, selectedDate?: Date): void => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChangeDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.textInputContainer, error ? styles.inputError : null]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={value ? styles.dateText : styles.placeholderText}>{value || t("select_date")}</Text>
        <Text style={styles.dateIcon}>📅</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

export function DropdownInput({ label, value, onChange, options, error, required = false }: DropdownInputProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
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

export function RadioGroup({ label, options, selectedValue, onSelect, error, required = false }: RadioGroupProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
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

export function ImageUpload({ label, image, onImageSelected, error, required = false }: ImageUploadProps): JSX.Element {
  const { t } = useTranslation();
  const pickImage = async (): Promise<void> => {
    try {
      // Solicitar permiso para acceder a la galería
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
      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        // Información mejorada de la imagen
        const imageInfo: ImageInfo = {
          uri: selectedAsset.uri,
          name: `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
        };

        console.log(`Imagen seleccionada para ${label}:`, imageInfo);
        onImageSelected(imageInfo);
      }
    } catch (error) {
      console.log(t("error_picking_image"), error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: t("error"),
        textBody: `${t("failed_to_select_image")}: ${error}`,
        autoClose: 3000,
      });
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.imageUploadContainer, error ? styles.inputError : null]}
        onPress={pickImage}
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
    </View>
  );
}
