import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "@/app/Colors";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerUser } from "@/hooks/api/RegistryClient"; 
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { GetAdminInfo } from "@/hooks/api/GetAdminByToken"; // Importa el hook
import _PhoneInput from 'react-native-phone-number-input';
import type { CountryCode } from 'react-native-country-picker-modal';
import CountryFlag from "react-native-country-flag";
const PhoneInput = _PhoneInput as any;

const CreateAdminUser = () => {
  const theme = useColorScheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [cellPhone, setCellPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>("US");
  const phoneInputRef = useRef<any>(null);
  // Estados para los campos
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [adressPerson, setAddress] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // <-- Añadido

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = t("email_required");
    if (!userName) newErrors.userName = t("username_required");
    if (!password) {
      newErrors.password = t("password_required");
    } else if (password.length < 6) {
      newErrors.password = t("password_min_length"); 
    }
    if (!firstName) newErrors.firstName = t("first_name_required");
    if (!lastName) newErrors.lastName = t("last_name_required");
    if (!birthDate) newErrors.birthDate = t("birthdate_required");
    if (!idType) newErrors.idType = t("id_type_required");
    if (!idNumber) newErrors.idNumber = t("id_number_required");
    if (!adressPerson) newErrors.adressPerson = t("address_required");
    if (!cellPhone) newErrors.phone = t("phone_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAdmin = async () => {
    if (!validateFields()) {
      Toast.show({
        type: "error",
        text1: t("validation_error"),
        text2: t("fix_errors_before_submitting"),
      });
      return;
    }

    let company_id = null;
    try {
      const adminInfo = await GetAdminInfo();
      company_id = adminInfo.person.id_company;
    } catch (e) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("no_company_id_found"),
      });
      return;
    }

    const dataToSend = {
      user_name: userName,
      password: password,
      person: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        phone: String(formattedPhone), // <--- aquí
        address: adressPerson,
        id_number: idNumber,
        type_id: idType,
        id_company: Number(company_id)
      },
    };

    try {
      const response = await registerUser(dataToSend);
      //si la response el 400
      if (response?.status === 400) {
        const errorMsg = response?.data?.messUser || "admin_creation_failed";
        const translatedMsg = t(errorMsg, { defaultValue: errorMsg });
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: translatedMsg,
        });
        return;
      }
      // Si el backend devuelve messUser, úsalo y tradúcelo si existe
      const messUser = response?.messUser || "registration_successful";
      const translatedMsg = t(messUser, { defaultValue: messUser });

      Toast.show({
        type: "success",
        text1: t("admin_created"),
        text2: translatedMsg,
      });
      await new Promise(resolve => setTimeout(resolve, 300));
      router.back();

      
    } catch (error: any) {
      // Intenta extraer messUser del error del backend
      let messUser = error?.response?.data?.messUser || "admin_creation_failed";
      const translatedMsg = t(messUser, { defaultValue: messUser });

      Toast.show({
        type: "error",
        text1: t("error"),
        text2: translatedMsg,
      });
    }
  };

  return (
    <>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        style={[
          styles.background,
          { backgroundColor: "#0B2863" },
        ]}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <ScrollView contentContainerStyle={styles.container}>

            <Text
              style={[
                styles.title,
                { color: theme === "dark" ? colors.textDark : colors.primary },
              ]}
            >
              {t("create_new_admin")}
            </Text>

            {/* Email */}
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.email
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder={t("email_placeholder")}
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Username */}
            {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.userName && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.userName
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder={t("username_placeholder")}
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={userName}
              onChangeText={setUserName}
            />

            {/* Password */}
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            <View style={{ position: "relative" }}>
              <TextInput
                style={[
                  styles.input,
                  errors.password && styles.inputError,
                  {
                    backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                    color: theme === "dark" ? colors.textDark : colors.textLight,
                    borderColor: errors.password
                      ? "#FF0000"
                      : theme === "dark"
                      ? colors.borderDark
                      : colors.borderLight,
                  },
                ]}
                placeholder={t("password_placeholder")}
                placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 16,
                  top: 12,
                  zIndex: 10,
                }}
                onPress={() => setPasswordVisible((v) => !v)}
              >
                <MaterialIcons
                  name={passwordVisible ? "visibility" : "visibility-off"}
                  size={24}
                  color={theme === "dark" ? colors.textDark : colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Nombre */}
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.firstName && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.firstName
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder={t("first_name_placeholder")}
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={firstName}
              onChangeText={setFirstName}
            />

            {/* Apellido */}
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.lastName && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.lastName
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder={t("last_name_placeholder")}
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={lastName}
              onChangeText={setLastName}
            />

            {/* Fecha de nacimiento */}
            {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
            <View style={{ zIndex: 1000, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setDatePickerVisibility(true)}
                style={[
                  styles.input,
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                    borderColor: errors.birthDate
                      ? "#FF0000"
                      : theme === "dark"
                      ? colors.borderDark
                      : colors.borderLight,
                  },
                ]}
              >
                <Text style={{ color: birthDate ? (theme === "dark" ? colors.textDark : colors.textLight) : (theme === "dark" ? colors.placeholderDark : colors.placeholderLight) }}>
                  {birthDate ? birthDate : t("birthdate_placeholder")}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color={theme === "dark" ? colors.placeholderDark : colors.placeholderLight} />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(selectedDate) => {
                  setDatePickerVisibility(false);
                  setBirthDate(selectedDate.toISOString().split("T")[0]);
                }}
                onCancel={() => setDatePickerVisibility(false)}
              />
            </View>

            {/* Tipo de ID */}
            {errors.idType && <Text style={styles.errorText}>{errors.idType}</Text>}
            <View
              style={[
                styles.input,
                {
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  justifyContent: "center",
                  borderColor: errors.idType
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                },
              ]}
            >
              <Picker
                selectedValue={idType}
                onValueChange={(itemValue) => setIdType(itemValue)}
                style={{
                  color: theme === "dark" ? colors.placeholderDark : colors.placeholderLight,
                  backgroundColor: "transparent",
                }}
                dropdownIconColor={theme === "dark" ? colors.textDark : colors.textLight}
              >
                <Picker.Item label={t("id_type_placeholder")} value="" color={theme === "dark" ? colors.placeholderDark : colors.placeholderLight} />
                <Picker.Item label={t("id_type_drivers_license")} value="DL" />
                <Picker.Item label={t("id_type_state_id")} value="SI" />
                <Picker.Item label={t("id_type_green_card")} value="GC" />
                <Picker.Item label={t("id_type_passport")} value="PA" />
              </Picker>
            </View>

            {/* Número de ID */}
            {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.idNumber && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.idNumber
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder={t("id_number_placeholder")}
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={idNumber}
              onChangeText={setIdNumber}
            />

            {/* Dirección */}
            {errors.adressPerson && <Text style={styles.errorText}>{errors.adressPerson}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.adressPerson && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.adressPerson
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder={t("address_placeholder")}
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={adressPerson}
              onChangeText={setAddress}
            />

            {/* Teléfono */}
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            <View style={{ marginBottom: 16 }}>
              <PhoneInput
                ref={phoneInputRef}
                value={cellPhone}
                defaultCode={phoneCountryCode}
                layout="first"
                flagButton={(props: any) => (
                  <TouchableOpacity
                    style={{ justifyContent: 'center', alignItems: 'center', width: 70 }}
                    onPress={props.onPress}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CountryFlag isoCode={props.isoCode} size={20} style={{ marginRight: 8 }} />
                      <Text style={{
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontSize: 16
                      }}>
                        {props.callingCode}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                onChangeText={setCellPhone}
                onChangeFormattedText={(text: string) => {
                  const callingCode = phoneInputRef.current?.getCallingCode() || '';
                  let formattedNumber = text;
                  if (text.startsWith(`+${callingCode}`) && !text.includes('-')) {
                    formattedNumber = `${text.slice(0, callingCode.length + 1)}-${text.slice(callingCode.length + 1)}`;
                  }
                  setFormattedPhone(formattedNumber);
                }}
                onChangeCountry={(country: any) => {
                  setPhoneCountryCode(country.cca2);
                  setCellPhone('');
                  const newPrefix = `+${country.callingCode}`;
                  const newFormatted = `${newPrefix}-`;
                  setFormattedPhone(newFormatted);
                }}
                withDarkTheme={theme === 'dark'}
                withShadow={false}
                autoFocus={false}
                containerStyle={[
                  styles.phoneContainer,
                  {
                    backgroundColor: theme === 'dark' ? '#FFFFFF36' : '#ffffff',
                    borderColor: theme === 'dark' ? colors.borderDark : colors.primary,
                    height: 50,
                    minHeight: 50,
                  }
                ]}
                textContainerStyle={{
                  backgroundColor: 'transparent',
                  height: 48,
                  paddingVertical: 0,
                  paddingLeft: 0,
                }}
                textInputStyle={{
                  color: theme === 'dark' ? colors.textDark : colors.textLight,
                  height: 48,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                  backgroundColor: 'transparent',
                }}
                codeTextStyle={{
                  color: theme === 'dark' ? colors.textDark : colors.textLight,
                  height: 48,
                  paddingVertical: 0,
                  textAlignVertical: 'center',
                  lineHeight: 20,
                  backgroundColor: 'transparent',
                }}
                flagButtonStyle={{
                  width: 60,
                  height: 48,
                  paddingHorizontal: 8,
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
                }}
                countryPickerButtonStyle={{
                  height: 48,
                  paddingHorizontal: 8,
                }}
                renderDropdownImage={
                  <View style={{ marginLeft: 4 }}>
                    <Text style={{
                      color: theme === 'dark' ? '#ffffff' : '#1f2937',
                      fontSize: 12
                    }}>▼</Text>
                  </View>
                }
              />
            </View>
            {/* Botón de crear */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleCreateAdmin}
            >
              <Text style={styles.buttonText}>{t("create_admin_button")}</Text>
            </TouchableOpacity>

            {/* Botón de cancelar abajo */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
    <Toast/>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    paddingBottom: 80,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#FF0000",
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    height: 48,
    backgroundColor: "#002366",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  termsText: {
    marginLeft: 8,
    color: "#000",
    fontSize: 14,
  },
  link: {
    color: "#002366",
    textDecorationLine: "underline",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
  },
  backButtonText: {
    color: "#002366",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 24,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  phoneContainer: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
});

export default CreateAdminUser;