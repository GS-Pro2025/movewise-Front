import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Platform, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { FormInput, DateInput, DropdownInput } from '@/app/components/operators/HelperComponents';
import styles from '@/app/components/operators/FormStyle';
import { StepProps, Operator } from '@/types/operator.types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { ListOperators } from '@/hooks/api/Get_listOperator';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import _PhoneInput from 'react-native-phone-number-input';
import CountryFlag from 'react-native-country-flag';
import type { CountryCode } from 'react-native-country-picker-modal';
import colors from '@/app/Colors';

const PhoneInput = _PhoneInput as any;
const Step1Form = ({ formData, updateFormData, onNext, isEditing }: StepProps) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const phoneInput = useRef<any>(null);


    const renderFlagButton = (props: any) => (
        <TouchableOpacity
            style={[styles.phoneFlagButton, { width: 70 }]}
            onPress={props.onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CountryFlag
                    isoCode={props.isoCode}
                    size={20}
                    style={{ marginRight: 8 }}
                />
                <Text style={[styles.phoneCodeText, {
                    color: isDarkMode ? colors.textDark : colors.textLight
                }]}>
                    {props.callingCode}
                </Text>
            </View>
        </TouchableOpacity>
    );

    // Estado local para rastrear los valores del formulario
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

    const initialPhone = formData.phone || '';
    const [phoneValue, setPhoneValue] = useState(() => {
        if (initialPhone) {
            if (initialPhone.includes('-')) {
                return initialPhone.split('-')[1];
            }
            // Extraer la parte local basada en la longitud del prefijo
            const matches = initialPhone.match(/^\+\d{1,3}/);
            if (matches && matches[0]) {
                return initialPhone.replace(matches[0], '');
            }
            return initialPhone.replace(/^\+\d{1,3}/, '');
        }
        return '';
    });

    const [formattedPhone, setFormattedPhone] = useState(initialPhone);

    const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>(() => {
        if (initialPhone) {
            const prefix = initialPhone.startsWith('+376') ? 'AD' :
                initialPhone.startsWith('+1') ? 'US' :
                    initialPhone.startsWith('+52') ? 'MX' :
                    initialPhone.startsWith('+1') ? 'US' :
                        initialPhone.startsWith('+57') ? 'CO' : 'CO';
            return prefix as CountryCode;
        }
        return 'US'; 
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

    const handleFirstNameChange = (text: string) => {
        updateFormData({ first_name: text });
    };

    const handleLastNameChange = (text: string) => {
        updateFormData({ last_name: text });
    };

    const handleBirthDateChange = (date: string) => {
        updateFormData({ birth_date: date });
    };

    const handleTypeIdChange = (value: string) => {
        updateFormData({ type_id: value });
    };

    const handleIdNumberChange = (text: string) => {
        updateFormData({ id_number: text });
    };

    const handleAddressChange = (text: string) => {
        updateFormData({ address: text });
    };

    // Manejador específico para el teléfono
    const handlePhoneChange = (text: string) => {
        setPhoneValue(text);
    };
    const handleFormattedPhoneChange = (formattedText: string) => {
        // Obtener el código de llamada del país actual
        const callingCode = phoneInput.current?.getCallingCode() || '';

        // Crear expresión regular dinámica para dividir el número
        const prefixPattern = new RegExp(`(\\+${callingCode})(\\d+)`);
        const formattedWithDash = formattedText.replace(prefixPattern, '$1-$2');

        setFormattedPhone(formattedWithDash);
        updateFormData({ phone: formattedWithDash });

        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const handleEmailChange = (text: string) => {
        updateFormData({ email: text });
    };

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
        }

        if (!localData.address.trim()) {
            newErrors.address = t("address_required");
        }

        // Validación mejorada para el teléfono usando el PhoneInput
        if (!formattedPhone.trim()) {
            newErrors.phone = t("phone_required");
        } else {
            // Convertir a formato E.164 para validación
            const e164Number = formattedPhone.replace('-', '');
            const checkValid = phoneInput.current?.isValidNumber(e164Number);
            if (!checkValid) {
                newErrors.phone = t("phone_invalid") || 'Please enter a valid phone number';
            }
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
                phone: formattedPhone,
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
            style={[{ backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
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
                    keyboardType="default"
                    required={true}
                />

                <FormInput
                    label={`${t("address")} (*)`}
                    value={localData.address}
                    onChangeText={(text) => handleChange('address', text)}
                    error={errors.address}
                    required={true}
                />

                {/* Campo de teléfono con react-phone-number-input */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: isDarkMode ? colors.textDark : colors.textLight }]}>
                        {t("phone")} (*)
                    </Text>
                    <PhoneInput
                        ref={phoneInput}
                        value={phoneValue}
                        defaultCode={phoneCountryCode}
                        layout="first"
                        flagButton={renderFlagButton}
                        onChangeText={handlePhoneChange}
                        onChangeFormattedText={handleFormattedPhoneChange}
                        onChangeCountry={(country: any) => {
                            setPhoneCountryCode(country.cca2);
                            setPhoneValue('');

                            // Crear nuevo formato con prefijo y guión
                            const newPrefix = `+${country.callingCode}`;
                            const newFormatted = `${newPrefix}-`;
                            setFormattedPhone(newFormatted);
                            updateFormData({ phone: newFormatted });
                        }}
                        withDarkTheme={isDarkMode}
                        withShadow={false}
                        autoFocus={false}
                        containerStyle={[
                            styles.phoneContainer,
                            {
                                backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight,
                                borderColor: errors.phone
                                    ? colors.error
                                    : (isDarkMode ? colors.borderDark : colors.borderLight),
                                height: 50,
                                minHeight: 50,
                            }
                        ]}
                        textContainerStyle={[
                            styles.phoneTextContainer,
                            {
                                backgroundColor: 'transparent',
                                height: 48,
                                paddingVertical: 0,
                                paddingLeft: 0,
                            }
                        ]}
                        textInputStyle={[
                            styles.phoneTextInput,
                            {
                                color: isDarkMode ? colors.textDark : colors.textLight,
                                height: 48,
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                                includeFontPadding: false,
                                textAlignVertical: 'center',
                                backgroundColor: 'transparent',
                            }
                        ]}
                        codeTextStyle={[
                            styles.phoneCodeText,
                            {
                                color: isDarkMode ? colors.textDark : colors.textLight,
                                height: 48,
                                paddingVertical: 0,
                                textAlignVertical: 'center',
                                lineHeight: 20,
                                backgroundColor: 'transparent',
                            }
                        ]}
                        flagButtonStyle={[
                            styles.phoneFlagButton,
                            {
                                width: 60,
                                height: 48,
                                paddingHorizontal: 8,
                                backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight,
                            }
                        ]}
                        countryPickerButtonStyle={[
                            styles.phoneCountryPicker,
                            {
                                height: 48,
                                paddingHorizontal: 8,
                            }
                        ]}
                        renderDropdownImage={
                            <View style={styles.dropdownArrow}>
                                <Text style={{
                                    color: isDarkMode ? colors.textDark : colors.textLight,
                                    fontSize: 12
                                }}>▼</Text>
                            </View>
                        }
                    />
                    {errors.phone && (
                        <Text style={[styles.errorText, { color: colors.error }]}>
                            {errors.phone}
                        </Text>
                    )}
                </View>

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