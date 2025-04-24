import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, ImageUpload, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { StepProps } from '../Types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

const Step3Form = ({ formData, updateFormData, onBack, onSubmit, isEditing }: StepProps) => {
    console.log("Initial photo in Step3Form:", formData.photo);

    useEffect(() => {
        setLocalData({
            salary: formData.salary,
            size_t_shift: formData.size_t_shift,
            name_t_shift: formData.name_t_shift,
            photo: formData.photo,
            status: formData.status
        });
    }, [formData]);

    const [localData, setLocalData] = useState({
        salary: formData.salary,
        size_t_shift: formData.size_t_shift,
        name_t_shift: formData.name_t_shift,
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

        if (!localData.size_t_shift) {
            newErrors.size_t_shift = 'Size is required';
        }

        if (!localData.name_t_shift.trim()) {
            newErrors.name_t_shift = 'T-shirt name is required';
        }

        if (!localData.photo) {
            newErrors.photo = 'Photo is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = (): void => {
        if (validateForm()) {
            updateFormData({
                ...localData, // Enviar solo los datos locales actualizados
                // Mantener datos críticos para operaciones de actualización
                id_operator: formData.id_operator
            });
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
                    value={localData.size_t_shift}
                    onChange={(value) => handleChange('size_t_shift', value)}
                    options={['S', 'M', 'L', 'XL']}
                    error={errors.size_t_shift}
                    required={true}
                />

                <FormInput
                    label="Name you want to wear in the T-shirt (*)"
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