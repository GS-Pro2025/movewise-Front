import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { FormInput, ImageUpload, RadioGroup, DateInput, DropdownInput } from '../HelperComponents';
import { styles } from '../FormStyle';
import { Son, StepProps } from '../Types';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';

const Step2Form = ({ formData, updateFormData, onNext, onBack, isEditing }: StepProps) => {

    const [localData, setLocalData] = useState({
        number_licence: formData.number_licence,
        code: formData.code,
        has_minors: formData.has_minors,
        n_children: formData.sons.length || formData.n_children || 0,
        sons: formData.sons.length > 0 ? [...formData.sons] : [],
        license_front: formData.license_front,
        license_back: formData.license_back,
    });

    // State for the current son being added
    const [currentSon, setCurrentSon] = useState<Partial<Son>>({
        name: '',
        birth_date: '',
        gender: 'M'
    });

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sonErrors, setSonErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: any): void => {
        setLocalData({ ...localData, [field]: value });
        // Clear error
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleSonChange = (field: string, value: string): void => {
        setCurrentSon({ ...currentSon, [field]: value });
        // Clear error
        if (sonErrors[field]) {
            setSonErrors({ ...sonErrors, [field]: '' });
        }
    };

    const validateSon = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!currentSon.name?.trim()) {
            newErrors.name = 'Child name is required';
        }

        if (!currentSon.birth_date) {
            newErrors.birth_date = 'Birth date is required';
        } else {
            const today = new Date();
            const dob = new Date(currentSon.birth_date);
            const age = today.getFullYear() - dob.getFullYear();
            if (age >= 18) {
                newErrors.birth_date = 'Child must be under 18 years old';
            }
        }

        if (!currentSon.gender) {
            newErrors.gender = 'Gender is required';
        }

        setSonErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addSon = (): void => {
        if (validateSon()) {
            const updatedSons = [...localData.sons, currentSon as Son];
            setLocalData(prev => ({
                ...prev,
                sons: updatedSons,
                n_children: updatedSons.length // Update n_children here
            }));
            
            setCurrentSon({ name: '', birth_date: '', gender: 'M' });

            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: "Child Added",
                textBody: "Child information has been added",
                autoClose: 1500,
            });
        }
    };

    const removeSon = (index: number): void => {
        const updatedSons = localData.sons.filter((_, i) => i !== index);
        setLocalData({
            ...localData,
            sons: updatedSons,
            n_children: updatedSons.length
        });

        Toast.show({
            type: ALERT_TYPE.INFO,
            title: "Child Removed",
            textBody: "Child information has been removed",
            autoClose: 1500,
        });
    };

    // Validate the entire form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // if (!localData.drivingLicenseNumber.trim()) {
        //     newErrors.drivingLicenseNumber = 'License number is required';
        // }

        // if (!localData.code.trim()) {
        //     newErrors.code = 'Code is required';
        // }

        if (localData.has_minors && localData.sons.length === 0) {
            newErrors.sons = 'Please add children information';
        }

        // if (!localData.licenseFront) {
        //     newErrors.licenseFront = 'License front photo is required';
        // }

        // if (!localData.licenseBack) {
        //     newErrors.licenseBack = 'License back photo is required';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (): void => {
        if (validateForm()) {
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
                <Text style={styles.sectionTitle}>Driving License Information</Text>

                <FormInput
                    label="Driving License Number (*)"
                    value={localData.number_licence}
                    onChangeText={(text) => handleChange('number_licence', text)}
                    error={errors.number_licence}
                    required={true}
                />

                <FormInput
                    label="Code (*)"
                    value={localData.code}
                    onChangeText={(text) => handleChange('code', text)}
                    error={errors.code}
                    required={true}
                />

                <ImageUpload
                    label="License Front Photo (*)"
                    image={localData.license_front}
                    onImageSelected={(image) => handleChange('license_front', image)}
                    error={errors.license_front}
                    required={true}
                />

                <ImageUpload
                    label="License Back Photo (*)"
                    image={localData.license_back}
                    onImageSelected={(image) => handleChange('license_back', image)}
                    error={errors.license_back}
                    required={true}
                />

                <Text style={styles.subSectionTitle}>Children Information</Text>

                <RadioGroup
                    label="Do you have minor children? (*)"
                    options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                    selectedValue={localData.has_minors}
                    onSelect={(value) => handleChange('has_minors', value)}
                />

                {localData.has_minors && (
                    <>
                        <Text style={styles.inputLabel}>Children Count: {localData.n_children}</Text>
                        {errors.sons && <Text style={styles.errorText}>{errors.sons}</Text>}

                        {/* List of added children */}
                        {localData.sons.length > 0 && (
                            <View style={styles.sonsList}>
                                <Text style={styles.subsectionTitle}>Added Children:</Text>
                                {localData.sons.map((son, index) => (
                                    <View key={index} style={styles.sonItem}>
                                        <Text>{son.name} - {son.birth_date} - {son.gender === 'M' ? 'Male' : 'Female'}</Text>
                                        <TouchableOpacity onPress={() => removeSon(index)}>
                                            <Text style={styles.removeButton}>Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Form to add a new child */}
                        <View style={styles.addSonForm}>
                            <Text style={styles.subsectionTitle}>Add Child:</Text>

                            <FormInput
                                label="Name (*)"
                                value={currentSon.name || ''}
                                onChangeText={(text) => handleSonChange('name', text)}
                                error={sonErrors.name}
                                required={true}
                            />

                            <DateInput
                                label="Date of Birth (*)"
                                value={currentSon.birth_date || ''}
                                onChangeDate={(date) => handleSonChange('birth_date', date)}
                                error={sonErrors.birth_date}
                                required={true}
                            />

                            <DropdownInput
                                label="Gender (*)"
                                value={currentSon.gender || 'M'}
                                onChange={(value) => handleSonChange('gender', value)}
                                options={['M', 'F']}
                                error={sonErrors.gender}
                                required={true}
                            />

                            <TouchableOpacity style={styles.addButton} onPress={addSon}>
                                <Text style={styles.buttonText}>Add Child</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default Step2Form;