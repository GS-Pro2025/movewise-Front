import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator } from "react-native";
import { SearchParams } from "expo-router"; // Para obtener el parámetro key
import WorkCost, { ListWorkCost } from "../../hooks/api/WorkCostList"; // Importa la función ListWorkCost
import { useSearchParams } from "expo-router/build/hooks";

const ExtraCostScreen = () => {
  const searchParams = useSearchParams(); // Obtén los parámetros de búsqueda
  const key = searchParams.get("key"); // Obtén el parámetro key
  const [workCosts, setWorkCosts] = useState<WorkCost[]>([]); // Estado para los costos extra
  const [loading, setLoading] = useState<boolean>(true); // Estado para la carga
  const [error, setError] = useState<string | null>(null); // Estado para errores

  // Función para obtener los costos extra
  const fetchWorkCosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ListWorkCost(1, 100); // Obtén todos los costos (puedes ajustar la paginación si es necesario)
      const filteredCosts = response.data.filter((cost) => cost.id_order === key); // Filtra por id_order
      setWorkCosts(filteredCosts);
    } catch (err) {
      console.error("Error fetching work costs:", err);
      setError("Failed to load work costs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkCosts(); // Llama a la función al montar el componente
  }, [key]);

  const renderItem = ({ item }: { item: WorkCost }) => (
    <View style={styles.itemContainer}>
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
      </View>

      {/* Lista de costos */}
      <FlatList
        data={workCosts}
        keyExtractor={(item) => item.id_workCost.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#004080" },
  list: { marginTop: 10 },
  itemContainer: { flexDirection: "column", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
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
});

export default ExtraCostScreen;