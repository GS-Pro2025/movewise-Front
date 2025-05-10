import React, { useState, useEffect } from 'react';
import { ScrollView, Platform, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, DateInput, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { StepProps, Operator } from '../Types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { ListOperators } from '@/hooks/api/Get_listOperator';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
const Step1Form = ({ formData, updateFormData, onNext, isEditing }: StepProps) => {
    // Estado local para rastrear los valores del formulario
    const { t } = useTranslation();
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
                console.error(t("operators_load_error"), error);
            }
        };

        fetchOperators();
    }, []);

    // Errores de validación
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string): void => {

        // Actualizar estado local
        setLocalData(prev => ({ ...prev, [field]: value }));

        updateFormData({ [field]: value });

        // Limpiar error cuando el usuario escribe
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    // Validar formulario
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!localData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        } else if (localData.first_name.length < 2) {
            newErrors.first_name = 'First name must be at least 2 characters long';
        }

        if (!localData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        } else if (localData.last_name.length < 2) {
            newErrors.last_name = 'Last name must be at least 2 characters long';
        }

        if (!localData.birth_date) {
            newErrors.birth_date = t("birth_date_required");
        } else {
            const today = new Date();
            const dob = new Date(localData.birth_date);
            const age = today.getFullYear() - dob.getFullYear();
            if (age < 18) {
                newErrors.birth_date = t("operator_minimum_age");
            }
        }

        if (!localData.type_id) {
            newErrors.type_id = t("identification_type_required");
        }

        if (!localData.id_number.trim()) {
            newErrors.id_number = 'ID number is required';
        } else if (localData.id_number.length < 5) {
            newErrors.id_number = 'ID number must be at least 5 characters long';
        } else if (!/^\d+$/.test(localData.id_number)) {
            newErrors.id_number = 'ID number must contain only numbers';
        }

        if (!localData.address.trim()) {
            newErrors.address = t("address_required");
        }

        if (!localData.phone.trim()) {
            newErrors.phone = t("phone_required");
        } else if (!/^\+?[0-9]{10,15}$/.test(localData.phone)) {
            newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
        }

        if (localData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (): void => {
        if (validateForm()) {
            // Sincronizar todos los campos con el formData principal
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
                title: t("validation_error"),
                textBody: t("review_form_errors"),
                autoClose: 3000,
            });
        }
    };

    return (
       
            <ScrollView
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ flexGrow: 1 }}
                automaticallyAdjustKeyboardInsets={true}
                contentInsetAdjustmentBehavior="automatic"
            >
                <View style={[styles.stepForm, { flex: 1 }]}>
                    <Text style={styles.sectionTitle}>{t("general_data")}</Text>

                    <FormInput
                        label={`${t("name")} (*)`}
                        value={localData.first_name}
                        onChangeText={(text) => handleChange('first_name', text)}
                        error={errors.first_name}
                        required={true}
                    />

                    <FormInput
                        label={`${t("last_name")} (*)`}
                        value={localData.last_name}
                        onChangeText={(text) => handleChange('last_name', text)}
                        error={errors.last_name}
                        required={true}
                    />

                    <DateInput
                        label={`${t("birth_date")} (*)`}
                        value={localData.birth_date}
                        onChangeDate={(date) => handleChange('birth_date', date)}
                        error={errors.birth_date}
                        required={true}
                    />

                    <DropdownInput
                        label={`${t("identification_type")} (*)`}
                        value={localData.type_id}
                        onChange={(value) => handleChange('type_id', value)}
                        options={[t("passport"), t("driver_license"), t("id_card")]}
                        error={errors.type_id}
                        required={true}
                    />

                    <FormInput
                        label={`${t("id_number")} (*)`}
                        value={localData.id_number}
                        onChangeText={(text) => handleChange('id_number', text)}
                        error={errors.id_number}
                        keyboardType="numeric"
                        required={true}
                    />

                    <FormInput
                        label={`${t("address")} (*)`}
                        value={localData.address}
                        onChangeText={(text) => handleChange('address', text)}
                        error={errors.address}
                        required={true}
                    />

                    <FormInput
                        label={`${t("phone")} (*)`}
                        value={localData.phone}
                        onChangeText={(text) => handleChange('phone', text)}
                        keyboardType="phone-pad"
                        error={errors.phone}
                        required={true}
                    />

                    <FormInput
                        label={t("email")}
                        value={localData.email}
                        onChangeText={(text) => handleChange('email', text)}
                        keyboardType="email-address"
                        error={errors.email}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                            <Text style={styles.buttonText}>{t("cancel")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.buttonText}>{t("next")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
    );
};

export default Step1Form;