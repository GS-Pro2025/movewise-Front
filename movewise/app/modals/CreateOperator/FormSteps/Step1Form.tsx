import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, DateInput, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { StepProps, Operator } from '../Types';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { ListOperators } from '@/hooks/api/Get_listOperator';
import { router } from 'expo-router';

const Step1Form = ({ formData, updateFormData, onNext, isEditing }: StepProps) => {
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
    const [operators, setOperators] = useState<Operator[]>([]); 

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const data: Operator[] = await ListOperators();
                setOperators(data);
            } catch (error) {
                console.error('No se pudieron cargar los operadores', error);
            }
        };

        fetchOperators();
    }, []);



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
};

export default Step1Form;