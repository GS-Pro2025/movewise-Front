// screens/Login.tsx
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LoginComponent from "../components/LoginComponent";

const Login: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <LoginComponent />
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
