import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

const RegisterCompany = () => {
  const { t } = useTranslation();
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
      newErrors.license = t("license_required");
    } else if (license.length < 5) {
      newErrors.license = t("license_min_length");
    }

    if (!companyName.trim()) {
      newErrors.companyName = t("name_required");
    } else if (companyName.length < 3) {
      newErrors.companyName = t("name_min_length");
    }

    if (!address.trim()) {
      newErrors.address = t("address_required");
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = t("zip_code_required");
    } else if (isNaN(Number(zipCode))) {
      newErrors.zipCode = t("zip_code_invalid");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateFields()) {
      const companyData = {
        license: license,
        company_name: companyName,
        address: address,
        zip_code: zipCode,
      };

      Toast.show({
        type: "success",
        text1: t("company_data_prepared"),
        text2: t("redirecting_to_user_registration"),
      });

      router.push({
        pathname: "/modals/RegistryUser",
        params: {
          license: license,
          company_name: companyName,
          address: address,
          zip_code: zipCode,
        },
      });
    } else {
      Toast.show({
        type: "error",
        text1: t("validation_error"),
        text2: t("fix_errors_before_submitting"),
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../assets/images/bg_login.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t("register_your_company")}</Text>

          <TextInput
            style={[styles.input, errors.license && styles.inputError]}
            placeholder={t("license_placeholder")}
            placeholderTextColor="#888"
            value={license}
            onChangeText={setLicense}
          />
          {errors.license && <Text style={styles.errorText}>{errors.license}</Text>}

          <TextInput
            style={[styles.input, errors.companyName && styles.inputError]}
            placeholder={t("name_placeholder")}
            placeholderTextColor="#888"
            value={companyName}
            onChangeText={setCompanyName}
          />
          {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}

          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            placeholder={t("address_placeholder")}
            placeholderTextColor="#888"
            value={address}
            onChangeText={setAddress}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          <TextInput
            style={[styles.input, errors.zipCode && styles.inputError]}
            placeholder={t("zip_code_placeholder")}
            placeholderTextColor="#888"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
          />
          {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>{t("register_company_button")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/Login")}>
            <Text style={styles.buttonText}>{t("back")}</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
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
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  backButton: {
    height: 48,
    backgroundColor: "#FF0000",
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