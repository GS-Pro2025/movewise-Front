import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { StepProps } from '../Types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { useTranslation } from 'react-i18next';
import CrossPlatformImageUpload from '../../CrossPlatformImageUpload';

const Step3Form = ({ formData, updateFormData, onBack, onSubmit, isEditing }: StepProps) => {
    const { t } = useTranslation();
    const [localData, setLocalData] = useState({
        code: formData.code || '',
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

        if (!localData.code.trim()) {
            newErrors.code = t("operator_code_required");
        } else if (localData.code.length < 3) {
            newErrors.code = t("operator_code_length");
        }

        if (!localData.salary.toString().trim()) {
            newErrors.salary = t("salary_required");
        } else if (isNaN(parseFloat(localData.salary)) || parseFloat(localData.salary) <= 0) {
            newErrors.salary = t("salary_amount_invalid");
        }

        if (!localData.size_t_shift) {
            newErrors.size_t_shift = t("tshirt_size_required");
        }

        if (!localData.name_t_shift.trim()) {
            newErrors.name_t_shift = t("tshirt_name_required");
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
                    label={`${t("operator_code")} (*)`}
                    value={localData.code}
                    onChangeText={(text) => handleChange('code', text)}
                    error={errors.code}
                    required={true}
                />

                <FormInput
                    label={`${t("salary")} (*)`}
                    value={localData.salary.toString()}
                    onChangeText={(text) => handleChange('salary', text)}
                    keyboardType="numeric"
                    error={errors.salary}
                    required={true}
                />

                <DropdownInput
                    label={`${t("tshirt_size")} (*)`}
                    value={localData.size_t_shift}
                    onChange={(value) => handleChange('size_t_shift', value)}
                    options={['S', 'M', 'L', 'XL']}
                    error={errors.size_t_shift}
                    required={true}
                />

                <FormInput
                    label={`${t("tshirt_name")} (*)`}
                    value={localData.name_t_shift}
                    onChangeText={(text) => handleChange('name_t_shift', text)}
                    error={errors.name_t_shift}
                    required={true}
                />

                <CrossPlatformImageUpload
                    label={`${t("operator_photo")} (*)`}
                    image={localData.photo}
                    onImageSelected={(image) => handleChange('photo', image)}
                    error={errors.photo}
                    required={true}
                />

                <DropdownInput
                    label={t("status")}
                    value={
                        localData.status === "active"
                            ? t("active")
                            : localData.status === "inactive"
                                ? t("inactive")
                                : ""
                    }
                    onChange={(value) => handleChange("status", value)}
                    options={["active", "inactive"]}
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