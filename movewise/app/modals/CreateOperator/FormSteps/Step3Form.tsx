import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, ImageUpload, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { StepProps } from '../Types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

const Step3Form = ({ formData, updateFormData, onBack, onSubmit, isEditing }: StepProps) => {

    const [localData, setLocalData] = useState({
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

        if (!localData.salary.toString().trim()) {
            newErrors.salary = 'Salary is mandatory';
        } else if (isNaN(parseFloat(localData.salary)) || parseFloat(localData.salary) <= 0) {
            newErrors.salary = 'Enter a valid salary amount';
        }

        if (!localData.size_t_shift) {
            newErrors.size_t_shift = 'Size is mandatory';
        }

        if (!localData.name_t_shift.trim()) {
            newErrors.name_t_shift = 'The name for the shirt is mandatory';
        }

        if (!localData.photo) {
            newErrors.photo = 'Photo is mandatory';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = (): void => {
        if (validateForm()) {
            // Synchronize all fields with the parent formData
            updateFormData({
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
                    label="Salary (*)"
                    value={localData.salary.toString()}
                    onChangeText={(text) => handleChange('salary', text)}
                    keyboardType="numeric"
                    error={errors.salary}
                    required={true}
                />

                <DropdownInput
                    label="Size (*)"
                    value={localData.size_t_shift}
                    onChange={(value) => handleChange('size_t_shift', value)}
                    options={['S', 'M', 'L', 'XL']}
                    error={errors.size_t_shift}
                    required={true}
                />

                <FormInput
                    label="Name for the t-shirt (*)"
                    value={localData.name_t_shift}
                    onChangeText={(text) => handleChange('name_t_shift', text)}
                    error={errors.name_t_shift}
                    required={true}
                />

                <ImageUpload
                    label="Photo (*)"
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
                        <Text style={styles.buttonText}>Atrás</Text>
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