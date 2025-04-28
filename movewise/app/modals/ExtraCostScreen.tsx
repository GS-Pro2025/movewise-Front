import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, Alert } from "react-native";
import { SearchParams, useRouter } from "expo-router"; // Importa useRouter para la navegación
import WorkCost, { ListWorkCostByOrder } from "@/hooks/api/WorkCostListByOrder";
import { useSearchParams } from "expo-router/build/hooks";
import { BulkCreateWorkCost } from "@/hooks/api/WorkCostBulkCreate";
const ExtraCostScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const newWorkCost = searchParams.get("newWorkCost"); // Obtén el nuevo WorkCost (si existe)

  const [existingWorkCosts, setExistingWorkCosts] = useState<WorkCost[]>([]); // Lista de costos existentes
  const [newWorkCosts, setNewWorkCosts] = useState<WorkCost[]>([]); // Lista de nuevos costos
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los costos extra existentes
  const fetchWorkCosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ListWorkCostByOrder(key || "");
      setExistingWorkCosts(response); // Guarda los costos existentes
    } catch (err) {
      console.error("Error fetching work costs:", err);
      setError("Failed to load work costs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkCosts(); // Carga los costos al montar el componente
  }, [key]);

  useEffect(() => {
    // Si hay un nuevo WorkCost, agrégalo a la lista de nuevos costos
    if (newWorkCost) {
      const parsedWorkCost = JSON.parse(newWorkCost);
      setNewWorkCosts((prev) => [...prev, parsedWorkCost]);
    }
  }, [newWorkCost]);

  const handleSave = async () => {
    try {
      console.log("Saving New WorkCosts:", newWorkCosts);
      const response = await BulkCreateWorkCost(newWorkCosts); // Guarda solo los nuevos costos
      console.log("Response from BulkCreateWorkCost:", response);
      Alert.alert("Success", "New work costs saved successfully!");
      setNewWorkCosts([]); // Limpia la lista de nuevos costos después de guardar
    } catch (err) {
      console.error("Error saving work costs:", err);
      Alert.alert("Error", "Failed to save new work costs.");
    }
  };

  const renderItem = ({ item, isNew }: { item: WorkCost; isNew: boolean }) => (
    <View style={[styles.itemContainer, isNew && styles.newItemContainer]}>
      <View style={styles.iconContainer}>
        <Image source={require("../../assets/images/dollar.png")} style={styles.icon} />
      </View>
      <Text style={styles.labelText}>Name: {item.name}</Text>
      <Text style={styles.labelText}>Cost: ${item.cost}</Text>
      <Text style={styles.labelText}>Type: {item.type}</Text>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Extra Costs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push({ pathname: "./AddExtraCostForm", params: { key } })}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de costos */}
      <FlatList
        data={[...existingWorkCosts.map((item) => ({ ...item, isNew: false })), ...newWorkCosts.map((item) => ({ ...item, isNew: true }))]} // Combina ambas listas
        keyExtractor={(item) => item.id_workCost?.toString() || item.name} // Usa name si id_workCost no está disponible
        renderItem={({ item }) => renderItem({ item, isNew: item.isNew })}
        contentContainerStyle={styles.list}
      />

      {/* Botones de guardar y cancelar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.canGoBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
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
    marginTop: 20,
    marginBottom: 20,
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
});

export default ExtraCostScreen;