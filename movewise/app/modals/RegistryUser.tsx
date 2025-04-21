import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { CreateCompany } from "../../hooks/api/CompanyClient";
import { registerUser } from "../../hooks/api/RegistryClient";
import HeaderWithDivider from "@/components/HeaderWithDivider";
import DropDownPicker from "react-native-dropdown-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ListStates } from "@/hooks/api/StatesClient";
import ModelState from "@/models/ModelState";
import { ModelCompany } from "@/models/ModelCompany";

const RegistryUser = () => {
  const router = useRouter();
  const { license, company_name, address, zip_code } = useLocalSearchParams();

  // Asegúrate de que sean strings, y si no, convierte o valida
  const companyData: ModelCompany = {
    license_number: typeof license === "string" ? license : license?.[0] ?? "",
    name: typeof company_name === "string" ? company_name : company_name?.[0] ?? "",
    address: typeof address === "string" ? address : address?.[0] ?? "",
    zip_code: typeof zip_code === "string" ? zip_code : zip_code?.[0] ?? "",
  };

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
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }
    if (!userName.trim()) {
      newErrors.userName = "Username is required."; // Add validation message
    }
    if (!firstName.trim()) {
      newErrors.firstName = "First Name is required.";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last Name is required.";
    }

    if (!birthDate.trim()) {
      newErrors.birthDate = "Date of Birth is required.";
    }

    if (!idType.trim()) {
      newErrors.idType = "Identification Type is required.";
    }

    if (!idNumber.trim()) {
      newErrors.idNumber = "ID Number is required.";
    }

    if (!state.trim()) {
      newErrors.state = "State is required.";
    }

    if (!city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!adressPerson.trim()) {
      newErrors.adressPerson = "Address is required.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleRegister = async () => {
    if (!validateFields()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the errors before submitting.",
      });
    }
      // Step 1: Register the company
      try {
        if (companyData) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Company null.",
          });
        }
        const companyResponse = await CreateCompany(companyData);
        Toast.show({
          type: "success",
          text1: "Company Registered",
          text2: `Company Name: ${companyData.name}, ZIP: ${companyData.zip_code}`, 
        });
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Company data invalid.",
        });
      }
      

      // Step 2: Register the user for the company
      const userData = {
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
      };
    try {
      await registerUser(userData);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Company and user registered successfully!",
      });

      router.push("/"); // Navigate back to the home screen or another route
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Registration Error",
        text2: error.message || "Registration failed.",
      });
    }
  };
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const states: ModelState[] = await ListStates(); // Define states as ModelState[]
        setStateList(
          states.map((state) => ({
            label: String(state.name), 
            value: String(state.code),
          }))
        );
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    fetchStates();
  }, []);
  return (
    <ImageBackground
      source={require("../../assets/images/bg_login.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register User admin for {companyData?.name}</Text>

      {/* Sección de credenciales */}
      <View style={styles.separator} />
      <View style={styles.section}>
        
        <Text style={styles.textUserFields}>User admin credentials</Text>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
        <TextInput
          style={[styles.input, errors.userName && styles.inputError]}
          placeholder="Username"
          placeholderTextColor="#888"
          value={userName}
          onChangeText={setUserName}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Password"
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
          placeholder="First Name"
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
        />

        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        <TextInput
          style={[styles.input, errors.lastName && styles.inputError]}
          placeholder="Last Name"
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
        />
        

        {/* Fecha de nacimiento */}
        {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
        <View style={{ zIndex: 1000, marginTop: 16 }}>
          <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={[styles.input, { flexDirection: "row", justifyContent: "space-between" }]}>
            <Text style={{ color: birthDate ? "#000" : "#9ca3af" }}>{birthDate ? birthDate : "Birthdate"}</Text>
            <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(selectedDate) => {
              setDatePickerVisibility(false);
              setBirthDate(selectedDate.toISOString().split('T')[0]);
            }}
            onCancel={() => setDatePickerVisibility(false)}
          />
        </View>

        {errors.idType && <Text style={styles.errorText}>{errors.idType}</Text>}
        <DropDownPicker
          open={openIdType}
          value={idType}
          items={[
            { label: 'Driver’s License', value: 'DL' },
            { label: 'State ID', value: 'SI' },
            { label: 'Green Card', value: 'GC' },
            { label: 'Passport', value: 'PA' },
          ]}
          setOpen={setOpenIdType}
          setValue={setIdType}
          setItems={() => {}}
          placeholder="Select ID type"
          placeholderStyle={{ color: '#9ca3af' }}
          style={[styles.input, { borderColor: errors.idType ? "red" : "#0458AB" }]}
          listMode="MODAL"
          modalTitle="Select ID type"
          modalProps={{
            animationType: "slide"
          }}
          searchable={true}
          searchPlaceholder="Search..."
          searchPlaceholderTextColor="#9ca3af"
          onChangeSearchText={text => setSearchTerm(text)}
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />

        {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
        <TextInput
          style={[styles.input, errors.idNumber && styles.inputError]}
          placeholder="ID Number"
          placeholderTextColor="#888"
          value={idNumber}
          keyboardType="numeric"
          onChangeText={setIdNumber}
        />


        {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
        <DropDownPicker
          open={openState}
          value={state}
          items={stateList.map(state => ({
            label: state.label,
            value: state.value
          }))}
          setOpen={setOpenState}
          setValue={setState}
          setItems={() => {}}
          placeholder="Select State"
          placeholderStyle={{ color: '#9ca3af' }}
          style={[styles.input, { borderColor: errors.state ? "red" : "#0458AB" }]}
          dropDownContainerStyle={{ maxHeight: 200 }}
          listMode="MODAL"
          modalTitle="Select a State"
          modalProps={{
            animationType: "slide"
          }}
          searchable={true}
          searchPlaceholder="Search..."
          searchPlaceholderTextColor="#9ca3af"
          searchTextInputProps={{
            onChangeText: text => setSearchTerm(text),
          }}
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />

        

        {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
        <TextInput
          style={[styles.input, errors.city && styles.inputError]}
          placeholder="City"
          placeholderTextColor="#888"
          value={city}
          onChangeText={setCity}
        />
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

        {errors.adressPerson && <Text style={styles.errorText}>{errors.adressPerson}</Text>}
        <TextInput
          style={[styles.input, errors.adressPerson && styles.inputError]}
          placeholder="Address"
          placeholderTextColor="#888"
          value={adressPerson}
          onChangeText={setAddress}
        />
        

        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="Phone"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={phone}
          onChangeText={setPhone}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>REGISTER USER</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
      <Toast />
    </ImageBackground>
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
  },
});

export default RegistryUser;
