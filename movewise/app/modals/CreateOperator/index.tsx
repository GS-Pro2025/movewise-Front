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
  

  const handleSubmit = async (): Promise<void> => {
    debugger;                             // << pausa la ejecución aquí
    console.warn('▶ handleSubmit arrancó');
    try {
      setLoading(true);
      console.warn('1) antes de crear FormData');
      const apiFormData = new FormDataCtor();
      console.warn('2) FormData creada');


      console.warn('2) FormData creada');

      console.warn('3) append first_name', formData.first_name);
      apiFormData.append('first_name', formData.first_name);

      console.warn('last_name:', formData.last_name);
      apiFormData.append('last_name', formData.last_name);

      console.warn('birth_date:', formData.birth_date);
      apiFormData.append('birth_date', formData.birth_date);

      console.warn('type_id:', formData.type_id);
      apiFormData.append('type_id', formData.type_id);

      console.warn('id_number:', formData.id_number);
      apiFormData.append('id_number', formData.id_number);

      console.warn('address:', formData.address);
      apiFormData.append('address', formData.address);

      console.warn('phone:', formData.phone);
      apiFormData.append('phone', formData.phone);

      if (formData.email) {
        console.warn('email:', formData.email);
        apiFormData.append('email', formData.email);
      }

      console.warn('number_licence:', formData.number_licence);
      apiFormData.append('number_licence', formData.number_licence);

      console.warn('code:', formData.code);
      apiFormData.append('code', formData.code);

      console.warn('n_children:', formData.n_children);
      apiFormData.append('n_children', formData.n_children.toString());

      console.warn('size_t_shift:', formData.size_t_shift);
      apiFormData.append('size_t_shift', formData.size_t_shift);

      console.warn('name_t_shift:', formData.name_t_shift);
      apiFormData.append('name_t_shift', formData.name_t_shift);

      console.warn('salary:', formData.salary);
      apiFormData.append('salary', formData.salary);

      console.warn('status:', formData.status);
      apiFormData.append('status', formData.status);

      // Manejo de hijos
      if (formData.sons.length > 0) {
        console.warn('sons:', formData.sons);
        apiFormData.append('sons', JSON.stringify(formData.sons));
      }

      // Manejo de imágenes
      const appendImage = (field: string, image: ImageInfo | null) => {
        console.log(`${field}:`, image);
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
      appendImage('license_front', formData.license_front);
      appendImage('license_back', formData.license_back);

      // Mostrar contenido del FormData
      console.log('FormData entries:');
      for (const [key, value] of (apiFormData as any)._parts) {
        console.log(key, value);
      }
      console.warn('N) antes de la petición API');
      console.log("ID EN OPERATOR UPDATE OR CREATE: " + formData.id_operator)
      const response = isEditing
        ? await UpdateOperator(formData.id_operator!, apiFormData)
        : await PostOperator(apiFormData);

      console.log('API Response:', response);

      if (onClose) onClose();

    } catch (error: any) {
      console.error('Error completo:', error.response?.data?.message || error.errors);
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