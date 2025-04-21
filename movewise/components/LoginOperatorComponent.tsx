import { loginUser } from "@/hooks/api/OperatorLoginClient";
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
} from "react-native";
import Toast from "react-native-toast-message";

const IdLoginScreen: React.FC = () => {
  const [id_number, setIdNumber] = useState("");

  const handleLogin = async () => {
    console.log("ID ingresado:", id_number);
    // Auth logic
    if(!id_number) {
      console.log("Por favor, ingresa un número de identificación válido.");
      Toast.show({
              type: "error",
              text1: "Campos incompletos",
              text2: "Por favor, completa todos los campos.",
            });
      return;
    }
    try {
        const response = await loginUser({ id_number: id_number});
        Toast.show({
          type: "success",
          text1: "Login exitoso",
          text2: `Bienvenido/a ${response.name ?? "usuario"}`,
        });
  
        router.push("/Home");
  
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error de autenticación",
          text2: error.message || "Login fallido",
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
        <Text style={styles.title}>Welcome to{"\n"}Movewise</Text>

        <Text style={styles.label}>IDENTIFICATION NUMBER</Text>
        <TextInput
          style={styles.input}
          placeholder="0192333213123"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={id_number}
          onChangeText={setIdNumber}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
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
