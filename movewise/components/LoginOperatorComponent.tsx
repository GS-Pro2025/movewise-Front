import { getOperatorByNumberId } from "@/hooks/api/GetOperatorByNumberId";
import { loginUser } from "@/hooks/api/OperatorLoginClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";

const IdLoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const [id_number, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // console.log("🔍 ID ingresado:", id_number);

    if (!id_number || !id_number.trim()) {
      Toast.show({
        type: "error",
        text1: t("incomplete_fields"),
        text2: t("complete_all_fields"),
      });
      return;
    }

    setLoading(true);

    try {
      // console.log("🔐 Iniciando autenticación...");
      const response = await loginUser({ id_number });

      if (!response || !response.token) {
        throw new Error(t("login_failed"));
      }
      // console.log("✅ Token recibido:", response.token);
      await AsyncStorage.setItem("userToken", response.token);

      // establecer si es admin en el async
      await AsyncStorage.setItem("isAdmin", JSON.stringify(response.isAdmin));


      // Espera corta para asegurar guardado
      await new Promise(resolve => setTimeout(resolve, 300));


      // console.log("🔎 Buscando operador con ID:", id_number);
      const operatorData = await getOperatorByNumberId(id_number);

      if (!operatorData || operatorData.error) {
        throw new Error(t("operator_not_found"));
      }

      // console.log("📦 Datos del operador:", JSON.stringify(operatorData).substring(0, 100) + "...");

      await AsyncStorage.setItem("currentUser", JSON.stringify(operatorData));

      Toast.show({
        type: "success",
        text1: t("login_successful"),
        text2: `${t("welcome")} ${operatorData.first_name ?? t("user")}`,
      });
      // esperamos 3 segundos para redirigir a  la pantalla de inicio
      await new Promise(resolve => setTimeout(resolve, 500));
      router.replace("/OperatorHome");

    } catch (error: any) {
      console.error("❌ Error en login operator:", error);
      Toast.show({
        type: "error",
        text1: t("auth_error"),
        text2: error.message || t("login_failed"),
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <ImageBackground
      source={require("../assets/images/bg_login.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t("welcome_to")}{"\n"}Movewise</Text>

          <Text style={styles.label}>{t("identification_number")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("id_placeholder")}
            placeholderTextColor="#666"
            keyboardType="default"
            value={id_number}
            onChangeText={setIdNumber}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t("login_button")}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/Login")}>
            <Text style={styles.buttonText}>
              {t("back_to_admin_login")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default IdLoginScreen;

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
    fontSize: 28,
    color: "#002366",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  label: {
    fontSize: 12,
    color: "#002366",
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  backButton: {
    height: 48,
    backgroundColor: "#FF0000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#002366",
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 24,
    fontSize: 16,
    color: "#000",
  },
  button: {
    height: 48,
    backgroundColor: "#0458AB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
