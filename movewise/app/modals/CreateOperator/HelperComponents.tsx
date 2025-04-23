import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { FormInputProps, DateInputProps, DropdownInputProps, RadioGroupProps, ImageUploadProps, ImageInfo } from './Types';
import { styles } from './FormStyle';

// Helper Components
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
        <Text style={value ? styles.dateText : styles.placeholderText}>{value || 'Select date'}</Text>
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

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.textInputContainer, error ? styles.inputError : null]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text>{value || 'Select an option'}</Text>
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
  const pickImage = async (): Promise<void> => {
    try {
      // Request permission to access the media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Permission Denied",
          textBody: "Please allow access to your photo library to upload images",
          autoClose: 3000,
        });
        return;
      }
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        // Enhanced image info with clearer data
        const imageInfo: ImageInfo = {
          uri: selectedAsset.uri,
          name: `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
        };

        console.log(`Selected image for ${label}:`, imageInfo);
        onImageSelected(imageInfo);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Failed to select image: " + error,
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
            <Text>Image selected</Text>
            <Text style={styles.imageFilename}>{image.uri.split('/').pop()}</Text>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
