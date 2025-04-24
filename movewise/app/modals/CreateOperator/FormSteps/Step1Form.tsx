import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, DateInput, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { StepProps, Operator } from '../Types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { ListOperators } from '@/hooks/api/Get_listOperator';
import { router } from 'expo-router';

const Step1Form = ({ formData, updateFormData, onNext, isEditing }: StepProps) => {
    // Local state to track form values
    const [localData, setLocalData] = useState({
        id_operator: formData.id_operator || 0,
        first_name: formData.first_name,
        last_name: formData.last_name,
        birth_date: formData.birth_date,
        type_id: formData.type_id,
        id_number: formData.id_number,
        address: formData.address,
        phone: formData.phone,
        email: formData.email ?? '',
    });
    const [operators, setOperators] = useState<Operator[]>([]); 

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const data: Operator[] = await ListOperators();
                setOperators(data);
            } catch (error) {
                console.error('Operators could not be loaded', error);
            }
        };

        fetchOperators();
    }, []);

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string): void => {
        
        // Actualizar estado local
        setLocalData(prev => ({ ...prev, [field]: value }));
        
        updateFormData({ [field]: value });
        
        // Clear error when user types
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!localData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }

        if (!localData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        }

        if (!localData.birth_date) {
            newErrors.birth_date = 'Date of birth is required';
        } else {
            const today = new Date();
            const dob = new Date(localData.birth_date);
            const age = today.getFullYear() - dob.getFullYear();
            if (age < 18) {
                newErrors.birth_date = 'Operator must be at least 18 years old';
            }
        }

        if (!localData.type_id) {
            newErrors.type_id = 'Identification type is required';
        }

        if (!localData.id_number.trim()) {
            newErrors.id_number = 'ID number is required';
        }

        if (!localData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!localData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[0-9]{10,15}$/.test(localData.phone)) {
            newErrors.phone = 'Enter a valid phone number';
        }

        if (localData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localData.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (): void => {
        if (validateForm()) {
            // Synchronize all fields with the parent formData
            updateFormData({
                first_name: localData.first_name,
                last_name: localData.last_name,
                birth_date: localData.birth_date,
                type_id: localData.type_id,
                id_number: localData.id_number,
                address: localData.address,
                phone: localData.phone,
                email: localData.email
            });
            
            
            if (onNext) onNext();
        } else {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Validation Error",
                textBody: "Please review the errors in the form",
                autoClose: 3000,
                });
        }
    };

    return (
        <ScrollView>
            <View style={styles.stepForm}>
                <Text style={styles.sectionTitle}>General Data</Text>

                <FormInput
                    label="Name (*)"
                    value={localData.first_name}
                    onChangeText={(text) => handleChange('first_name', text)}
                    error={errors.firstName}
                    required={true}
                />

                <FormInput
                    label="Last name (*)"
                    value={localData.last_name}
                    onChangeText={(text) => handleChange('last_name', text)}
                    error={errors.lastName}
                    required={true}
                />

                <DateInput
                    label="Birthdate (*)"
                    value={localData.birth_date}
                    onChangeDate={(date) => handleChange('birth_date', date)}
                    error={errors.dateOfBirth}
                    required={true}
                />

                <DropdownInput
                    label="Identification Type (*)"
                    value={localData.type_id}
                    onChange={(value) => handleChange('type_id', value)}
                    options={['Passport', 'Driver License', 'ID Card']}
                    error={errors.identificationType}
                    required={true}
                />

                <FormInput
                    label="Identification Number (*)"
                    value={localData.id_number}
                    onChangeText={(text) => handleChange('id_number', text)}
                    error={errors.id_number}
                    required={true}
                />

                <FormInput
                    label="Adress (*)"
                    value={localData.address}
                    onChangeText={(text) => handleChange('address', text)}
                    error={errors.address}
                    required={true}
                />

                <FormInput
                    label="Phone (*)"
                    value={localData.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    keyboardType="phone-pad"
                    error={errors.phone}
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