import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PostOperator } from '@/hooks/api/PostOperator';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';

// Define types for our form data
interface FormData {
  // Step 1 - General Data
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  identificationType: string;
  identificationNumber: string;
  address: string;
  cellPhone: string;
  email: string;

  // Step 2 - Driving License
  drivingLicenseNumber: string;
  code: string;
  hasMinors: boolean;
  minorCount: number;
  sons: Son[];

  // Step 3 - Final Info
  salary: string;
  size: string;
  tshirtName: string;
  photo: ImageInfo | null;
  licenseFront: ImageInfo | null;
  licenseBack: ImageInfo | null;
  status: string;
}

// Type for sons/children data
interface Son {
  name: string;
  birth_date: string;
  gender: string;
}

// Type for image data
interface ImageInfo {
  uri: string;
  name?: string;
  type?: string;
}

// Props for step components
interface StepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
}

// Props for form input components
interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  error?: string;
  required?: boolean;
}

interface DateInputProps {
  label: string;
  value: string;
  onChangeDate: (date: string) => void;
  error?: string;
  required?: boolean;
}

interface DropdownInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
  required?: boolean;
}

interface RadioOption {
  label: string;
  value: boolean;
}

interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  selectedValue: boolean;
  onSelect: (value: boolean) => void;
  error?: string;
  required?: boolean;
}

interface ImageUploadProps {
  label: string;
  image: ImageInfo | null;
  onImageSelected: (image: ImageInfo) => void;
  error?: string;
  required?: boolean;
}

export default function OperatorRegistrationForm(): JSX.Element {
  // State to track current step
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Main form data object that will be passed between components and sent to backend
  const [formData, setFormData] = useState<FormData>({
    // Step 1 - General Data
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    identificationType: 'Passport',
    identificationNumber: '',
    address: '',
    cellPhone: '',
    email: '',

    // Step 2 - Driving License
    drivingLicenseNumber: '',
    code: '',
    hasMinors: false,
    minorCount: 0,
    sons: [],

    // Step 3 - Final Info
    salary: '',
    size: 'M',
    tshirtName: '',
    photo: null,
    licenseFront: null,
    licenseBack: null,
    status: 'Active'
  });

  // Function to update form data
  const updateFormData = (newData: Partial<FormData>): void => {
    setFormData({ ...formData, ...newData });
  };

  // Function to handle next step
  const nextStep = (): void => {
    setCurrentStep(currentStep + 1);
  };

  // Function to handle previous step
  const prevStep = (): void => {
    setCurrentStep(currentStep - 1);
  };

  // Function to submit the complete form
  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);

      // Create FormData object
      const apiFormData = new FormData();

      // Step 1 data
      apiFormData.append('first_name', formData.firstName);
      apiFormData.append('last_name', formData.lastName);
      apiFormData.append('birth_date', formData.dateOfBirth);
      apiFormData.append('type_id', formData.identificationType);
      apiFormData.append('id_number', formData.identificationNumber);
      apiFormData.append('address', formData.address);
      apiFormData.append('phone', formData.cellPhone);
      if (formData.email) {
        apiFormData.append('email', formData.email);
      }

      // Step 2 data
      apiFormData.append('number_licence', formData.drivingLicenseNumber);
      apiFormData.append('code', formData.code);
      apiFormData.append('n_children', formData.minorCount.toString());

      // Add sons data as JSON string
      if (formData.sons.length > 0) {
        apiFormData.append('sons', JSON.stringify(formData.sons));
      }

      // Step 3 data
      apiFormData.append('size_t_shift', formData.size);
      apiFormData.append('name_t_shift', formData.tshirtName);
      apiFormData.append('salary', formData.salary);
      apiFormData.append('status', formData.status);

      // Add images
      if (formData.photo) {
        const photoFile = {
          uri: formData.photo.uri,
          name: 'photo.jpg',
          type: 'image/jpeg'
        };
        // @ts-ignore - FormData in React Native has issues with TypeScript
        apiFormData.append('photo', photoFile);
      }

      if (formData.licenseFront) {
        const licenseFileF = {
          uri: formData.licenseFront.uri,
          name: 'license_front.jpg',
          type: 'image/jpeg'
        };
        // @ts-ignore
        apiFormData.append('license_front', licenseFileF);
      }

      if (formData.licenseBack) {
        const licenseFileB = {
          uri: formData.licenseBack.uri,
          name: 'license_back.jpg',
          type: 'image/jpeg'
        };
        // @ts-ignore
        apiFormData.append('license_back', licenseFileB);
      }

      // Submit form
      const response = await PostOperator(apiFormData);

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Registration Successful",
        textBody: "Operator has been registered successfully",
        autoClose: 3000,
      });

      // Navigate back or to a success screen
      router.back();

    } catch (error: any) {
      console.error('Error submitting form:', error);

      const errorMessage = error.response?.data?.error ||
        error.response?.data?.detail ||
        (typeof error.response?.data === 'string' ? error.response?.data : null) ||
        "An error occurred while registering the operator";

      // Check if we have validation errors (object with field names as keys)
      if (error.response?.data && typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
        const validationErrors = Object.entries(error.response.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');

        if (validationErrors) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: "Validation Error",
            textBody: validationErrors,
            autoClose: 5000,
          });
          return;
        }
      }

      // Show generic error message
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Registration Failed",
        textBody: errorMessage,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertNotificationRoot>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Operator Registration</Text>
          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((step) => (
              <View key={step} style={styles.stepContainer}>
                <View
                  style={[
                    styles.stepCircle,
                    currentStep >= step ? styles.activeStep : styles.inactiveStep,
                  ]}
                >
                  <Text style={styles.stepText}>{step}</Text>
                </View>
                {step < 3 && <View style={styles.stepLine} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.formContainer}>
          {currentStep === 1 && (
            <Step1Form
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <Step2Form
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <Step3Form
              formData={formData}
              updateFormData={updateFormData}
              onBack={prevStep}
              onSubmit={handleSubmit}
            />
          )}
        </View>
      </SafeAreaView>
    </AlertNotificationRoot>
  );
}

// Step 1: General Data Component
function Step1Form({ formData, updateFormData, onNext }: StepProps): JSX.Element {
  // Local state to track form values
  const [localData, setLocalData] = useState({
    firstName: formData.firstName,
    lastName: formData.lastName,
    dateOfBirth: formData.dateOfBirth,
    identificationType: formData.identificationType,
    identificationNumber: formData.identificationNumber,
    address: formData.address,
    cellPhone: formData.cellPhone,
    email: formData.email,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle text input changes
  const handleChange = (field: string, value: string): void => {
    setLocalData({ ...localData, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!localData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!localData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const today = new Date();
      const dob = new Date(localData.dateOfBirth);
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'Operator must be at least 18 years old';
      }
    }

    if (!localData.identificationType) {
      newErrors.identificationType = 'Identification type is required';
    }

    if (!localData.identificationNumber.trim()) {
      newErrors.identificationNumber = 'ID number is required';
    }

    if (!localData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!localData.cellPhone.trim()) {
      newErrors.cellPhone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(localData.cellPhone)) {
      newErrors.cellPhone = 'Enter a valid phone number';
    }

    if (localData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next button press
  const handleNext = (): void => {
    if (validateForm()) {
      // Update parent form data
      updateFormData(localData);
      if (onNext) onNext();
    } else {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Validation Error",
        textBody: "Please check the form for errors",
        autoClose: 3000,
      });
    }
  };

  return (
    <ScrollView>
      <View style={styles.stepForm}>
        <Text style={styles.sectionTitle}>General Data</Text>

        <FormInput
          label="First Name (*)"
          value={localData.firstName}
          onChangeText={(text) => handleChange('firstName', text)}
          error={errors.firstName}
          required={true}
        />

        <FormInput
          label="Last Name (*)"
          value={localData.lastName}
          onChangeText={(text) => handleChange('lastName', text)}
          error={errors.lastName}
          required={true}
        />

        <DateInput
          label="Date of Birth (*)"
          value={localData.dateOfBirth}
          onChangeDate={(date) => handleChange('dateOfBirth', date)}
          error={errors.dateOfBirth}
          required={true}
        />

        <DropdownInput
          label="Identification type (*)"
          value={localData.identificationType}
          onChange={(value) => handleChange('identificationType', value)}
          options={['Passport', 'Driver License', 'ID Card']}
          error={errors.identificationType}
          required={true}
        />

        <FormInput
          label="ID Number (*)"
          value={localData.identificationNumber}
          onChangeText={(text) => handleChange('identificationNumber', text)}
          error={errors.identificationNumber}
          required={true}
        />

        <FormInput
          label="Address (*)"
          value={localData.address}
          onChangeText={(text) => handleChange('address', text)}
          error={errors.address}
          required={true}
        />

        <FormInput
          label="Cell Phone (*)"
          value={localData.cellPhone}
          onChangeText={(text) => handleChange('cellPhone', text)}
          keyboardType="phone-pad"
          error={errors.cellPhone}
          required={true}
        />

        <FormInput
          label="Email"
          value={localData.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          error={errors.email}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Step 2: Driving License Component
function Step2Form({ formData, updateFormData, onNext, onBack }: StepProps): JSX.Element {
  const [localData, setLocalData] = useState({
    drivingLicenseNumber: formData.drivingLicenseNumber,
    code: formData.code,
    hasMinors: formData.hasMinors,
    minorCount: formData.minorCount,
    sons: formData.sons.length > 0 ? [...formData.sons] : [],
    licenseFront: formData.licenseFront,
    licenseBack: formData.licenseBack,
  });

  // State for the current son being added
  const [currentSon, setCurrentSon] = useState<Partial<Son>>({
    name: '',
    birth_date: '',
    gender: 'M'
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sonErrors, setSonErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any): void => {
    setLocalData({ ...localData, [field]: value });
    // Clear error
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSonChange = (field: string, value: string): void => {
    setCurrentSon({ ...currentSon, [field]: value });
    // Clear error
    if (sonErrors[field]) {
      setSonErrors({ ...sonErrors, [field]: '' });
    }
  };

  const validateSon = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentSon.name?.trim()) {
      newErrors.name = 'Child name is required';
    }

    if (!currentSon.birth_date) {
      newErrors.birth_date = 'Birth date is required';
    } else {
      const today = new Date();
      const dob = new Date(currentSon.birth_date);
      const age = today.getFullYear() - dob.getFullYear();
      if (age >= 18) {
        newErrors.birth_date = 'Child must be under 18 years old';
      }
    }

    if (!currentSon.gender) {
      newErrors.gender = 'Gender is required';
    }

    setSonErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSon = (): void => {
    if (validateSon()) {
      // Add the current son to the sons list
      const updatedSons = [...localData.sons, currentSon as Son];
      setLocalData({ ...localData, sons: updatedSons });

      // Reset current son form
      setCurrentSon({
        name: '',
        birth_date: '',
        gender: 'M'
      });

      // Update minor count
      setLocalData(prev => ({
        ...prev,
        minorCount: updatedSons.length
      }));

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Child Added",
        textBody: "Child information has been added",
        autoClose: 1500,
      });
    }
  };

  const removeSon = (index: number): void => {
    const updatedSons = localData.sons.filter((_, i) => i !== index);
    setLocalData({
      ...localData,
      sons: updatedSons,
      minorCount: updatedSons.length
    });

    Toast.show({
      type: ALERT_TYPE.INFO,
      title: "Child Removed",
      textBody: "Child information has been removed",
      autoClose: 1500,
    });
  };

  // Validate the entire form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localData.drivingLicenseNumber.trim()) {
      newErrors.drivingLicenseNumber = 'License number is required';
    }

    if (!localData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (localData.hasMinors && localData.sons.length === 0) {
      newErrors.sons = 'Please add children information';
    }

    if (!localData.licenseFront) {
      newErrors.licenseFront = 'License front photo is required';
    }

    if (!localData.licenseBack) {
      newErrors.licenseBack = 'License back photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (): void => {
    if (validateForm()) {
      updateFormData(localData);
      if (onNext) onNext();
    } else {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Validation Error",
        textBody: "Please check the form for errors",
        autoClose: 3000,
      });
    }
  };

  return (
    <ScrollView>
      <View style={styles.stepForm}>
        <Text style={styles.sectionTitle}>Driving License Information</Text>

        <FormInput
          label="Driving License Number (*)"
          value={localData.drivingLicenseNumber}
          onChangeText={(text) => handleChange('drivingLicenseNumber', text)}
          error={errors.drivingLicenseNumber}
          required={true}
        />

        <FormInput
          label="Code (*)"
          value={localData.code}
          onChangeText={(text) => handleChange('code', text)}
          error={errors.code}
          required={true}
        />

        <ImageUpload
          label="License Front Photo (*)"
          image={localData.licenseFront}
          onImageSelected={(image) => handleChange('licenseFront', image)}
          error={errors.licenseFront}
          required={true}
        />

        <ImageUpload
          label="License Back Photo (*)"
          image={localData.licenseBack}
          onImageSelected={(image) => handleChange('licenseBack', image)}
          error={errors.licenseBack}
          required={true}
        />

        <Text style={styles.subSectionTitle}>Children Information</Text>

        <RadioGroup
          label="Do you have minor children? (*)"
          options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
          selectedValue={localData.hasMinors}
          onSelect={(value) => handleChange('hasMinors', value)}
        />

        {localData.hasMinors && (
          <>
            <Text style={styles.inputLabel}>Children Count: {localData.minorCount}</Text>
            {errors.sons && <Text style={styles.errorText}>{errors.sons}</Text>}

            {/* List of added children */}
            {localData.sons.length > 0 && (
              <View style={styles.sonsList}>
                <Text style={styles.subsectionTitle}>Added Children:</Text>
                {localData.sons.map((son, index) => (
                  <View key={index} style={styles.sonItem}>
                    <Text>{son.name} - {son.birth_date} - {son.gender === 'M' ? 'Male' : 'Female'}</Text>
                    <TouchableOpacity onPress={() => removeSon(index)}>
                      <Text style={styles.removeButton}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Form to add a new child */}
            <View style={styles.addSonForm}>
              <Text style={styles.subsectionTitle}>Add Child:</Text>

              <FormInput
                label="Name (*)"
                value={currentSon.name || ''}
                onChangeText={(text) => handleSonChange('name', text)}
                error={sonErrors.name}
                required={true}
              />

              <DateInput
                label="Date of Birth (*)"
                value={currentSon.birth_date || ''}
                onChangeDate={(date) => handleSonChange('birth_date', date)}
                error={sonErrors.birth_date}
                required={true}
              />

              <DropdownInput
                label="Gender (*)"
                value={currentSon.gender || 'M'}
                onChange={(value) => handleSonChange('gender', value)}
                options={['M', 'F']}
                error={sonErrors.gender}
                required={true}
              />

              <TouchableOpacity style={styles.addButton} onPress={addSon}>
                <Text style={styles.buttonText}>Add Child</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Step 3: Final Info Component
function Step3Form({ formData, updateFormData, onBack, onSubmit }: StepProps): JSX.Element {
  const [localData, setLocalData] = useState({
    salary: formData.salary,
    size: formData.size,
    tshirtName: formData.tshirtName,
    photo: formData.photo,
    status: formData.status
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any): void => {
    setLocalData({ ...localData, [field]: value });
    // Clear error
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localData.salary.trim()) {
      newErrors.salary = 'Salary is required';
    } else if (isNaN(parseFloat(localData.salary)) || parseFloat(localData.salary) <= 0) {
      newErrors.salary = 'Enter a valid salary amount';
    }

    if (!localData.size) {
      newErrors.size = 'Size is required';
    }

    if (!localData.tshirtName.trim()) {
      newErrors.tshirtName = 'T-shirt name is required';
    }

    if (!localData.photo) {
      newErrors.photo = 'Photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (): void => {
    if (validateForm()) {
      updateFormData(localData);
      if (onSubmit) onSubmit();
    } else {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Validation Error",
        textBody: "Please check the form for errors",
        autoClose: 3000,
      });
    }
  };

  return (
    <ScrollView>
      <View style={styles.stepForm}>
        <FormInput
          label="Salary (*)"
          value={localData.salary}
          onChangeText={(text) => handleChange('salary', text)}
          keyboardType="numeric"
          error={errors.salary}
          required={true}
        />

        <DropdownInput
          label="Size (*)"
          value={localData.size}
          onChange={(value) => handleChange('size', value)}
          options={['S', 'M', 'L', 'XL']}
          error={errors.size}
          required={true}
        />

        <FormInput
          label="Name you want to wear in the T-shirt (*)"
          value={localData.tshirtName}
          onChangeText={(text) => handleChange('tshirtName', text)}
          error={errors.tshirtName}
          required={true}
        />

        <ImageUpload
          label="Photo (*)"
          image={localData.photo}
          onImageSelected={(image) => handleChange('photo', image)}
          error={errors.photo}
          required={true}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Helper Components
function FormInput({ label, value, onChangeText, keyboardType = 'default', error, required = false }: FormInputProps): JSX.Element {
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

function DateInput({ label, value, onChangeDate, error, required = false }: DateInputProps): JSX.Element {
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

function DropdownInput({ label, value, onChange, options, error, required = false }: DropdownInputProps): JSX.Element {
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

function RadioGroup({ label, options, selectedValue, onSelect, error, required = false }: RadioGroupProps): JSX.Element {
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

function ImageUpload({ label, image, onImageSelected, error, required = false }: ImageUploadProps): JSX.Element {
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
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const imageInfo: ImageInfo = {
          uri: selectedAsset.uri,
          name: `image-${Date.now()}.jpg`,
          type: 'image/jpeg',
        };
        onImageSelected(imageInfo);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Failed to select image",
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#0066cc',
  },
  inactiveStep: {
    backgroundColor: '#cccccc',
  },
  stepText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#cccccc',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  stepForm: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#112A4A',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  },
  required: {
    color: '#e63946',   
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#3b5998',     
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  iconButton: {
    marginLeft: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  dateIcon: {
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  radioGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0066cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedRadio: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066cc',
  },
  radioLabel: {
    fontSize: 14,
  },
  imageUploadContainer: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  sonsList: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
  },
  sonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  removeButton: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addSonForm: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  imageFilename: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  placeholderText: {
    color: '#a0aec0',
    fontSize: 14,
  },
  inputError: {
    borderColor:'red'
  }
});