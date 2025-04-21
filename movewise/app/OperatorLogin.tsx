import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LoginComponent from "../components/LoginOperatorComponent";

const OperatorLogin: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <LoginComponent />
    </SafeAreaView>
  );
};

export default OperatorLogin;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
