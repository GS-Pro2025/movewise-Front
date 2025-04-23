import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, ImageUpload, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { StepProps } from '../Types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

const Step3Form = ({ formData, updateFormData, onBack, onSubmit, isEditing }: StepProps) => {
    console.log("Initial photo in Step3Form:", formData.photo);
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
            updateFormData({
                ...formData,
                ...localData
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
                        <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
export default Step3Form;