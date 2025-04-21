import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AddOperatorForm from "./AddOperatorForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { url } from "../../hooks/api/apiClient";
import { ToastAndroid, Platform } from 'react-native';
import TruckModal from "./TruckModal";

interface Operator {
  id: number;
  name: string;
  role?: string;
  additionalCosts?: number;
  truckId?: number;
}

interface AssignedOperator {
  id: number;
  number_licence: string;
  code: string;
  n_children: number;
  size_t_shift: string;
  name_t_shift: string;
  salary: number;
  photo: string;
  status: string;
  assigned_at: string;
  additional_costs: number;
  first_name: string | null;
  last_name: string;
  identification: string | null;
  email: string;
  phone: number;
  address: string;
  username: string;
  //optional fields
  role?: string;
  truck?: {
    id_truck: number;
    plate: string;
  };
}

interface OperatorModalProps {
  visible: boolean;
  onClose: () => void;
  orderKey: string;
}

const OperatorModal: React.FC<OperatorModalProps> = ({ visible, onClose, orderKey }) => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [assignedOperators, setAssignedOperators] = useState<AssignedOperator[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOperatorVisible, setAddOperatorVisible] = useState(false);
  const [roleSelectorVisible, setRoleSelectorVisible] = useState(false);
  const [selectedOperatorIndex, setSelectedOperatorIndex] = useState<number | null>(null);
  const [truckModalVisible, setTruckModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  // Fetch assigned operators when modal becomes visible
  useEffect(() => {
    if (visible && orderKey) {
      fetchAssignedOperators();
    }
  }, [visible, orderKey]);

  const fetchAssignedOperators = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Authentication required"); 
  
      const response = await fetch(`${url}/assigns/order/${orderKey}/operators/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch assigned operators");
      }
  
      const data = await response.json();
      console.log("Operadores asignados:", data); // Para debug
      
      // Si necesitas transformar la data, hazlo aquí
      const formattedData = data.map(operator => ({
        ...operator,
        // Agrega campos adicionales si es necesario
        role: operator.role || "operator" // Valor por defecto
      }));
      
      setAssignedOperators(formattedData);
    } catch (error) {
      console.error("Error fetching assigned operators:", error);
      notifyMessage("Failed to load assigned operators");
    } finally {
      setLoading(false);
    }
  };

  function notifyMessage(msg: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT)
    }
  }

  const handleAddOperator = (newOperator: Operator) => {
    setOperators(prev => [...prev, newOperator]);
    setAddOperatorVisible(false);
  };

  const handleDeleteOperator = (index: number) => {
    Alert.alert("Confirm deletion", "Are you sure you want to delete this operator?", [
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
    setTruckModalVisible(true);
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

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Authentication required");

      const payload = operators.map(op => ({
        operator: op.id,
        order: orderKey,
        rol: op.role || "operator",
        additional_costs: op.additionalCosts || 0,
        truck: op.truckId || null
      }));

      const response = await fetch(`${url}/assigns/bulk/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 207) {
          const conflictMessages = responseData.data.conflicts
            .map((c) => `Operator ${c.operator_id}: ${c.message}`)
            .join('\n');

          const successMessage = responseData.data.created.length > 0
            ? `${responseData.data.created.length} assignments saved.`
            : "";

          Alert.alert(
            "Partial Success",
            `${responseData.messUser}\n\n${successMessage}\n\nConflicts:\n${conflictMessages}`,
            [{ text: "OK" }]
          );

          updateOperatorsWithConflicts(responseData.data.conflicts);
          fetchAssignedOperators(); // Refresh the list of assigned operators
          return;
        } else if (response.status === 400) {
          const errorMessages = responseData.data
            .map((e) => `Operator ${e.operator_id || `#${e.index + 1}`}: ${e.message || JSON.stringify(e.errors)}`)
            .join('\n');

          Alert.alert(
            "Validation Error",
            `${responseData.messUser}\n\nDetails:\n${errorMessages}`,
            [{ text: "OK" }]
          );
        } else {
          throw new Error(responseData.messUser || "Unknown error");
        }
        return;
      }

      setOperators([]);
      fetchAssignedOperators(); // Refresh the list of assigned operators
      notifyMessage(responseData.messUser || "All assignments saved successfully");

    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        "Error",
        error.message || "Could not save the assignments",
        [{ text: "OK" }]
      );
    }
  };

  const updateOperatorsWithConflicts = (conflicts) => {
    const conflictOperatorIds = conflicts.map(c => c.operator_id);
    setOperators(prevOperators =>
      prevOperators.filter(op => conflictOperatorIds.includes(op.id))
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20
    },
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
    title: {
      fontSize: 20,
      fontWeight: "bold"
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
      color: "#0458AB"
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center"
    },
    plus: {
      fontSize: 24,
      fontWeight: "bold"
    },
    operatorRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },
    operatorItem: {
      fontSize: 16,
      color: "#0458AB",
      flex: 1
    },
    assignedOperatorItem: {
      fontSize: 16,
      color: "#006400",
      flex: 1
    },
    deleteButton: {
      backgroundColor: "#FF3B30",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginLeft: 10,
    },
    deleteText: {
      color: "#FFFFFF",
      fontWeight: "bold"
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      width: "100%",
      paddingHorizontal: 20,
    },
    backButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8
    },
    saveButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8
    },
    backButtonText: {
      color: "#FFF",
      fontWeight: "bold"
    },
    saveButtonText: {
      fontWeight: "bold"
    },
    roleModalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)"
    },
    roleModalContent: {
      backgroundColor: "#cfe2f3",
      padding: 20,
      borderRadius: 20,
      alignItems: "center",
      width: "100%",
      marginBottom: -5
    },
    roleTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#0458AB",
      marginBottom: 20
    },
    roleButton: {
      backgroundColor: "#0458AB",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      width: "40%",
      marginBottom: 10
    },
    roleButtonText: {
      color: "#FFF",
      fontWeight: "bold",
      textAlign: "center"
    },
    closeButton: {
      position: "absolute",
      right: 10,
    },
    closeButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#0458AB"
    },
    scrollContainer: {
      flex: 1
    },
    loadingContainer: {
      padding: 20,
      alignItems: "center"
    },
    noOperatorsText: {
      color: "#666",
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 10
    }
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

        <ScrollView style={styles.scrollContainer}>
          <View style={[styles.container, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
            {/* Assigned operators section */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
              Assigned Operators
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0458AB" />
              </View>
            ) : assignedOperators.length > 0 ? (
              assignedOperators.map((op, index) => (
                <View key={`assigned-${index}`} style={styles.operatorRow}>
                  <Text style={styles.assignedOperatorItem}>
                    {op.id} - {op.first_name ? `${op.first_name} ${op.last_name}` : op.last_name}
                    {op.role ? ` (${op.role})` : ''}
                    {op.additional_costs > 0 ? ` - Cost: $${op.additional_costs.toFixed(2)}` : ''}
                    {op.truck?.plate ? ` - Truck: ${op.truck.plate}` : ''}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noOperatorsText}>No operators assigned yet</Text>
            )}

            {/* Unsynchronized operators section */}
            {operators.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
                  Unsynchronized Operators
                </Text>

                {operators.map((op, index) => (
                  <View key={`local-${index}`} style={styles.operatorRow}>
                    <TouchableOpacity onPress={() => handleSelectRole(index)}>
                      <Text style={styles.operatorItem}>
                        {op.id} - {op.name}
                        {op.role ? ` (${op.role})` : ''}
                        {op.additionalCosts > 0 ? ` - Cost: $${op.additionalCosts}` : ''}
                        {op.truckId ? ` - Truck ID: ${op.truckId}` : ''}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteOperator(index)}>
                      <Text style={styles.deleteText}>X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDarkMode ? "#0458AB" : "#545257" }]}
            onPress={onClose}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isDarkMode ? "#FFFFFF" : "#0458AB" }]}
            onPress={handleSave}
            disabled={operators.length === 0}
          >
            <Text style={[styles.saveButtonText, { color: isDarkMode ? "#0458AB" : "#FFFFFF" }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <AddOperatorForm
        visible={addOperatorVisible}
        onClose={() => setAddOperatorVisible(false)}
        onAddOperator={handleAddOperator}
        orderKey={orderKey}
      />

      <Modal
        animationType="slide"
        transparent
        visible={roleSelectorVisible}
        onRequestClose={() => setRoleSelectorVisible(false)}
      >
        <View style={styles.roleModalContainer}>
          <View style={styles.roleModalContent}>
            <Text style={styles.roleTitle}>
              {selectedOperatorIndex !== null && operators[selectedOperatorIndex]
                ? operators[selectedOperatorIndex].name
                : "Operator Name"}
            </Text>
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
      <TruckModal
        visible={truckModalVisible}
        onClose={() => setTruckModalVisible(false)}
        orderKey={orderKey}
      />
    </Modal>
  );
};

export default OperatorModal;