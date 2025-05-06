import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AddOperatorForm from "./AddOperatorForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { url } from "../../hooks/api/apiClient";
import { ToastAndroid, Platform } from 'react-native';
import TruckModal from "./TruckModal";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const { t } = useTranslation(); // Hook para traducción
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

  // Obtener operadores asignados cuando el modal se hace visible
  useEffect(() => {
    if (visible && orderKey) {
      fetchAssignedOperators();
    }
  }, [visible, orderKey]);

  const fetchAssignedOperators = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error(t("authentication_required"));

      const response = await fetch(`${url}assigns/order/${orderKey}/operators/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(t("failed_to_fetch_assigned_operators"));
      }

      const data = await response.json();
      console.log(t("assigned_operators"), data); // Para debug

      const formattedData = data.map(operator => ({
        ...operator,
        role: operator.role || t("operator") // Valor por defecto
      }));

      setAssignedOperators(formattedData);
    } catch (error) {
      console.error(t("error_fetching_assigned_operators"), error);
      notifyMessage(t("failed_to_load_assigned_operators"));
    } finally {
      setLoading(false);
    }
  };

  function notifyMessage(msg: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    }
  }

  const handleAddOperator = (newOperator: Operator) => {
    setOperators(prev => [...prev, newOperator]);
    setAddOperatorVisible(false);
  };

  const handleDeleteOperator = (index: number, isAssigned: boolean) => {
    Alert.alert(
      t("confirm_deletion"),
      t("delete_operator_confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => {
            if (isAssigned) {
              setAssignedOperators((prev) => prev.filter((_, i) => i !== index));
            } else {
              setOperators((prev) => prev.filter((_, i) => i !== index));
            }
          },
        },
      ]
    );
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
          i === selectedOperatorIndex ? { ...op, role: t("team_leader") } : op
        )
      );
    }
    setRoleSelectorVisible(false);
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error(t("authentication_required"));

      const payload = operators.map(op => ({
        operator: op.id,
        order: orderKey,
        rol: op.role || t("operator"),
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
            .map((c) => `${t("operator")} ${c.operator_id}: ${c.message}`)
            .join('\n');

          const successMessage = responseData.data.created.length > 0
            ? `${responseData.data.created.length} ${t("assignments_saved")}.`
            : "";

          Alert.alert(
            t("partial_success"),
            `${responseData.messUser}\n\n${successMessage}\n\n${t("conflicts")}:\n${conflictMessages}`,
            [{ text: t("ok") }]
          );

          updateOperatorsWithConflicts(responseData.data.conflicts);
          fetchAssignedOperators();
          return;
        } else if (response.status === 400) {
          const errorMessages = responseData.data
            .map((e) => `${t("operator")} ${e.operator_id || `#${e.index + 1}`}: ${e.message || JSON.stringify(e.errors)}`)
            .join('\n');

          Alert.alert(
            t("validation_error"),
            `${responseData.messUser}\n\n${t("details")}:\n${errorMessages}`,
            [{ text: t("ok") }]
          );
        } else {
          throw new Error(responseData.messUser || t("unknown_error"));
        }
        return;
      }

      setOperators([]);
      fetchAssignedOperators();
      notifyMessage(responseData.messUser || t("all_assignments_saved"));

    } catch (error) {
      console.error(t("error"), error);
      Alert.alert(
        t("error"),
          (error instanceof Error ? error.message : t("unknown_error")) || t("could_not_save_assignments"),
        [{ text: t("ok") }]
      );
    }
  };

  const updateOperatorsWithConflicts = (conflicts: { operator_id: number }[]) => {
    const conflictOperatorIds = conflicts.map(c => c.operator_id);
    setOperators(prevOperators =>
      prevOperators.filter(op => conflictOperatorIds.includes(op.id))
    );
  };

  const renderOperatorItem = (operator, index, isAssigned = false) => {
    const renderLeftActions = () => (
        <View style={styles.leftSwipeActions}>
            <TouchableOpacity
                style={[styles.editAction, { backgroundColor: '#3498db' }]}
                onPress={() => handleEditOperator(operator, index, isAssigned)}
            >
                <Ionicons name="create-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>{t("edit")}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderRightActions = () => (
        <View style={styles.rightSwipeActions}>
            <TouchableOpacity
                style={[styles.deleteAction, { backgroundColor: '#e74c3c' }]}
                onPress={() => handleDeleteOperator(index, isAssigned)}
            >
                <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>{t("delete")}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <GestureHandlerRootView key={`operator-${index}`}>
            <Swipeable
                renderRightActions={renderRightActions}
                renderLeftActions={renderLeftActions}
            >
                <TouchableHighlight
                    underlayColor={isDarkMode ? '#f0f0f0' : '#e0e0e0'}
                    onPress={() => handleEditOperator(operator, index, isAssigned)}
                >
                    <View style={[styles.operatorItem, { backgroundColor: isDarkMode ? '#1E3A5F' : '#f5f5f5' }]}>
                        <View style={styles.operatorDetails}>
                            <Text style={[styles.operatorName, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                                {operator.id} - {operator.first_name || operator.name} {operator.last_name || ""}
                            </Text>
                            <Text style={[styles.operatorRole, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
                                {t("role")}: {operator.role || t("operator")}
                            </Text>
                            {operator.additionalCosts > 0 && (
                                <Text style={[styles.operatorCost, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
                                    {t("cost")}: ${operator.additionalCosts.toFixed(2)}
                                </Text>
                            )}
                        </View>
                    </View>
                </TouchableHighlight>
            </Swipeable>
        </GestureHandlerRootView>
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
        flexDirection: 'row',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
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
        flex: 1,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noOperatorsText: {
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 10,
    },
    leftSwipeActions: {
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '100%',
        width: 100,
    },
    rightSwipeActions: {
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: '100%',
        width: 100,
    },
    editAction: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteAction: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    operatorDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    operatorName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    operatorRole: {
        fontSize: 14,
        marginTop: 4,
    },
    operatorCost: {
        fontSize: 14,
        marginTop: 4,
    },
  });

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#A1C6EA" }}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff", borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
          <Text style={[styles.title, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>{t("operators")}</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isDarkMode ? "#FFF" : "#0458AB" }]}
            onPress={() => setAddOperatorVisible(true)}
          >
            <Text style={[styles.plus, { color: isDarkMode ? "#0458AB" : "#FFF" }]}>+</Text>
          </TouchableOpacity>
        </View>
  
        <ScrollView style={styles.scrollContainer}>
          <View style={[styles.container, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
            {/* Sección de operadores asignados */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
              {t("assigned_operators")}
            </Text>
  
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0458AB" />
              </View>
            ) : assignedOperators.length > 0 ? (
              assignedOperators.map((op, index) => renderOperatorItem(op, index, true))
            ) : (
              <Text style={styles.noOperatorsText}>{t("no_assigned_operators")}</Text>
            )}
  
            {/* Sección de operadores no sincronizados */}
            {operators.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
                  {t("unsynchronized_operators")}
                </Text>
                {operators.map((op, index) => renderOperatorItem(op, index, false))}
              </>
            )}
          </View>
        </ScrollView>
  
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDarkMode ? "#0458AB" : "#545257" }]}
            onPress={onClose}
          >
            <Text style={styles.backButtonText}>{t("back")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isDarkMode ? "#FFFFFF" : "#0458AB" }]}
            onPress={handleSave}
            disabled={operators.length === 0}
          >
            <Text style={[styles.saveButtonText, { color: isDarkMode ? "#0458AB" : "#FFFFFF" }]}>
              {t("save")}
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
                : t("operator_name")}
            </Text>
            <TouchableOpacity style={styles.roleButton} onPress={assignDriver}>
              <Text style={styles.roleButtonText}>{t("driver")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roleButton} onPress={assignTeamLeader}>
              <Text style={styles.roleButtonText}>{t("team_leader")}</Text>
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