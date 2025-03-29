import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router"; 
import AddOrderForm from "./AddOrderForm"; // Asegúrate de que este componente sea un modal también

interface OrderModalProps {
  visible: boolean;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ visible, onClose }) => {
  const [addOrderVisible, setAddOrderVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter(); 

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#A1C6EA" }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff", borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
          <Text style={[styles.title, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>Create Order</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isDarkMode ? "#FFF" : "#0458AB" }]}
            onPress={() => setAddOrderVisible(true)} // Muestra el modal AddOrderForm
          >
            <Text style={[styles.plus, { color: isDarkMode ? "#0458AB" : "#FFF" }]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.container, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: isDarkMode ? "#0458AB" : "#545257" }]}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: isDarkMode ? "#FFFFFF" : "#0458AB" }]}
            >
              <Text style={[styles.saveButtonText, { color: isDarkMode ? "#0458AB" : "#FFFFFF" }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Aquí se controla la visibilidad del modal AddOrderForm */}
      <AddOrderForm visible={addOrderVisible} onClose={() => setAddOrderVisible(false)} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 80 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingTop: 30,
    borderBottomWidth: 2,
    width: "100%",
    paddingHorizontal: 20,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  plus: { fontSize: 24, fontWeight: "bold" },
  buttonContainer: { flexDirection: "row", justifyContent: "center", gap: 120, marginTop: 20 },
  backButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  backButtonText: { color: "#FFF", fontWeight: "bold" },
  saveButtonText: { fontWeight: "bold" },
});

export default OrderModal;
