import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

const RegisterCompany = () => {
  const [license, setLicense] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [errors, setErrors] = useState<{
    license?: string;
    companyName?: string;
    address?: string;
    zipCode?: string;
  }>({});
  const router = useRouter();

  const validateFields = () => {
    const newErrors: {
      license?: string;
      companyName?: string;
      address?: string;
      zipCode?: string;
    } = {};

    if (!license.trim()) {
      newErrors.license = "License Number is required.";
    } else if (license.length < 5) {
      newErrors.license = "License Number must be at least 5 characters long.";
    }

    if (!companyName.trim()) {
      newErrors.companyName = "Name is required.";
    } else if (companyName.length < 3) {
      newErrors.companyName = "Name must be at least 3 characters long.";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = "Zip Code is required.";
    } else if (isNaN(Number(zipCode))) {
      newErrors.zipCode = "Zip Code must be a valid number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleRegister = () => {
    if (validateFields()) {
      // Create the company object
      const companyData = {
        license,
        company_name: companyName,
        address,
        zip_code: zipCode,
      };

      Toast.show({
        type: "success",
        text1: "Company Data Prepared",
        text2: "Redirecting to user registration...",
      });

      // Navigate to RegistryUser and pass the company object
      router.push({
        pathname: "/modals/RegistryUser",
        params: { company: JSON.stringify(companyData) }, // Pass company object as a string
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the errors before submitting.",
      });
    }
  };

  return (
    <>
      <ImageBackground
        source={require("../assets/images/bg_login.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Register Your Company</Text>

          <TextInput
            style={[styles.input, errors.license && styles.inputError]}
            placeholder="License Number"
            placeholderTextColor="#888"
            value={license}
            onChangeText={setLicense}
          />
          {errors.license && <Text style={styles.errorText}>{errors.license}</Text>}

          <TextInput
            style={[styles.input, errors.companyName && styles.inputError]}
            placeholder="Name"
            placeholderTextColor="#888"
            value={companyName}
            onChangeText={setCompanyName}
          />
          {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}

          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            placeholder="Address"
            placeholderTextColor="#888"
            value={address}
            onChangeText={setAddress}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          <TextInput
            style={[styles.input, errors.zipCode && styles.inputError]}
            placeholder="Zip Code"
            placeholderTextColor="#888"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
          />
          {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>REGISTER COMPANY</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Toast Component */}
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    color: "#002366",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: "#0458AB",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#000",
  },
  inputError: {
    borderColor: "#FF0000", // Highlight input with error in red
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    height: 48,
    backgroundColor: "#002366",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RegisterCompany;