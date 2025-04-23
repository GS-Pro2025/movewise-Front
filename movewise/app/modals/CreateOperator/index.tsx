import { PostOperator, UpdateOperator } from '@/hooks/api/PostOperator';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { Platform } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView, Button, ActivityIndicator } from 'react-native';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { styles } from './FormStyle';
import Step1Form from './FormSteps/Step1Form';
import Step2Form from './FormSteps/Step2Form';
import Step3Form from './FormSteps/Step3Form';
import { CreateOperatorProps, FormData, ImageInfo } from './Types';

const CreateOperator: React.FC<CreateOperatorProps> = ({
  isEditing = false,
  initialData,
  onClose,
}) => {
  const defaultFormData: FormData = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    identificationType: '',
    identificationNumber: '',
    address: '',
    cellPhone: '',
    email: '',
    drivingLicenseNumber: '',
    code: '',
    hasMinors: false,
    minorCount: 0,
    sons: [],
    salary: '',
    size: '',
    tshirtName: '',
    photo: null,
    licenseFront: null,
    licenseBack: null,
    status: '',
  };


  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      const apiFormData = new FormData();
  
      // Agregar todos los campos necesarios
      apiFormData.append('first_name', formData.firstName);
      apiFormData.append('last_name', formData.lastName);
      apiFormData.append('birth_date', formData.dateOfBirth);
      apiFormData.append('type_id', formData.identificationType);
      apiFormData.append('id_number', formData.identificationNumber);
      apiFormData.append('address', formData.address);
      apiFormData.append('phone', formData.cellPhone);
      if (formData.email) apiFormData.append('email', formData.email);
      apiFormData.append('number_licence', formData.drivingLicenseNumber);
      apiFormData.append('code', formData.code);
      apiFormData.append('n_children', formData.minorCount.toString());
      apiFormData.append('size_t_shift', formData.size);
      apiFormData.append('name_t_shift', formData.tshirtName);
      apiFormData.append('salary', formData.salary);
      apiFormData.append('status', formData.status);
  
      // Manejo de hijos
      if (formData.sons.length > 0) {
        apiFormData.append('sons', JSON.stringify(formData.sons));
      }
  
      // Manejo de imágenes
      const appendImage = (field: string, image: ImageInfo | null) => {
        if (image && !image.uri.startsWith('http')) {
          const file = {
            uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
            name: image.name || `${field}_${Date.now()}.jpg`,
            type: 'image/jpeg'
          };
          apiFormData.append(field, file as any);
        }
      };
  
      appendImage('photo', formData.photo);
      appendImage('license_front', formData.licenseFront);
      appendImage('license_back', formData.licenseBack);
  
      // Debug: Mostrar contenido del FormData
      console.log('FormData entries:');
      for (const [key, value] of (apiFormData as any)._parts) {
        console.log(key, value);
      }
  
      // Ejecutar la petición
      const response = isEditing 
        ? await UpdateOperator(formData.id_operator!, apiFormData)
        : await PostOperator(apiFormData);
  
      console.log('API Response:', response);
      
      // Cerrar modal y actualizar lista
      if (onClose) onClose();
      
    } catch (error: any) {
      console.error('Error completo:', error);
      const errorMessage = error.response?.data?.message || error.message;
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: errorMessage,
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState<FormData>(
    initialData ?? defaultFormData
  );
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const updateFormData = (patch: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...patch }));
  };

  const onNext = () => setCurrentStep(s => s + 1);
  const onBack = () => setCurrentStep(s => s - 1);

  const onSubmit = () => {
    setLoading(true);
    setLoading(false);
    onClose();
  };

  return (
    <AlertNotificationRoot>
      <SafeAreaView style={styles.container}>

        {loading && <ActivityIndicator size="large" />}

        {currentStep === 1 && (
          <Step1Form
            formData={formData}
            updateFormData={updateFormData}
            onNext={onNext}
            isEditing={isEditing}
          />
        )}

        {currentStep === 2 && (
          <Step2Form
            formData={formData}
            updateFormData={updateFormData}
            onNext={onNext}
            onBack={onBack}
            isEditing={isEditing}
          />
        )}

        {currentStep === 3 && (
          <Step3Form
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={onSubmit}
            onBack={onBack}
            isEditing={isEditing}
          />
        )}
      </SafeAreaView>
    </AlertNotificationRoot>
  );
};

export default CreateOperator;