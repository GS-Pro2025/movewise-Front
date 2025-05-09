import { forgotPassword } from "@/hooks/api/ForgotPassword";
import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

const ForgotPasswordModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSendRequest = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      console.log("Sending forgot password request for email:", email);
      const response = await forgotPassword(email);

      Toast.show({
        type: "success",
        text1: "Request Sent",
        text2: "Check your email for further instructions.",
      });
      onClose(); // Cerrar el modal después de enviar la solicitud
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to send request. Please try again.",
      });
      onClose(); // Cerrar el modal después de enviar la solicitud
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Forgot Password</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(""); // Limpiar el error al escribir
            }}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.modalButton} onPress={handleSendRequest}>
            <Text style={styles.modalButtonText}>Send Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  modalButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#002366",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCloseButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#000",
    fontSize: 16,
  },
});

export default ForgotPasswordModal;