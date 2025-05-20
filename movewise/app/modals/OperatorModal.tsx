import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import AddOperatorForm from "./AddOperatorForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { url } from "../../hooks/api/apiClient";
import { useTranslation } from "react-i18next";
import TruckModal from "./TruckModal";
import Toast from "react-native-toast-message";
import { deleteAssign } from "@/hooks/api/DeleteAssign";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

interface Operator {
  id_operator: number;
  name: string;
  role?: string;
  additionalCosts?: number;
  truckId?: number;
}

interface AssignedOperator {
  id_assign: number;
  id: number;
  first_name: string | null;
  last_name: string;
  rol?: string;
  additional_costs: number;
  truck?: {
    id_truck: number;
    plate: string;
  };
}

interface OperatorModalProps {
  visible: boolean;
  onClose: () => void;
  orderKey: string;
  onSave: () => void;
}


const OperatorModal: React.FC<OperatorModalProps> = ({ visible, onClose, orderKey, onSave }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [assignedOperators, setAssignedOperators] = useState<AssignedOperator[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOperatorVisible, setAddOperatorVisible] = useState(false);
  const [roleSelectorVisible, setRoleSelectorVisible] = useState(false);
  const [truckModalVisible, setTruckModalVisible] = useState(false);
  const [selectedOperatorIndex, setSelectedOperatorIndex] = useState<number | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

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

      const response = await fetch(`${url}/assigns/order/${orderKey}/operators/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      if (!response.ok) {
        throw new Error(t("failed_to_fetch_assigned_operators"));
      }


      const data = await response.json();
      const formattedData = data.map((operator: AssignedOperator) => ({
        ...operator,
        role: operator.rol,
      }));


      console.log(`operadores asignados: ${JSON.stringify(formattedData)}`);

      setAssignedOperators(formattedData);
    } catch (error) {
      console.error(t("error_fetching_assigned_operators"), error);
    } finally {
      setLoading(false);
    }
  };
  const validateFields = () => {
    const errors = operators.filter(op =>
      op.role === "driver" && !op.truckId
    );

    if (errors.length > 0) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("drivers_need_truck"),
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error(t("authentication_required"));
      // console.log("Operadores antes de construir el payload:", operators);

      if (!validateFields()) {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("validation_error"),
        });
        return;
      }

      const payload = operators.map(op => ({
        operator: op.id_operator,
        order: orderKey,
        rol: op.role?.toLowerCase() || '',
        additional_costs: op.additionalCosts || 0,
        truck: op.role === "driver" ? op.truckId : null
      }));

      // console.log("Payload enviado al backend para la asignación:", payload);
      const response = await fetch(`${url}/assigns/bulk/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      // console.log("Respuesta del backend:", responseData);

      if (!response.ok) {
        if (response.status === 207) {
          const conflictMessages = responseData.data.conflicts
            .map((c: { operator_id: number; message: string }) => `${t("operator")} ${c.operator_id}: ${c.message}`)
            .join('\n');

          const successMessage = responseData.data.created.length > 0
            ? `${responseData.data.created.length} ${t("assignments_saved")}.`
            : "";

          Toast.show({
            type: "info",
            text1: t("partial_success"),
            text2: `${successMessage}\n\n${t("conflicts")}: ${conflictMessages}`,
          });

          updateOperatorsWithConflicts(responseData.data.conflicts);
          fetchAssignedOperators();
          onSave();
        } else if (response.status === 400) {
          const errorMessages = responseData.data
            .map((e: { operator_id?: number; index?: number; message?: string; errors?: any }) =>
              `${t("operator")} ${e.operator_id || `#${(e.index ?? -1) + 1}`}: ${e.message || JSON.stringify(e.errors)}`)
            .join('\n');

          Toast.show({
            type: "error",
            text1: t("error"),
            text2: errorMessages,
          });
        } else {
          throw new Error(responseData.messUser || t("unknown_error"));
        }
        return;
      }

      setOperators([]);
      fetchAssignedOperators();
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("assignments_saved"),
      });

      onSave(); // Close the modal after saving
    } catch (error) {
      console.error(t("error"), error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("could_not_save_assignments"),
      });
    }
  };

  const updateOperatorsWithConflicts = (conflicts: any) => {
    const conflictOperatorIds = conflicts.map(
      (c: { operator_id: number }) => c.operator_id);
    setOperators(prevOperators =>
      prevOperators.filter(op => conflictOperatorIds.includes(op.id_operator))
    );
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
              const assignmentId = assignedOperators[index].id_assign;
              deleteAssign(assignmentId)
                .then(() => {
                  setAssignedOperators(prev => prev.filter((_, i) => i !== index));
                  Toast.show({
                    type: "success",
                    text1: t("success"),
                    text2: t("assignation_deleted"),
                  });
                  fetchAssignedOperators();
                })
                .catch((error) => {
                  console.error("Error deleting assignation:", error);
                  Alert.alert(t("error"), t("could_not_delete_assignation"));
              });
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
    if (selectedOperatorIndex !== null) {
      setOperators(prev =>
        prev.map((op, i) =>
          i === selectedOperatorIndex
            ? { ...op, role: "driver", truckId: undefined }
            : op
        )
      );
      setTimeout(() => setTruckModalVisible(true), 100);
    }
    setRoleSelectorVisible(false);
  };

  const handleTruckSelection = (truckId: number) => {
    console.log("Índice actual:", selectedOperatorIndex);
    console.log("Operadores antes:", JSON.stringify(operators));

    if (selectedOperatorIndex !== null) {
      setOperators(prev => {
        const newOperators = [...prev];
        newOperators[selectedOperatorIndex].truckId = truckId;
        return newOperators;
      });
    }

    console.log("Operadores después:", JSON.stringify(operators));
    setTruckModalVisible(false);
  };

  const assignTeamLeader = () => {
    if (selectedOperatorIndex !== null) {
      setOperators((prev) =>
        prev.map((op, i) =>
          i === selectedOperatorIndex ? {
            ...op,
            role: "leader",
            truckId: undefined
          } : op
        )
      );
    }
    setRoleSelectorVisible(false);
  };
  
  const renderOperatorItem = (operator: any, index: number, isAssigned: boolean) => {
    const renderRightActions = () => (
      <View style={styles.rightSwipeActions}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteOperator(index, isAssigned)}
        >
          <Text style={styles.actionText}>{t("delete")}</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <GestureHandlerRootView key={`operator-${index}`}>
        <Swipeable renderRightActions={renderRightActions}>
          <TouchableOpacity
            onPress={() => !isAssigned && handleSelectRole(index)} // Only allow role selection for unsynchronized operators
          >
            <View style={[styles.operatorItem, { backgroundColor: isDarkMode ? "#1E3A5F" : "#f5f5f5" }]}>
              <View style={styles.operatorDetails}>
                <Text style={[styles.operatorName, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
                  {operator.first_name || operator.name} {operator.last_name || ""}
                </Text>
                <Text style={[styles.operatorRole, { color: isDarkMode ? "#CCCCCC" : "#333333" }]}>
                  {operator.role ? `(${t(operator.role)})` : ""}
                  {operator.additional_costs > 0 ? ` - ${t("cost")}: $${operator.additional_costs.toFixed(2)}` : ""}
                  {operator.truck?.plate ? ` - ${t("truck")}: ${operator.truck.plate}` : ""}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#A1C6EA" }}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDarkMode ? "#FFFFFF" : "#0458AB"}
            />
          </TouchableOpacity>

          <Text style={[styles.title, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
            {t("operators")}
          </Text>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isDarkMode ? "#FFF" : "#0458AB" }]}
            onPress={() => setAddOperatorVisible(true)}
          >
            <Text style={[styles.plus, { color: isDarkMode ? "#0458AB" : "#FFF" }]}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          <View style={[styles.container, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
            {/* Lista de operadores asignados */}
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

            {/* Lista de operadores no sincronizados */}
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
        {operators.length > 0 && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t("save_button")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <AddOperatorForm
        visible={addOperatorVisible}
        onClose={() => setAddOperatorVisible(false)}
        onAddOperator={(newOperator) => setOperators((prev) => [...prev, newOperator])}
        orderKey={orderKey}
      />

      {/* Modal para seleccionar roles */}
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
      {/* TruckModal */}
      <TruckModal
        visible={truckModalVisible}
        onClose={() => setTruckModalVisible(false)}
        orderKey={orderKey}
        onTruckSelect={handleTruckSelection} // Pasar la función para manejar la selección del camión
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#0458AB",
  },
  operatorItem: {
    flexDirection: "row",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  operatorDetails: {
    flex: 1,
    justifyContent: "center",
  },
  operatorName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  operatorRole: {
    fontSize: 14,
    marginTop: 4,
  },
  rightSwipeActions: {
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "flex-end",
    height: "100%",
    width: 100,
  },
  deleteAction: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  noOperatorsText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: 24,
    fontWeight: "bold",
  },
  roleModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  roleModalContent: {
    backgroundColor: "#cfe2f3",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0458AB",
    marginBottom: 20,
  },
  roleButton: {
    backgroundColor: "#0458AB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "40%",
    marginBottom: 10,
  },
  roleButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0458AB",
  },
  saveButton: {
    backgroundColor: "#0458AB",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OperatorModal;