import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput 
} from 'react-native';
import { useRouter } from 'expo-router';
import { PostOperator } from '@/hooks/api/PostOperator';
import { useTranslation } from 'react-i18next';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { FormData, Operator, CreateOperatorProps, ImageInfo } from '@/types/operator.types';

export default function CreateOperator({ onClose, isEditing = false, initialData, orderKey }: CreateOperatorProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>(() => ({
    id_operator: isEditing ? initialData?.id_operator : undefined,
    first_name: '',
    last_name: '',
    birth_date: '',
    type_id: '',
    id_number: '',
    address: '',
    phone: '',
    email: '',
    number_licence: '',
    zipcode: '',
    has_minors: false,
    n_children: 0,
    sons: [],
    code: '',
    salary: '',
    size_t_shift: '',
    name_t_shift: '',
    photo: null,
    license_front: null,
    license_back: null,
    status: ''
  }));

  // Initialize form data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData(initialData);
    }
  }, [isEditing, initialData]);

  const handleSubmit = async () => {
    try {
      const formDataObj = new FormData();
      
      // Add all form data fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && value !== null) {
            // Handle image uploads
            if (key === 'photo' || key === 'license_front' || key === 'license_back') {
              const image = value as ImageInfo;
              if (image?.uri) {
                formDataObj.append(key, {
                  uri: image.uri,
                  type: image.type || 'image/jpeg',
                  name: image.name || 'image.jpg'
                } as any); // TypeScript doesn't recognize this format for FormData
              }
            }
          } else {
            formDataObj.append(key, value.toString());
          }
        }
      });

      // Add orderKey if provided
      if (orderKey) {
        formDataObj.append('orderKey', orderKey);
      }

      await PostOperator(formDataObj);
      
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: t('success'),
        textBody: isEditing ? t('operatorUpdated') : t('operatorCreated'),
      });
      
      onClose();
      router.back();
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: t('error'),
        textBody: isEditing ? t('operatorUpdateFailed') : t('operatorCreationFailed'),
      });
    }
  };

  return (
    <Modal visible={true} transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{t('createOperator')}</Text>
          
          <TextInput
            style={styles.input}
            placeholder={t('firstName')}
            value={formData.first_name}
            onChangeText={(text) => setFormData({ ...formData, first_name: text })}
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('lastName')}
            value={formData.last_name}
            onChangeText={(text) => setFormData({ ...formData, last_name: text })}
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('email')}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('phone')}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{t('create')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
