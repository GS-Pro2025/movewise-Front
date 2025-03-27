import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme } from "react-native";
import { useState } from "react";
import AddOrderForm from "./AddOrderForm";



interface OrderModalProps {
  visible: boolean;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ visible, onClose }) => {
  const [addOrderVisible, setAddOrderVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 80,
      backgroundColor: isDarkMode ? "#112A4A" : "#ffffff",
    },
    header: {
      backgroundColor: isDarkMode ? "#112A4A" : "#ffffff",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 20,
      paddingTop: 30,
      borderBottomWidth: 2,
      borderBottomColor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.1)",
      width: "100%",
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : "#0458AB",
    },
    addButton: {
      backgroundColor: isDarkMode ? "#FFF" : "#0458AB",
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    plus: {
      fontSize: 24,
      color: isDarkMode ? "#0458AB" : "#FFF",
      fontWeight: "bold",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 120,
      marginTop: 20,
    },
    backButton: {
      backgroundColor: isDarkMode ? "#0458AB" : "#545257",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    saveButton: {
      backgroundColor: isDarkMode ? "#FFFFFF" : "#0458AB",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    backButtonText: {
      color: "#FFF",
      fontWeight: "bold",
    },
    saveButtonText: {
      color: isDarkMode ? "#0458AB" : "#FFFFFF",
      fontWeight: "bold",
    },
  });

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#A1C6EA" }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Order</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setAddOrderVisible(true)}>
            <Text style={styles.plus}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal para agregar una orden */}
      <AddOrderForm visible={addOrderVisible} onClose={() => setAddOrderVisible(false)} />
    </Modal>
  );
};

export default OrderModal;
