import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

// Define types for our form data
interface FormData {
  // Step 1 - General Data
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  identificationType: string;
  identificationNumber: string;
  state: string;
  city: string;
  zipCode: string;
  address: string;
  cellPhone: string;

  // Step 2 - Driving License
  hasDrivingPermit: boolean;
  drivingLicenseNumber: string;
  expiryDate: string;
  licensePhoto: ImageInfo | null;
  parentName: string;
  parentCellPhone: string;
  hasMinors: boolean;
  minorCount: number;
  kidName: string;
  kidDateOfBirth: string;

  // Step 3 - Final Info
  salary: string;
  size: string;
  tshirtName: string;
  photo: ImageInfo | null;
}

// Type for image data
interface ImageInfo {
  uri: string;
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
}

interface DateInputProps {
  label: string;
  value: string;
  onChangeDate: (date: string) => void;
}

interface DropdownInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
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
}

interface ImageUploadProps {
  label: string;
  image: ImageInfo | null;
  onImageSelected: (image: ImageInfo) => void;
}

export default function OperatorRegistrationForm(): JSX.Element {
  // State to track current step
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Main form data object that will be passed between components and sent to backend
  const [formData, setFormData] = useState<FormData>({
    // Step 1 - General Data
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    identificationType: '',
    identificationNumber: '',
    state: '',
    city: '',
    zipCode: '',
    address: '',
    cellPhone: '',

    // Step 2 - Driving License
    hasDrivingPermit: false,
    drivingLicenseNumber: '',
    expiryDate: '',
    licensePhoto: null,
    parentName: '',
    parentCellPhone: '',
    hasMinors: false,
    minorCount: 0,
    kidName: '',
    kidDateOfBirth: '',

    // Step 3 - Final Info
    salary: '',
    size: '',
    tshirtName: '',
    photo: null
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
  const handleSubmit = (): void => {
    console.log('Form submitted with data:', formData);
    // Here you would send the formData to your backend endpoint
    // fetch('your-api-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
  };

  return (
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
    state: formData.state,
    city: formData.city,
    zipCode: formData.zipCode,
    address: formData.address,
    cellPhone: formData.cellPhone,
  });

  // Handle text input changes
  const handleChange = (field: string, value: string): void => {
    setLocalData({ ...localData, [field]: value });
  };

  // Handle next button press
  const handleNext = (): void => {
    // Update parent form data
    updateFormData(localData);
    if (onNext) onNext();
  };

  return (
    <ScrollView>
      <View style={styles.stepForm}>
        <Text style={styles.sectionTitle}>General Data</Text>

        <FormInput
          label="First Name (*)"
          value={localData.firstName}
          onChangeText={(text) => handleChange('firstName', text)}
        />

        <FormInput
          label="Last Name (*)"
          value={localData.lastName}
          onChangeText={(text) => handleChange('lastName', text)}
        />

        <DateInput
          label="Date of Birth (*)"
          value={localData.dateOfBirth}
          onChangeDate={(date) => handleChange('dateOfBirth', date)}
        />

        <DropdownInput
          label="Identification type (*)"
          value={localData.identificationType}
          onChange={(value) => handleChange('identificationType', value)}
          options={['Driver License', 'Passport', 'ID Card']}
        />

        <FormInput
          label="ID Number (*)"
          value={localData.identificationNumber}
          onChangeText={(text) => handleChange('identificationNumber', text)}
        />

        <DropdownInput
          label="State (*)"
          value={localData.state}
          onChange={(value) => handleChange('state', value)}
          options={['State 1', 'State 2', 'State 3']}
        />

        <DropdownInput
          label="City (*)"
          value={localData.city}
          onChange={(value) => handleChange('city', value)}
          options={['City 1', 'City 2', 'City 3']}
        />

        <FormInput
          label="Zip Code (*)"
          value={localData.zipCode}
          onChangeText={(text) => handleChange('zipCode', text)}
          keyboardType="numeric"
        />

        <FormInput
          label="Address (*)"
          value={localData.address}
          onChangeText={(text) => handleChange('address', text)}
        />

        <FormInput
          label="Cell Phone (*)"
          value={localData.cellPhone}
          onChangeText={(text) => handleChange('cellPhone', text)}
          keyboardType="phone-pad"
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
    hasDrivingPermit: formData.hasDrivingPermit,
    drivingLicenseNumber: formData.drivingLicenseNumber,
    expiryDate: formData.expiryDate,
    licensePhoto: formData.licensePhoto,
    parentName: formData.parentName,
    parentCellPhone: formData.parentCellPhone,
    hasMinors: formData.hasMinors,
    minorCount: formData.minorCount,
    kidName: formData.kidName,
    kidDateOfBirth: formData.kidDateOfBirth,
  });

  const handleChange = (field: string, value: any): void => {
    setLocalData({ ...localData, [field]: value });
  };

  const handleNext = (): void => {
    updateFormData(localData);
    if (onNext) onNext();
  };

  return (
    <ScrollView>
      <View style={styles.stepForm}>
        <Text style={styles.sectionTitle}>Driving licence</Text>

        <RadioGroup
          label="Driving permit (*)"
          options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
          selectedValue={localData.hasDrivingPermit}
          onSelect={(value) => handleChange('hasDrivingPermit', value)}
        />

        <FormInput
          label="Driving License Number (*)"
          value={localData.drivingLicenseNumber}
          onChangeText={(text) => handleChange('drivingLicenseNumber', text)}
        />

        <DateInput
          label="Expiry Date (*)"
          value={localData.expiryDate}
          onChangeDate={(date) => handleChange('expiryDate', date)}
        />

        <ImageUpload
          label="License photo (*)"
          image={localData.licensePhoto}
          onImageSelected={(image) => handleChange('licensePhoto', image)}
        />

        <Text style={styles.subSectionTitle}>Family information</Text>

        <FormInput
          label="Name parent/guardian"
          value={localData.parentName}
          onChangeText={(text) => handleChange('parentName', text)}
        />

        <FormInput
          label="Cell Phone parent/guardian (*)"
          value={localData.parentCellPhone}
          onChangeText={(text) => handleChange('parentCellPhone', text)}
          keyboardType="phone-pad"
        />

        <RadioGroup
          label="Minor children (*)"
          options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
          selectedValue={localData.hasMinors}
          onSelect={(value) => handleChange('hasMinors', value)}
        />

        {localData.hasMinors && (
          <>
            <FormInput
              label="Number of minors (*)"
              value={localData.minorCount.toString()}
              onChangeText={(text) => handleChange('minorCount', parseInt(text) || 0)}
              keyboardType="numeric"
            />

            <FormInput
              label="Kids name (*)"
              value={localData.kidName}
              onChangeText={(text) => handleChange('kidName', text)}
            />

            <DateInput
              label="Date of birth (*)"
              value={localData.kidDateOfBirth}
              onChangeDate={(date) => handleChange('kidDateOfBirth', date)}
            />
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
    photo: formData.photo
  });

  const handleChange = (field: string, value: any): void => {
    setLocalData({ ...localData, [field]: value });
  };

  const handleSave = (): void => {
    updateFormData(localData);
    if (onSubmit) onSubmit();
  };

  return (
    <ScrollView>
      <View style={styles.stepForm}>
        <FormInput
          label="Salary (*)"
          value={localData.salary}
          onChangeText={(text) => handleChange('salary', text)}
          keyboardType="numeric"
        />

        <DropdownInput
          label="Size (*)"
          value={localData.size}
          onChange={(value) => handleChange('size', value)}
          options={['Small', 'Medium', 'Large', 'XL']}
        />

        <FormInput
          label="Name you want to wear in the T-shirt (*)"
          value={localData.tshirtName}
          onChangeText={(text) => handleChange('tshirtName', text)}
        />

        <ImageUpload
          label="Photo (*)"
          image={localData.photo}
          onImageSelected={(image) => handleChange('photo', image)}
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
function FormInput({ label, value, onChangeText, keyboardType = 'default' }: FormInputProps): JSX.Element {
  return (
    <ScrollView>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function DateInput({ label, value, onChangeDate }: DateInputProps): JSX.Element {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date): void => {
    setShowDatePicker(false);
    if (selectedDate) {
      onChangeDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.textInputContainer}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{value || 'Select date'}</Text>
        <Text style={styles.dateIcon}>📅</Text>
      </TouchableOpacity>

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

function DropdownInput({ label, value, onChange, options }: DropdownInputProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.textInputContainer}
        onPress={() => setIsOpen(true)}
      >
        <Text>{value || 'Select an option'}</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {/* In a real implementation, you would use a modal or dropdown picker library */}
      {/* This is simplified for the example */}
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

function RadioGroup({ label, options, selectedValue, onSelect }: RadioGroupProps): JSX.Element {
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
    </View>
  );
}

function ImageUpload({ label, image, onImageSelected }: ImageUploadProps): JSX.Element {
  const pickImage = async (): Promise<void> => {
    try {
      // You would need to implement image picking using expo-image-picker
      // For this example we'll just simulate it
      const mockImage: ImageInfo = { uri: 'https://example.com/image.jpg' };
      onImageSelected(mockImage);
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage}>
        {image ? (
          <View style={styles.imagePreview}>
            <Text>Image selected</Text>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Upload</Text>
          </View>
        )}
      </TouchableOpacity>
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
    color: '#e63946',   // rojo discreto para asterisco
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#3b5998',     // azul similar
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
});