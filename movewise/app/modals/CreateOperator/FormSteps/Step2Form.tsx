import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, RadioGroup, DateInput, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { Son, StepProps } from '../Types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { useTranslation } from 'react-i18next';
import CrossPlatformImageUpload from '../../CrossPlatformImageUpload';
const Step2Form = ({ formData, updateFormData, onNext, onBack, isEditing }: StepProps) => {
    const { t } = useTranslation();
    const [localData, setLocalData] = useState({
        number_licence: formData.number_licence || '',
        zipcode: formData.zipcode || '',
        has_minors: formData.has_minors || false,
        n_children: formData.sons?.length || formData.n_children || 0,
        sons: formData.sons?.length > 0 ? [...formData.sons] : [],
        license_front: formData.license_front || null,
        license_back: formData.license_back || null,
    });

    useEffect(() => {
        // Update local data when formData changes (important for edit mode)
        setLocalData(prev => ({
            ...prev,
            number_licence: formData.number_licence || prev.number_licence,
            zipcode: formData.zipcode || prev.zipcode,
            has_minors: formData.has_minors ?? prev.has_minors,
            n_children: formData.sons?.length || formData.n_children || prev.n_children,
            sons: formData.sons?.length > 0 ? [...formData.sons] : prev.sons,
            license_front: formData.license_front || prev.license_front,
            license_back: formData.license_back || prev.license_back,
        }));
    }, [formData]);

    // State for the current son being added
    const [currentSon, setCurrentSon] = useState<Partial<Son>>({
        name: '',
        birth_date: '',
        gender: 'M'
    });

    // Errores de validación
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sonErrors, setSonErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: any): void => {
        console.log(`Step2Form - Changing ${field} to:`, value);

        setLocalData(prev => ({ ...prev, [field]: value }));
        updateFormData({ [field]: value });

        // Limpiar error
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleSonChange = (field: string, value: string): void => {
        setCurrentSon({ ...currentSon, [field]: value });
        // Limpiar error
        if (sonErrors[field]) {
            setSonErrors({ ...sonErrors, [field]: '' });
        }
    };

    const validateSon = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!currentSon.name?.trim()) {
            newErrors.name = 'Child name is required';
        } else if (currentSon.name.length < 2) {
            newErrors.name = 'Child name must be at least 2 characters long';
        }

        if (!currentSon.birth_date) {
            newErrors.birth_date = t("birth_date_required");
        } else {
            const today = new Date();
            const dob = new Date(currentSon.birth_date);
            const age = today.getFullYear() - dob.getFullYear();
            if (age >= 18) {
                newErrors.birth_date = t("child_under_18");
            }
        }

        if (!currentSon.gender) {
            newErrors.gender = t("gender_required");
        }

        setSonErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addSon = (): void => {
        if (validateSon()) {
            const updatedSons = [...localData.sons, currentSon as Son];
            const newData = {
                ...localData,
                sons: updatedSons,
                n_children: updatedSons.length
            };

            setLocalData(newData);

            updateFormData({
                sons: updatedSons,
                n_children: updatedSons.length
            });

            setCurrentSon({ name: '', birth_date: '', gender: 'M' });

            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: t("child_added"),
                textBody: t("child_added_successfully"),
                autoClose: 1500,
            });
        }
    };

    const removeSon = (index: number): void => {
        const updatedSons = localData.sons.filter((_, i) => i !== index);
        const newData = {
            ...localData,
            sons: updatedSons,
            n_children: updatedSons.length
        };

        setLocalData(newData);

        updateFormData({
            sons: updatedSons,
            n_children: updatedSons.length
        });

        Toast.show({
            type: ALERT_TYPE.INFO,
            title: t("child_deleted"),
            textBody: t("child_deleted_successfully"),
            autoClose: 1500,
        });
    };

    // Validar todo el formulario
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // if (!localData.number_licence?.trim()) {
        //     newErrors.number_licence = 'License number is required';
        // }

        if (localData.zipcode && !/^\d{5}(-\d{4})?$/.test(localData.zipcode)) {
            newErrors.zipcode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
        }

        // if (!localData.license_front) {
        //     newErrors.license_front = 'Front license photo is required';
        // }

        // if (!localData.license_back) {
        //     newErrors.license_back = 'Back license photo is required';
        // }

        if (localData.has_minors && localData.sons.length === 0) {
            newErrors.sons = 'Please add at least one child';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (): void => {
        if (validateForm()) {
            // Sincronizar todos los campos con el formData principal
            updateFormData({
                number_licence: localData.number_licence,
                zipcode: localData.zipcode,
                has_minors: localData.has_minors,
                n_children: localData.n_children,
                sons: localData.sons,
                license_front: localData.license_front,
                license_back: localData.license_back,
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
        <ScrollView>
            <View style={styles.stepForm}>
                <Text style={styles.sectionTitle}>{t("license_info")}</Text>

                <FormInput
                    label={`${t("license_number")} (*)`}
                    value={localData.number_licence}
                    onChangeText={(text) => handleChange('number_licence', text)}
                    error={errors.number_licence}
                    required={true}
                />

                <FormInput
                    label={`${t("zipcode_label")} (*)`}
                    value={localData.zipcode}
                    onChangeText={(text) => handleChange('zipcode', text)}
                    keyboardType="numeric"
                    error={errors.zipcode}
                    required={false}
                />

                <CrossPlatformImageUpload
                    label={`${t("front_license_photo")} (*)`}
                    image={localData.license_front}
                    onImageSelected={(image) => handleChange('license_front', image)}
                    error={errors.license_front}
                    required={true}
                />

                <CrossPlatformImageUpload
                    label={`${t("back_license_photo")} (*)`}
                    image={localData.license_back}
                    onImageSelected={(image) => handleChange('license_back', image)}
                    error={errors.license_back}
                    required={true}
                />

                <Text style={styles.subSectionTitle}>{t("children_info")}</Text>

                <RadioGroup
                    label={`${t("question_children")}`}
                    options={[
                        { label: 'Yes', value: true },
                        { label: 'No', value: false }
                    ]}
                    selectedValue={localData.has_minors}
                    onSelect={(value) => handleChange('has_minors', value)}
                    error={errors.has_minors}
                    required={true}
                />

                {localData.has_minors && (
                    <>
                        <Text style={styles.inputLabel}>{t("number_of_children")}: {localData.n_children}</Text>
                        {errors.sons && <Text style={styles.errorText}>{errors.sons}</Text>}

                        {/* Lista de hijos agregados */}
                        {localData.sons.length > 0 && (
                            <View style={styles.sonsList}>
                                <Text style={styles.subsectionTitle}>{t("added_children")}:</Text>
                                {localData.sons.map((son, index) => (
                                    <View key={index} style={styles.sonItem}>
                                        <Text>{son.name} - {son.birth_date} - {son.gender === 'M' ? t("male") : t("female")}</Text>
                                        <TouchableOpacity onPress={() => removeSon(index)}>
                                            <Text style={styles.removeButton}>{t("delete")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Formulario para agregar un nuevo hijo */}
                        <View style={styles.addSonForm}>
                            <Text style={styles.subsectionTitle}>{t("add_child")}:</Text>

                            <FormInput
                                label={`${t("name")} (*)`}
                                value={currentSon.name || ''}
                                onChangeText={(text) => handleSonChange('name', text)}
                                error={sonErrors.name}
                                required={true}
                            />

                            <DateInput
                                label={`${t("birth_date")} (*)`}
                                value={currentSon.birth_date || ''}
                                onChangeDate={(date) => handleSonChange('birth_date', date)}
                                error={sonErrors.birth_date}
                                required={true}
                            />

                            <DropdownInput
                                label={`${t("gender")} (*)`}
                                value={
                                    currentSon.gender === 'M'
                                        ? t("male")
                                        : currentSon.gender === 'F'
                                            ? t("female")
                                            : ''
                                }
                                onChange={(value) => handleSonChange('gender', value)}
                                options={['M', 'F']}
                                error={sonErrors.gender}
                                required={true}
                            />

                            <TouchableOpacity style={styles.addButton} onPress={addSon}>
                                <Text style={styles.buttonText}>{t("add_child")}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
                        <Text style={styles.buttonText}>{t("back")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.buttonText}>{t("next")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default Step2Form;