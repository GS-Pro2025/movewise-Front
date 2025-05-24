import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { CreateCompany } from "../../hooks/api/CompanyClient";
import { registerUser } from "../../hooks/api/RegistryClient";
import HeaderWithDividerCreateTruck from "@/components/HeaderWithDividerCreateTruck";
import DropDownPicker from "react-native-dropdown-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ListStates } from "@/hooks/api/StatesClient";
import ModelState from "@/models/ModelState";
import { ModelCompany } from "@/models/ModelCompany";
import { useTranslation } from "react-i18next";
import CheckBox from "react-native-check-box";
import { registerUserWithCompany } from "@/hooks/api/RegisterUserWIthCompany";
import { getTerms_and_conditions } from "@/hooks/api/GetTerms_and_conditions";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { WebView } from "react-native-webview";
const RegistryUser = () => {
  const { t } = useTranslation();

  const router = useRouter();
  const { license, company_name, address, zip_code } = useLocalSearchParams();
  console.log("Company Data:", license, company_name, address, zip_code);
  // Asegúrate de que sean strings, y si no, convierte o valida
  const companyData: ModelCompany = {
    company_id: 0,//To review
    license_number: typeof license === "string" ? license : license?.[0] ?? "",
    name: typeof company_name === "string" ? company_name : company_name?.[0] ?? "",
    address: typeof address === "string" ? address : address?.[0] ?? "",
    zip_code: typeof zip_code === "string" ? zip_code : zip_code?.[0] ?? "",
  };
  console.log("Company Data:", companyData);
  const [termsVisible, setTermsVisible] = useState(false);
  const [termsHtml, setTermsHtml] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [adressPerson, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [openIdType, setOpenIdType] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [stateList, setStateList] = useState<{ label: string; value: string }[]>([]);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Added state for search term
  const [isChecked, setIsChecked] = useState(false); // Estado para el checkbox
  const insets = useSafeAreaInsets(); 

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    userName?: string; 
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    idType?: string;
    idNumber?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    adressPerson?: string;
    phone?: string;
  }>({});




  const handleDownloadTerms = async () => {
    try {
      // Llamar al backend para obtener los términos y condiciones
      const html = await getTerms_and_conditions();
      setTermsHtml(html);
      setTermsVisible(true); // Mostrar el modal con el HTML
    } catch (error) {
      console.error("Error al cargar los términos y condiciones:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los términos y condiciones.",
      });
    }
  };

  
  const validateFields = () => {
    const newErrors: {
      email?: string;
      password?: string;
      userName?: string; 
      firstName?: string;
      lastName?: string;
      birthDate?: string;
      idType?: string;
      idNumber?: string;
      state?: string;
      city?: string;
      zipCode?: string;
      adressPerson?: string;
      phone?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = t("email_required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("email_invalid_format");
    }

    if (!password.trim()) {
      newErrors.password = t("password_required");
    } else if (password.length < 6) {
      newErrors.password = t("password_min_length");
    }
    if (!userName.trim()) {
      newErrors.userName = t("username_required");
    }
    if (!firstName.trim()) {
      newErrors.firstName = t("first_name_required");
    }

    if (!lastName.trim()) {
      newErrors.lastName = t("last_name_required");
    }

    if (!birthDate.trim()) {
      newErrors.birthDate = t("birth_date_required");
    }

    if (!idType.trim()) {
      newErrors.idType = t("id_type_required");
    }

    if (!idNumber.trim()) {
      newErrors.idNumber = t("id_number_required");
    }

    if (!state.trim()) {
      newErrors.state = t("state_required");
    }

    if (!city.trim()) {
      newErrors.city = t("city_required");
    }

    if (!adressPerson.trim()) {
      newErrors.adressPerson = t("address_required");
    }

    if (!phone.trim()) {
      newErrors.phone = t("phone_required");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // Devuelve true si no hay errores
  };

  const handleRegister = async () => {
    if (!validateFields()) {
      Toast.show({
        type: "error",
        text1: t("validation_error"),
        text2: t("fix_errors_before_submitting"),
      });
      return;
    }
  
    if (!isChecked) {
      Toast.show({
        type: "error",
        text1: t("terms_required"),
        text2: t("accept_terms_to_continue"),
      });
      return;
    }
  
    try {
      // Construir el objeto con el formato solicitado
      const payload = {
        company: {
          license_number: companyData.license_number,
          name: companyData.name,
          address: companyData.address,
          zip_code: companyData.zip_code,
        },
        user: {
          user_name: userName,
          password: password,
          person: {
            email: email,
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
            phone: phone,
            address: adressPerson,
            id_number: idNumber,
            type_id: idType,
            state: state,
            city: city,
          },
        },
      };
  
      // Enviar la petición al backend
      const response = await registerUserWithCompany(payload);
  
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("company_and_user_registered"),
      });
  
      // Navegar a la pantalla de inicio con un mensaje de éxito
      router.push({
        pathname: "/Login",
        params: { toastMessage: t("company_and_user_registered") },
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("registration_error"),
        text2: error.message || t("registration_failed"),
      });
    }
  };

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const states: ModelState[] = await ListStates(); // Definir estados como ModelState[]
        setStateList(
          states.map((state) => ({
            label: String(state.name), 
            value: String(state.code),
          }))
        );
      } catch (error) {
        console.error(t("fetch_states_error"), error);
      }
    };

    fetchStates();
  }, []);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../../assets/images/bg_login.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t("register_user_admin", { companyName: companyData?.name })}</Text>
    
          {/* Sección de credenciales */}
          <View style={styles.separator} />
          <View style={styles.section}>
            <Text style={styles.textUserFields}>{t("user_admin_credentials")}</Text>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder={t("email_placeholder")}
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
            <TextInput
              style={[styles.input, errors.userName && styles.inputError]}
              placeholder={t("username_placeholder")}
              placeholderTextColor="#888"
              value={userName}
              onChangeText={setUserName}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder={t("password_placeholder")}
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.separator} />
          {/* Resto de campos */}
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          <View style={styles.section}>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder={t("first_name_placeholder")}
              placeholderTextColor="#888"
              value={firstName}
              onChangeText={setFirstName}
            />
    
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder={t("last_name_placeholder")}
              placeholderTextColor="#888"
              value={lastName}
              onChangeText={setLastName}
            />
    
            {/* Fecha de nacimiento */}
            {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
            <View style={{ zIndex: 1000, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setDatePickerVisibility(true)}
                style={[styles.input, { flexDirection: "row", justifyContent: "space-between" }]}
              >
                <Text style={{ color: birthDate ? "#000" : "#9ca3af" }}>
                  {birthDate ? birthDate : t("birthdate_placeholder")}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
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
    
            {errors.idType && <Text style={styles.errorText}>{errors.idType}</Text>}
            <DropDownPicker
              open={openIdType}
              value={idType}
              items={[
                { label: t("id_type_drivers_license"), value: "DL" },
                { label: t("id_type_state_id"), value: "SI" },
                { label: t("id_type_green_card"), value: "GC" },
                { label: t("id_type_passport"), value: "PA" },
              ]}
              setOpen={setOpenIdType}
              setValue={setIdType}
              setItems={() => {}}
              placeholder={t("select_id_type_placeholder")}
              placeholderStyle={{ color: "#9ca3af" }}
              style={[styles.input, { borderColor: errors.idType ? "red" : "#0458AB" }]}
              listMode="MODAL"
              modalTitle={t("select_id_type_modal_title")}
              modalProps={{
                animationType: "slide",
              }}
              searchable={true}
              searchPlaceholder={t("search_placeholder")}
              searchPlaceholderTextColor="#9ca3af"
              onChangeSearchText={(text) => setSearchTerm(text)}
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
    
            {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
            <TextInput
              style={[styles.input, errors.idNumber && styles.inputError]}
              placeholder={t("id_number_placeholder")}
              placeholderTextColor="#888"
              value={idNumber}
              keyboardType="numeric"
              onChangeText={setIdNumber}
            />
    
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            <DropDownPicker
              open={openState}
              value={state}
              items={stateList.map((state) => ({
                label: state.label,
                value: state.value,
              }))}
              setOpen={setOpenState}
              setValue={setState}
              setItems={() => {}}
              placeholder={t("select_state_placeholder")}
              placeholderStyle={{ color: "#9ca3af" }}
              style={[styles.input, { borderColor: errors.state ? "red" : "#0458AB" }]}
              dropDownContainerStyle={{ maxHeight: 200 }}
              listMode="MODAL"
              modalTitle={t("select_state_modal_title")}
              modalProps={{
                animationType: "slide",
              }}
              searchable={true}
              searchPlaceholder={t("search_placeholder")}
              searchPlaceholderTextColor="#9ca3af"
              searchTextInputProps={{
                onChangeText: (text) => setSearchTerm(text),
              }}
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
    
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder={t("city_placeholder")}
              placeholderTextColor="#888"
              value={city}
              onChangeText={setCity}
            />
    
            {errors.adressPerson && <Text style={styles.errorText}>{errors.adressPerson}</Text>}
            <TextInput
              style={[styles.input, errors.adressPerson && styles.inputError]}
              placeholder={t("address_placeholder")}
              placeholderTextColor="#888"
              value={adressPerson}
              onChangeText={setAddress}
            />
    
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder={t("phone_placeholder")}
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={phone}
              onChangeText={setPhone}
            />
              {/* Checkbox de Términos y Condiciones */}
              <View style={styles.termsContainer}>
              <CheckBox
                isChecked={isChecked}
                onClick={() => setIsChecked(!isChecked)}
                checkBoxColor="#002366"
              />
              <Text style={styles.termsText}>
                {t("accept_terms")}{" "}
                <Text style={styles.link} onPress={handleDownloadTerms}>
                  {t("terms_and_conditions")}
                </Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>{t("register_user_button")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.buttonText}>{t("back")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* Modal con WebView */}

        <Modal visible={termsVisible} onRequestClose={() => setTermsVisible(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <TouchableOpacity
              onPress={() => setTermsVisible(false)}
              style={[
                styles.closeButton,
                { zIndex: 10, marginTop: insets.top} 
              ]}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
            <WebView source={{ html: termsHtml }} style={{ flex: 1 }} />
          </SafeAreaView>
        </Modal>
        <Toast />
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({

  background: {
    flex: 1,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginVertical: 6,
  },
  textUserFields:{
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10
  },
  backButton: {
    height: 48,
    backgroundColor: "#FF0000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  section: {
    marginTop: 12,
    marginBottom: 12,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    paddingBottom: 80,
    marginTop: 50
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
  },  termsContainer: {
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
  closeButton: {
    padding: 10,
    backgroundColor: "#002366",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default RegistryUser;
