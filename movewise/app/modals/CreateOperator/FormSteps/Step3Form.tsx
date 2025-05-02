import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, ImageUpload, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { StepProps } from '../Types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

const Step3Form = ({ formData, updateFormData, onBack, onSubmit, isEditing }: StepProps) => {

    const [localData, setLocalData] = useState({
        code: formData.code || '',
        salary: formData.salary,
        size_t_shift: formData.size_t_shift,
        name_t_shift: formData.name_t_shift,
        photo: formData.photo,
        status: formData.status || 'active' 
    });

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: any): void => {

        setLocalData(prev => ({ ...prev, [field]: value }));

        // update the parent formData immediately
        updateFormData({ [field]: value });

        // Clear error
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!localData.code.trim()) {
            newErrors.code = 'Operator code is required';
        } else if (localData.code.length < 3) {
            newErrors.code = 'Operator code must be at least 3 characters long';
        }

        if (!localData.salary.toString().trim()) {
            newErrors.salary = 'Salary is required';
        } else if (isNaN(parseFloat(localData.salary)) || parseFloat(localData.salary) <= 0) {
            newErrors.salary = 'Please enter a valid salary amount (greater than 0)';
        }

        if (!localData.size_t_shift) {
            newErrors.size_t_shift = 'T-shirt size is required';
        }

        if (!localData.name_t_shift.trim()) {
            newErrors.name_t_shift = 'T-shirt name is required';
        }

        if (!localData.photo) {
            newErrors.photo = 'Operator photo is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = (): void => {
        if (validateForm()) {
            // Synchronize all fields with the parent formData
            updateFormData({
                code: localData.code,
                salary: localData.salary,
                size_t_shift: localData.size_t_shift,
                name_t_shift: localData.name_t_shift,
                photo: localData.photo,
                status: localData.status
            });

            if (onSubmit) onSubmit();
        } else {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Validation Error",
                textBody: "Please check the errors in the form",
                autoClose: 3000,
            });
        }
    };

    return (
        <ScrollView>
            <View style={styles.stepForm}>
                <FormInput
                    label="Operator Code (*)"
                    value={localData.code}
                    onChangeText={(text) => handleChange('code', text)}
                    error={errors.code}
                    required={true}
                />

                <FormInput
                    label="Salary (*)"
                    value={localData.salary.toString()}
                    onChangeText={(text) => handleChange('salary', text)}
                    keyboardType="numeric"
                    error={errors.salary}
                    required={true}
                />

                <DropdownInput
                    label="T-shirt Size (*)"
                    value={localData.size_t_shift}
                    onChange={(value) => handleChange('size_t_shift', value)}
                    options={['S', 'M', 'L', 'XL']}
                    error={errors.size_t_shift}
                    required={true}
                />

                <FormInput
                    label="T-shirt Name (*)"
                    value={localData.name_t_shift}
                    onChangeText={(text) => handleChange('name_t_shift', text)}
                    error={errors.name_t_shift}
                    required={true}
                />

                <ImageUpload
                    label="Operator Photo (*)"
                    image={localData.photo}
                    onImageSelected={(image) => handleChange('photo', image)}
                    error={errors.photo}
                    required={true}
                />

                <DropdownInput
                    label="Status"
                    value={localData.status}
                    onChange={(value) => handleChange('status', value)}
                    options={['active', 'inactive']}
                    error={errors.status}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextButton} onPress={handleSave}>
                        <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
export default Step3Form;