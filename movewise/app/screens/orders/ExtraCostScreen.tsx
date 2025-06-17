import React, { useState, useEffect, useCallback } from "react";
import { View,useColorScheme, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import WorkCost, { ListWorkCostByOrder } from "@/hooks/api/WorkCostListByOrder";
import { BulkCreateWorkCost } from "@/hooks/api/WorkCostBulkCreate";
import AddExtraCostForm from "./AddExtraCostForm";
import { useRouter } from "expo-router";
import colors from "@/app/Colors";

interface ExtraCostScreenProps {
  orderKey: string;
  onClose: () => void;
}

const ExtraCostScreen = ({ orderKey, onClose }: ExtraCostScreenProps) => {
  const { t } = useTranslation();
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';
  const router = useRouter();
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [newWorkCost, setNewWorkCost] = useState<any>(null);

  const [existingWorkCosts, setExistingWorkCosts] = useState<WorkCost[]>([]);
  const [newWorkCosts, setNewWorkCosts] = useState<WorkCost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleOpenAddForm = () => setShowAddForm(true);
  const handleCloseAddForm = () => setShowAddForm(false);
  
  const fetchWorkCosts = useCallback(async () => {
    if (!orderKey) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await ListWorkCostByOrder(orderKey);
      setExistingWorkCosts(response);
    } catch (err) {
      console.error(t("error_fetching_costs"), err);
      setError(t("error_fetching_costs"));
    } finally {
      setLoading(false);
    }
  }, [orderKey, t]);
  
  const handleAddExtraCost = useCallback(async (newCost: any) => {
    setIsSubmitting(true);
    try {
      const response = await BulkCreateWorkCost([newCost]);
      Alert.alert(t("success"), t("extra_cost_added"));
      setShowAddForm(false);
      await fetchWorkCosts();
    } catch (err) {
      console.error(t("error_adding_extra_cost"), err);
      Alert.alert(t("error"), t("failed_to_add_extra_cost"));
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchWorkCosts, t]);

  const handleCancel = () => {
    if (newWorkCosts.length > 0) {
      setIsCancelModalVisible(true);
    } else {
      onClose();
    }
  };

  const confirmCancel = () => {
    setIsCancelModalVisible(false);
    onClose();
  };

  const cancelModal = () => {
    setIsCancelModalVisible(false);
  };

  // Función para obtener los costos extra existentes
  useEffect(() => {
    fetchWorkCosts();
  }, [fetchWorkCosts]);

  useEffect(() => {
    // Si hay un nuevo WorkCost, agrégalo a la lista de nuevos costos
    if (newWorkCost) {
      const parsedWorkCost = JSON.parse(newWorkCost);
      setNewWorkCosts((prev) => [...prev, parsedWorkCost]);
    }
  }, [newWorkCost]);

  const handleSave = async () => {
    try {
      // console.log(t("saving_new_costs"), newWorkCosts);
      const response = await BulkCreateWorkCost(newWorkCosts);
      // console.log(t("save_response"), response);
      Alert.alert(t("success"), t("new_costs_saved"));
      setNewWorkCosts([]);
      await fetchWorkCosts();
    } catch (err) {
      console.error(t("error_saving_costs"), err);
      Alert.alert(t("error"), t("error_saving_costs"));
    }
  };

  const renderItem = ({ item, isNew }: { item: WorkCost; isNew: boolean }) => (
    <View style={[styles.itemContainer, isNew && styles.newItemContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.white }]}>
      <View style={styles.iconContainer}>
        <Image source={require("@/assets/images/dollar.png")} style={styles.icon} />
      </View>
      <Text style={styles.labelText}>{t("name")}: {item.name}</Text>
      <Text style={styles.labelText}>{t("cost")}: ${item.cost}</Text>
      <Text style={styles.labelText}>{t("type")}: {item.type}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004080" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.white }] }>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? colors.textDark : colors.primary }]}>{t("extra_costs")}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleOpenAddForm}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de costos */}
      <FlatList
        data={[...existingWorkCosts.map((item) => ({ ...item, isNew: false })), ...newWorkCosts.map((item) => ({ ...item, isNew: true }))]}
        keyExtractor={(item) => item.id_workCost?.toString() || item.name}
        renderItem={({ item }) => renderItem({ item, isNew: item.isNew })}
        contentContainerStyle={styles.list}
      />
    {/* Botones de guardar y cancelar */}
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: isDarkMode ? colors.backgroundDark : colors.white }}>
      <View style={[styles.buttonContainer, { marginBottom: 10 }]}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t("save")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
      {/* Modal de confirmación */}
      <Modal visible={isCancelModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t("cancel_changes")}</Text>
            <Text style={styles.modalMessage}>{t("unsaved_costs_message")}</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={cancelModal}>
                <Text style={styles.modalCancelButtonText}>{t("no")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmCancel}>
                <Text style={styles.modalConfirmButtonText}>{t("yes")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {showAddForm && (
<Modal
          visible={showAddForm}
          animationType="slide"
          onRequestClose={handleCloseAddForm}
        >
          <AddExtraCostForm 
            orderKey={orderKey}
            onSave={handleAddExtraCost}
            onClose={handleCloseAddForm}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30 },
  title: { fontSize: 20, fontWeight: "bold", color: "#004080" },
  addButton: {
    backgroundColor: "#004080",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  list: { marginTop: 10 },
  itemContainer: { flexDirection: "column", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  newItemContainer: { backgroundColor: "#E8F5E9" }, // Verde suave para nuevos costos
  iconContainer: {
    backgroundColor: "#004080",
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: { width: 24, height: 24, tintColor: "#fff" },
  labelText: { fontSize: 16, color: "#004080" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red" },
  saveButton: {
    backgroundColor: "#5AA2E7",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 20,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  cancelButton: {
    backgroundColor: "#FF5C5C", // Rojo para indicar cancelación
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 20,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#004080" },
  modalMessage: { fontSize: 14, textAlign: "center", marginBottom: 20, color: "#333" },
  modalButtonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalCancelButton: {
    backgroundColor: "#FF5C5C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalCancelButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalConfirmButton: {
    backgroundColor: "#5AA2E7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalConfirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default ExtraCostScreen;