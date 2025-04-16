import React, { useState } from "react";
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

const RegistryUser = () => {
  const router = useRouter();
  const { company } = useLocalSearchParams(); // Retrieve the company object
  const companyData = typeof company === "string" ? JSON.parse(company) : null;

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
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    idType?: string;
    idNumber?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    address?: string;
    phone?: string;
  }>({});

  const validateFields = () => {
    const newErrors: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      birthDate?: string;
      idType?: string;
      idNumber?: string;
      state?: string;
      city?: string;
      zipCode?: string;
      address?: string;
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

    if (!zipCode.trim()) {
      newErrors.zipCode = "Zip Code is required.";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleRegister = async () => {
    if (validateFields()) {
      try {
        // Step 1: Register the company
        const companyResponse = await CreateCompany(companyData);
        const companyId = companyResponse.id;

        // Step 2: Register the user for the company
        const userData = {
          user_name: `${firstName}.${lastName}`, // Example user_name generation
          password,
          person: {
            email: email,
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
            phone: phone,
            address: address,
            id_number: idNumber,
            type_id: idType,
            state: state,
            city: city,
            zip_code: zipCode,
          },
        };

        console.log("Registering user:", userData);
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
    } else {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the errors before submitting.",
      });
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/bg_login.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register User for {companyData?.company_name}</Text>

      {/* Sección de credenciales */}
      <View style={styles.separator} />
      <View style={styles.section}>
        <Text style={styles.textUserFields}>User admin credentials</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>
      <View style={styles.separator} />
      {/* Resto de campos */}
      <View style={styles.section}>
        <TextInput
          style={[styles.input, errors.firstName && styles.inputError]}
          placeholder="First Name"
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

        <TextInput
          style={[styles.input, errors.lastName && styles.inputError]}
          placeholder="Last Name"
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

        <TextInput
          style={[styles.input, errors.birthDate && styles.inputError]}
          placeholder="Date of Birth"
          placeholderTextColor="#888"
          value={birthDate}
          onChangeText={setBirthDate}
        />
        {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}

        <TextInput
          style={[styles.input, errors.idType && styles.inputError]}
          placeholder="Identification Type"
          placeholderTextColor="#888"
          value={idType}
          onChangeText={setIdType}
        />
        {errors.idType && <Text style={styles.errorText}>{errors.idType}</Text>}

        <TextInput
          style={[styles.input, errors.idNumber && styles.inputError]}
          placeholder="ID Number"
          placeholderTextColor="#888"
          value={idNumber}
          onChangeText={setIdNumber}
        />
        {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}

        <TextInput
          style={[styles.input, errors.state && styles.inputError]}
          placeholder="State"
          placeholderTextColor="#888"
          value={state}
          onChangeText={setState}
        />
        {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}

        <TextInput
          style={[styles.input, errors.city && styles.inputError]}
          placeholder="City"
          placeholderTextColor="#888"
          value={city}
          onChangeText={setCity}
        />
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

        <TextInput
          style={[styles.input, errors.zipCode && styles.inputError]}
          placeholder="Zip Code"
          placeholderTextColor="#888"
          value={zipCode}
          onChangeText={setZipCode}
        />
        {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}

        <TextInput
          style={[styles.input, errors.address && styles.inputError]}
          placeholder="Address"
          placeholderTextColor="#888"
          value={address}
          onChangeText={setAddress}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="Phone"
          placeholderTextColor="#888"
          value={phone}
          onChangeText={setPhone}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>REGISTER USER</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
      {/* Toast Component */}
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