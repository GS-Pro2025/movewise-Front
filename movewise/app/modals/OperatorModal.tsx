"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AddOperatorModal from "./AddOperatorForm";

interface OperatorModalProps {
  visible: boolean;
  onClose: () => void;
}

const OperatorModal: React.FC<OperatorModalProps> = ({ visible, onClose }) => {
  const [operators, setOperators] = useState<string[]>([]);
  const [addOperatorVisible, setAddOperatorVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const theme = isDarkMode ? "dark" : "light";
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#112A4A" : "#ffffff",
      padding: 20,
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
    titleContainer: {
      flex: 1,
      alignItems: "center",
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
    operatorItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
    },
    operatorText: {
      fontSize: 16,
      color: "#0458AB",
      flex: 1,
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
    // Estilos para el modal de detalle del operador
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      width: "80%",
      backgroundColor: "#ffffff",
      borderRadius: 8,
      padding: 20,
    },
    modalContentDark: {
      backgroundColor: "#112A4A",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      paddingBottom: 10,
      marginBottom: 10,
    },
    modalHeaderDark: {
      borderBottomColor: "#444",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#0458AB",
    },
    textDark: {
      color: "#FFFFFF",
    },
    closeButton: {
      padding: 5,
    },
    roleButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20,
    },
    roleButton: {
      backgroundColor: "#0458AB",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    roleButtonDark: {
      backgroundColor: "#FFF",
    },
    roleButtonText: {
      color: "#FFF",
      fontWeight: "bold",
    },
  });

  // Funciones
  const openOperatorForm = () => setAddOperatorVisible(true);
  const closeOperatorForm = () => setAddOperatorVisible(false);

  const handleAddOperator = (operatorName: string) => {
    if (operatorName.trim() !== "") {
      setOperators([...operators, operatorName]);
    }
    closeOperatorForm();
  };

  const handleOperatorPress = (operator: string) => {
    setSelectedOperator(operator);
    setDetailModalVisible(true);
  };

  const assignRole = (role: string) => {
    if (role === "Team leader") {
      if (selectedOperator) {
        const updatedOperators = operators.map((op) =>
          op === selectedOperator
            ? op.includes("(Team leader)")
              ? op
              : `${op} (Team leader)`
            : op
        );
        setOperators(updatedOperators);
      }
      setDetailModalVisible(false);
    } else if (role === "Driver") {
      setDetailModalVisible(false);
      router.push("../"); // Navega a la pantalla de Driver
    }
  };

  const handleDeleteOperator = (operatorToDelete: string) => {
    Alert.alert(
      "Confirmación",
      "¿Está seguro que desea eliminar este operador?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setOperators(operators.filter((operator) => operator !== operatorToDelete));
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Operators</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={openOperatorForm}>
              <Text style={styles.plus}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de operadores */}
          {operators.length > 0 ? (
            <FlatList
              data={operators}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.operatorItem}>
                  <TouchableOpacity onPress={() => handleOperatorPress(item)}>
                    <Text style={styles.operatorText}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteOperator(item)}>
                    <Text style={{ color: "red", marginLeft: 10 }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: isDarkMode ? "#FFFFFF" : "#0458AB" }}>
                No operators added yet
              </Text>
            </View>
          )}

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para agregar un operador */}
      <AddOperatorModal
        visible={addOperatorVisible}
        onClose={closeOperatorForm}
        onAddOperator={handleAddOperator}
      />

      {/* Modal para ver detalles del operador seleccionado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, theme === "dark" && styles.modalContentDark]}>
            <View style={[styles.modalHeader, theme === "dark" && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, theme === "dark" && styles.textDark]}>
                {selectedOperator ? selectedOperator : "Name Operator"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme === "dark" ? "#FFFFFF" : "#112A4A"}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.roleButtonsContainer}>
              <TouchableOpacity
                style={[styles.roleButton, theme === "dark" && styles.roleButtonDark]}
                onPress={() => assignRole("Driver")}
              >
                <Text style={styles.roleButtonText}>Driver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, theme === "dark" && styles.roleButtonDark]}
                onPress={() => assignRole("Team leader")}
              >
                <Text style={styles.roleButtonText}>Team leader</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default OperatorModal;
