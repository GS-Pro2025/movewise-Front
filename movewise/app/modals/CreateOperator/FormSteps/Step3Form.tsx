import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, ImageUpload, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { StepProps } from '../Types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { useTranslation } from 'react-i18next';

const Step3Form = ({ formData, updateFormData, onBack, onSubmit, isEditing }: StepProps) => {
    const { t } = useTranslation();
    const [localData, setLocalData] = useState({
        salary: formData.salary,
        size_t_shift: formData.size_t_shift,
        name_t_shift: formData.name_t_shift,
        photo: formData.photo,
        status: formData.status || 'active' 
    });

    // Errores de validación
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: any): void => {

        setLocalData(prev => ({ ...prev, [field]: value }));

        // Actualizar el formData principal inmediatamente
        updateFormData({ [field]: value });

        // Limpiar error
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!localData.salary.toString().trim()) {
            newErrors.salary = t("salary_required");
        } else if (isNaN(parseFloat(localData.salary)) || parseFloat(localData.salary) <= 0) {
            newErrors.salary = t("salary_invalid");
        }

        if (!localData.size_t_shift) {
            newErrors.size_t_shift = t("size_required");
        }

        if (!localData.name_t_shift.trim()) {
            newErrors.name_t_shift = t("shirt_name_required");
        }

        if (!localData.photo) {
            newErrors.photo = t("photo_required");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = (): void => {
        if (validateForm()) {
            // Sincronizar todos los campos con el formData principal
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
                title: t("validation_error"),
                textBody: t("review_form_errors"),
                autoClose: 3000,
            });
        }
    };

    return (
        <ScrollView>
            <View style={styles.stepForm}>
                <FormInput
                    label={`${t("salary")} (*)`}
                    value={localData.salary.toString()}
                    onChangeText={(text) => handleChange('salary', text)}
                    keyboardType="numeric"
                    error={errors.salary}
                    required={true}
                />

                <DropdownInput
                    label={`${t("size")} (*)`}
                    value={localData.size_t_shift}
                    onChange={(value) => handleChange('size_t_shift', value)}
                    options={['S', 'M', 'L', 'XL']}
                    error={errors.size_t_shift}
                    required={true}
                />

                <FormInput
                    label={`${t("shirt_name")} (*)`}
                    value={localData.name_t_shift}
                    onChangeText={(text) => handleChange('name_t_shift', text)}
                    error={errors.name_t_shift}
                    required={true}
                />

                <ImageUpload
                    label={`${t("photo")} (*)`}
                    image={localData.photo}
                    onImageSelected={(image) => handleChange('photo', image)}
                    error={errors.photo}
                    required={true}
                />

                <DropdownInput
                    label={t("status")}
                    value={localData.status}
                    onChange={(value) => handleChange('status', value)}
                    options={[t("active"), t("inactive")]}
                    error={errors.status}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
                        <Text style={styles.buttonText}>{t("back")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextButton} onPress={handleSave}>
                        <Text style={styles.buttonText}>{isEditing ? t("update") : t("save")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
export default Step3Form;