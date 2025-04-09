import React, { useState, useEffect } from "react";
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

const LoginComponent: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const theme = useColorScheme();
  const router = useRouter();

  // Cargar datos guardados en cahcé
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
        console.warn("Error al cargar credenciales guardadas", err);
      }
    };

    loadStoredCredentials();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Campos incompletos",
        text2: "Por favor, completa todos los campos.",
      });
      return;
    }

    try {
      const response = await loginUser({ email, password });

      // Guardar o limpiar credenciales
      if (remember) {
        await AsyncStorage.setItem("savedEmail", email);
        await AsyncStorage.setItem("savedPassword", password);
      } else {
        await AsyncStorage.removeItem("savedEmail");
        await AsyncStorage.removeItem("savedPassword");
      }

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
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#333"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#333"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.row}>
          <View style={styles.checkboxContainer}>
            <Checkbox value={remember} onValueChange={setRemember} color="#0458AB" />
            <Text style={styles.checkboxText}> Remember me.</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/OperatorLogin")}>
          <Text style={styles.buttonText}>OPERATOR DAILY WORK</Text>
        </TouchableOpacity>
        <Text style={styles.bottomText}>Don't have a company?</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>REGISTER COMPANY</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
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
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#000",
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
});
