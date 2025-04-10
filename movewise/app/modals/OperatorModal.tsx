import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, Alert } from "react-native";
import { useRouter } from "expo-router";
import AddOperatorForm from "./AddOperatorForm";

interface Operator {
  name: string;
  role?: "Team Leader";
}

interface OperatorModalProps {
  visible: boolean;
  onClose: () => void;
}

const OperatorModal: React.FC<OperatorModalProps> = ({ visible, onClose }) => {
  console.log('visible', visible);
  
  const [addOperatorVisible, setAddOperatorVisible] = useState(false);
  const [roleSelectorVisible, setRoleSelectorVisible] = useState(false);
  const [selectedOperatorIndex, setSelectedOperatorIndex] = useState<number | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  const handleAddOperator = (newOperator: string) => {
    setOperators((prev) => [...prev, { name: newOperator }]);
    setAddOperatorVisible(false);
  };

  const handleDeleteOperator = (index: number) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this operator?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setOperators((prev) => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const handleSelectRole = (index: number) => {
    setSelectedOperatorIndex(index);
    setRoleSelectorVisible(true);
  };

  const assignDriver = () => {
    setRoleSelectorVisible(false);
    router.push("/modals/TruckModal");
  };

  const assignTeamLeader = () => {
    if (selectedOperatorIndex !== null) {
      setOperators((prev) =>
        prev.map((op, i) =>
          i === selectedOperatorIndex ? { ...op, role: "Team Leader" } : op
        )
      );
    }
    setRoleSelectorVisible(false);
  };

  
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
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
  operatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  operatorItem: { fontSize: 18, color: "#0458AB" },
  deleteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  deleteText: { color: "#FFFFFF", fontWeight: "bold" },
  buttonContainer: {  flexDirection: "row", // Alinea los botones en fila
    justifyContent: "space-between", // Espacia los botones
    alignItems: "center", // Asegura alineación vertical
    marginTop: 20,
    width: "100%", // O un valor fijo según el diseño
    paddingHorizontal: 20, },
  backButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  backButtonText: { color: "#FFF", fontWeight: "bold" },
  saveButtonText: { fontWeight: "bold" },
  roleModalContainer: { flex: 1, justifyContent: "flex-end", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  roleModalContent: { backgroundColor: "#cfe2f3", padding: 20, borderRadius: 20,  alignItems: "center", width: "100%", marginBottom:-5  },
  roleTitle: { fontSize: 16, fontWeight: "bold", color: "#0458AB", marginBottom: 20 },
  roleButton: { backgroundColor: "#0458AB", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, width: "40%", marginBottom: 10 },
  roleButtonText: { color: "#FFF", fontWeight: "bold", textAlign: "center" },
  closeButton: { position: "absolute", right: 10,},
  closeButtonText: { fontSize: 18, fontWeight: "bold", color: "#0458AB" },
});

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#A1C6EA" }}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff", borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
          <Text style={[styles.title, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>Operators</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isDarkMode ? "#FFF" : "#0458AB" }]}
            onPress={() => setAddOperatorVisible(true)}
          >
            <Text style={[styles.plus, { color: isDarkMode ? "#0458AB" : "#FFF" }]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.container, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
          {operators.map((op, index) => (
            <View key={index} style={styles.operatorRow}>
              <TouchableOpacity onPress={() => handleSelectRole(index)}>
                <Text style={styles.operatorItem}>
                  {op.name} {op.role ? `- ${op.role}` : ""}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteOperator(index)}>
                <Text style={styles.deleteText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: isDarkMode ? "#0458AB" : "#545257" }]}
              onPress={onClose}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
              <Text style={[styles.saveButtonText, { color: isDarkMode ? "#0458AB" : "#FFFFFF" }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal para agregar operador */}
      <AddOperatorForm visible={addOperatorVisible} onClose={() => setAddOperatorVisible(false)} onAddOperator={handleAddOperator} />

      {/* Modal para seleccionar rol */}
      <Modal animationType="slide" transparent visible={roleSelectorVisible} onRequestClose={() => setRoleSelectorVisible(false)}>
        <View style={styles.roleModalContainer}>
          <View style={styles.roleModalContent}>
            <Text style={styles.roleTitle}>Name Operator</Text>
            <TouchableOpacity style={styles.roleButton} onPress={assignDriver}>
              <Text style={styles.roleButtonText}>Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roleButton} onPress={assignTeamLeader}>
              <Text style={styles.roleButtonText}>Team Leader</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setRoleSelectorVisible(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default OperatorModal;