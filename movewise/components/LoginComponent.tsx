import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  StatusBar,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../hooks/api/loginClient";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { useLocalSearchParams } from "expo-router";
import { decodeToken, getPersonIdFromToken, isAdmin } from "@/utils/decodeToken";
import { GetPersonById } from "@/hooks/api/GetPersonById";

const LoginComponent: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para controlar la visibilidad de la contraseña
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const theme = useColorScheme();
  const router = useRouter();
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false); // Estado para controlar el modal

  // Obtener el mensaje de éxito de los parámetros
  const { toastMessage } = useLocalSearchParams();

  // Load saved credentials from cache
  useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        const savedPassword = await AsyncStorage.getItem("savedPassword");

        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRemember(true);
        }
      } catch (err) {
        console.warn("Error loading saved credentials", err);
      }
    };

    loadStoredCredentials();
    // Mostrar el mensaje de éxito si existe
    if (toastMessage) {
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: toastMessage as string,
      });
    }
  }, [toastMessage]);

  const validateFields = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = t("email_required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("email_invalid");
    }

    if (!password.trim()) {
      newErrors.password = t("password_required");
    } else if (password.length < 6) {
      newErrors.password = t("password_length");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateFields()) {
      Toast.show({
        type: "error",
        text1: t("validation_error"),
        text2: t("fix_errors"),
      });
      return;
    }

    try {
      // 1. Autenticación y obtención del token
      const response = await loginUser({ email, password });
      if (!response || !response.token) {
        throw new Error(t("login_failed"));
      }
      const token = response.token;
      console.log("✅ Token recibido:", token);
      await AsyncStorage.setItem("userToken", token);

      // 2. Decodificar token
      const personId = getPersonIdFromToken(token);
      const adminFlag = isAdmin(token);
      console.log("🔍 person_id extraído:", personId, "– isAdmin:", adminFlag);

      // 3. Obtener datos del operador/admin
      // Asumo que tu API requiere el person_id como string:
      const operatorData = await GetPersonById(personId);
      if (!operatorData || operatorData.error) {
        throw new Error(t("admin_not_found"));
      }
      console.log("📦 Datos del admin:", operatorData);

      // 4. Guardar en AsyncStorage
      await AsyncStorage.setItem("currentUser", JSON.stringify(operatorData));

      // 5. Guardar o limpiar credenciales según “remember”
      if (remember) {
        await AsyncStorage.setItem("savedEmail", email);
        await AsyncStorage.setItem("savedPassword", password);
      } else {
        await AsyncStorage.removeItem("savedEmail");
        await AsyncStorage.removeItem("savedPassword");
      }

      // 6. Feedback y redirección
      Toast.show({
        type: "success",
        text1: t("login_success"),
        text2: `${t("welcome")} ${operatorData.first_name ?? t("user")}`,
      });
      router.push("/Home");

    } catch (error: any) {
      console.error("❌ Error en login admin:", error);
      Toast.show({
        type: "error",
        text1: t("auth_error"),
        text2: error.message || t("login_failed"),
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
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <Text style={styles.title}>{t("welcome_title")}</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder={t("email_placeholder")}
            placeholderTextColor="#333"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder={t("password_placeholder")}
              placeholderTextColor="#333"
              secureTextEntry={!passwordVisible} // Cambiar visibilidad según el estado
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setPasswordVisible(!passwordVisible)} // Alternar visibilidad
            >
              <Icon
                name={passwordVisible ? "visibility" : "visibility-off"} // Cambiar ícono según el estado
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <View style={styles.row}>
            <View style={styles.checkboxContainer}>
              <Checkbox value={remember} onValueChange={setRemember} color="#0458AB" />
              <Text style={styles.checkboxText}>{t("remember_me")}</Text>
            </View>
            <TouchableOpacity onPress={() => setForgotPasswordVisible(true)}>
              <Text style={styles.forgotText}>{t("forgot_password")}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>{t("login_button")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/OperatorLogin")}>
            <Text style={styles.buttonText}>{t("operator_daily_work")}</Text>
          </TouchableOpacity>
          <Text style={styles.bottomText}>{t("no_company")}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/CompanyRegister")}
          >
            <Text style={styles.buttonText}>{t("register_company")}</Text>
          </TouchableOpacity>
        </View>

        {/* Toast Component */}
        <Toast />
      </ImageBackground>
      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={forgotPasswordVisible}
        onClose={() => setForgotPasswordVisible(false)}
      />
    </>
  );
};

export default LoginComponent;

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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxText: {
    color: "#002366",
    fontSize: 14,
  },
  forgotText: {
    color: "#0458AB",
    fontWeight: "500",
  },
  button: {
    height: 48,
    backgroundColor: "#002366",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomText: {
    textAlign: "center",
    color: "#002366",
    fontSize: 14,
    marginBottom: 8,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 13,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 8,
  },
});