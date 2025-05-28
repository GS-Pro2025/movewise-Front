import { PostOperator, UpdateOperator } from '@/hooks/api/PostOperator';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { Platform } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { AlertNotificationRoot } from 'react-native-alert-notification';

import Step1Form from './FormSteps/Step1Form';
import Step2Form from './FormSteps/Step2Form';
import Step3Form from './FormSteps/Step3Form';
import { FormData, Operator, CreateOperatorProps, ImageInfo } from '@/types/operator.types';
import 'react-native-get-random-values';
import styles from '@/app/components/operators/FormStyle';

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
        // console.log("Updating operator ID:", formData.id_operator);
        apiFormData.append('id_operator', formData.id_operator.toString());
      }
      
      // Iterate and add all text fields
      (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
        const value = formData[key];
        if (value !== undefined && value !== null) {
          // Handle special cases
          if (key === 'sons' && Array.isArray(value) && value.length > 0) {
            // console.log('Adding sons:', value);
            apiFormData.append('sons', JSON.stringify(value));
          } 
          // Handle images
          else if (key === 'photo' || key === 'license_front' || key === 'license_back') {
            const image = value as ImageInfo | null;
            if (image) {
              // console.log(`Processing ${key}:`, image);
              if (!image.uri.startsWith('http')) {
                // New image or updated image
                const file = {
                  uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
                  name: image.name || `${key}_${Date.now()}.jpg`,
                  type: 'image/jpeg'
                };
                apiFormData.append(key, file as any);
              } else {
                // console.log(`${key} is an existing URL:`, image.uri);
              }
            }
          } 
          // Handle other data types
          else if (typeof value !== 'object') {
            console.log(`adding ${key}:`, value);
            apiFormData.append(key, value.toString());
          }
        }
      });

      if (isEditing) {
        await UpdateOperator(formData.id_operator!, apiFormData);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Operator updated successfully',
          autoClose: 2000,
        });
      } else {
        await PostOperator(apiFormData);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Operator created successfully',
          autoClose: 2000,
        });
      }

      if (onClose) onClose();
    } catch (error: any) {
      console.error('Error in form submission:', error);
      
      // Format the error message for better readability
      let errorMessage = error.message || 'An error occurred while saving the operator';
      
      // If the error message contains bullet points, preserve the formatting
      if (errorMessage.includes('•')) {
        errorMessage = errorMessage.split('\n').map((line: string) => line.trim()).join('\n');
      }

      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Validation Error',
        textBody: errorMessage,
        button: 'Close',
        autoClose: false
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