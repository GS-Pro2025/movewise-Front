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
import 'react-native-get-random-values';

const FormDataCtor = global.FormData as typeof FormData;

const CreateOperator: React.FC<CreateOperatorProps> = ({
  isEditing = false,
  initialData,
  onClose,
}) => {
  const defaultFormData: FormData = {
    id_operator: 0,
    first_name: '',
    last_name: '',
    birth_date: '',
    type_id: '',
    id_number: '',
    address: '',
    phone: '',
    email: '',
    number_licence: '',
    code: '',
    has_minors: false,
    n_children: 0,
    sons: [],
    salary: '',
    size_t_shift: '',
    name_t_shift: '',
    photo: null,
    license_front: null,
    license_back: null,
    status: '',
  };
  
  const [formData, setFormData] = useState<FormData>(
    initialData ?? defaultFormData
  );
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const updateFormData = (patch: Partial<FormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...patch };
      return updated;
    });
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const apiFormData = new FormDataCtor();
      
      if (isEditing && formData.id_operator) {
        console.log("Updating operator ID:", formData.id_operator);
        apiFormData.append('id_operator', formData.id_operator.toString());
      }
      
      // Iterar y añadir todos los campos de texto
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          // Manejar casos especiales
          if (key === 'sons' && Array.isArray(formData[key]) && formData[key].length > 0) {
            console.log('Añadiendo sons:', formData[key]);
            apiFormData.append('sons', JSON.stringify(formData[key]));
          } 
          // Manejar imágenes
          else if (key === 'photo' || key === 'license_front' || key === 'license_back') {
            const image = formData[key] as ImageInfo | null;
            if (image) {
              console.log(`Procesando ${key}:`, image);
              if (!image.uri.startsWith('http')) {
                // New image or updated image
                const file = {
                  uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
                  name: image.name || `${key}_${Date.now()}.jpg`,
                  type: 'image/jpeg'
                };
                apiFormData.append(key, file as any);
              } else {
                console.log(`${key} is an existing URL:`, image.uri);
              }
            }
          } 
          // Manejar otros tipos de datos
          else if (typeof formData[key] !== 'object') {
            console.log(`adding ${key}:`, formData[key]);
            apiFormData.append(key, formData[key].toString());
          }
        }
      });
      
      
      const response = isEditing
        ? await UpdateOperator(formData.id_operator!, apiFormData)
        : await PostOperator(apiFormData);
      
      
      // Mostrar mensaje de éxito
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: isEditing ? "Successful Update" : "Successful Registration",
        textBody: isEditing ? "The operator has been updated successfully" : "The operator has been registered successfully",
        autoClose: 2000
      });
      
      if (onClose) onClose();
      
    } catch (error: any) {
      console.error('Complete error:', error.response?.data?.message || error.message);
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

  const onNext = () => setCurrentStep(s => s + 1);
  const onBack = () => setCurrentStep(s => s - 1);

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
            onSubmit={handleSubmit}
            onBack={onBack}
            isEditing={isEditing}
          />
        )}
      </SafeAreaView>
    </AlertNotificationRoot>
  );
};

export default CreateOperator;