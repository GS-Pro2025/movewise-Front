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
 // Adjust the path as necessary
const RegistryUser = () => {
  const router = useRouter();
  const { company } = useLocalSearchParams(); // Retrieve the company object
  const companyData = typeof company === "string" ? JSON.parse(company) : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }>({});

  const validateFields = () => {
    const newErrors: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
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
            email,
            first_name: firstName,
            last_name: lastName,
            birth_date: "1995-08-20", // Example birth date
            phone: 3101234567, // Example phone
            address: "Example Street 456", // Example address
            id_number: 44411233, // Example ID number
            type_id: "ID Card", // Example type ID
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

        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

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

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>REGISTER USER</Text>
        </TouchableOpacity>
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
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
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