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
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { ToastAndroid, Platform } from 'react-native';
import { decodeToken } from "../utils/decodeToken";
import { getOperatorById } from "../hooks/api/GetOperatorById";
const LoginComponent: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [remember, setRemember] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(true);
  const theme = useColorScheme();
  const router = useRouter();

  function notifyMessage(msg: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT)
    }
  }

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
        console.warn("Error loading stored credentials", err);
      }
    };

    if (showAdminLogin) {
      loadStoredCredentials();
    }
  }, [showAdminLogin]);

  const handleLogin = async () => {
    try {
      const credentials = showAdminLogin
        ? { email, password }
        : { id_number: idNumber };

      const response = await loginUser(credentials);

      if (response.token) {
        await AsyncStorage.setItem("userToken", response.token);
        const tokenPayload = decodeToken(response.token);
        const personId = tokenPayload.person_id;
        const isUserAdmin = tokenPayload.is_admin;

        console.log('personId', personId);
        console.log('isUserAdmin', isUserAdmin);

        //get operator data
        if (personId) {
          const operatorData = await getOperatorById(personId);
          if (operatorData) {
            const currentUser = {
              id: operatorData.id,
              first_name: operatorData.first_name,
              last_name: operatorData.last_name,
              status: operatorData.status,
              id_number: operatorData.id_number,
            };
            await AsyncStorage.setItem("currentUser", JSON.stringify(currentUser));
          }
        }
      }

      if (showAdminLogin && remember) {
        await AsyncStorage.setItem("savedEmail", email);
        await AsyncStorage.setItem("savedPassword", password);
      } else if (showAdminLogin) {
        await AsyncStorage.removeItem("savedEmail");
        await AsyncStorage.removeItem("savedPassword");
      }

      notifyMessage("Login successful");
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Login successful",
        textBody: "Welcome to Movewise",
        autoClose: 3000,
      });

      if (!showAdminLogin) {
        router.push("/OperatorHome");
      } else {
        router.push("/Home");
      }
    } catch (error: any) {
      console.log('Backend error:', error.message);

      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Authentication Error",
        textBody: error.message || "Login failed, verify your credentials", // Usar error.message
        autoClose: 3000,
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

        {showAdminLogin ? (
          <>
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
                <Text style={styles.checkboxText}> Remember me</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="ID Number"
              placeholderTextColor="#333"
              keyboardType="numeric"
              value={idNumber}
              onChangeText={setIdNumber}
            />
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setShowAdminLogin(true)}
            >
              <Text style={styles.switchButtonText}>Back to Admin Login</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>
            {showAdminLogin ? "LOGIN" : "OPERATOR LOGIN"}
          </Text>
        </TouchableOpacity>

        {showAdminLogin && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowAdminLogin(false)}
          >
            <Text style={styles.buttonText}>OPERATOR DAILY WORK</Text>
          </TouchableOpacity>
        )}

        {showAdminLogin && (
          <>
            <Text style={styles.bottomText}>Don't have a company?</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>REGISTER COMPANY</Text>
            </TouchableOpacity>
          </>
        )}
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
  switchButton: {
    marginBottom: 16,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#0458AB",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});