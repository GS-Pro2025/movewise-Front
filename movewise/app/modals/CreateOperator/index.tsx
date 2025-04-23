import React, { useState } from 'react';
import { SafeAreaView, Button, ActivityIndicator } from 'react-native';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { styles } from './FormStyle';
import Step1Form from './FormSteps/Step1Form';
import Step2Form from './FormSteps/Step2Form';
import Step3Form from './FormSteps/Step3Form';
import { CreateOperatorProps, FormData } from './Types';

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
        <Button title="Close" onPress={onClose} />

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