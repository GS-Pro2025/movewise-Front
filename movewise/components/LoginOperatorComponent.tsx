import { loginUser } from "@/hooks/api/OperatorLoginClient";
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
} from "react-native";
import Toast from "react-native-toast-message";
const IdLoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const [id_number, setIdNumber] = useState("");

  const handleLogin = async () => {
    console.log(t("id_entered"), id_number);
    // Lógica de autenticación
    if (!id_number) {
      console.log(t("enter_valid_id"));
      Toast.show({
        type: "error",
        text1: t("incomplete_fields"),
        text2: t("complete_all_fields"),
      });
      return;
    }
    try {
      const response = await loginUser({ id_number: id_number });
      Toast.show({
        type: "success",
        text1: t("login_successful"),
        text2: `${t("welcome")} ${response.name ?? t("user")}`,
      });

      router.push("/Home");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("auth_error"),
        text2: error.message || t("login_failed"),
      });
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/bg_login.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>{t("welcome_to")}{"\n"}Movewise</Text>

        <Text style={styles.label}>{t("identification_number")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("id_placeholder")}
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={id_number}
          onChangeText={setIdNumber}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>{t("login_button")}</Text>
        </TouchableOpacity>
      </View>
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
    fontWeight: "bold",
    fontSize: 16,
  },
});
