import { getOperatorByNumberId } from "@/hooks/api/GetOperatorByNumberId";
import { loginUser } from "@/hooks/api/OperatorLoginClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
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
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";
import colors from "../app/Colors"; // Asegúrate de importar tu archivo de colores
import { useTranslation } from "react-i18next";

const IdLoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const [id_number, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useColorScheme();

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
      source={
        theme === "dark"
          ? require("../assets/images/patron_modo_oscuro.png")
          : require("../assets/images/patron_modo_claro.png")
      }
      style={[
        styles.background,
        { backgroundColor: theme === "dark" ? "#0B2863" : "#fff" },
      ]}
      resizeMode="cover"
    >
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text
            style={[
              styles.title,
              { color: theme === "dark" ? colors.textDark : colors.primary }
            ]}
          >
            {t("welcome_to")}{"\n"}Movewise
          </Text>

          <Text
            style={[
              styles.label,
              { color: theme === "dark" ? colors.textDark : colors.primary }
            ]}
          >
            {t("identification_number")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                color: theme === "dark" ? colors.textDark : colors.textLight,
                borderColor: theme === "dark" ? colors.borderDark : colors.borderLight,
              },
            ]}
            placeholder={t("id_placeholder")}
            placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
            keyboardType="default"
            value={id_number}
            onChangeText={setIdNumber}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary }
            ]}
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
            style={[
              styles.backButton,
              { backgroundColor: "#FF0000" }
            ]}
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
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 24,
    fontSize: 16,
    color: "#000",
  },
  button: {
    height: 48,
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
