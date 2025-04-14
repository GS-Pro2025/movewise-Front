import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { ListTruck, DeleteTruck } from "@/hooks/api/TruckClient";

interface ListTruckModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit?: (truck: any) => void; // opcional para manejar edición
}

const ListTruckModal: React.FC<ListTruckModalProps> = ({
  visible,
  onClose,
  onEdit,
}) => {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const { data } = await ListTruck();
      console.log("Trucks data:", data);
      setTrucks(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la lista de camiones.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar", "¿Estás seguro de eliminar este camión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await DeleteTruck(id);
            setTrucks((prev) => prev.filter((t) => t.id !== id));
          } catch {
            Alert.alert("Error", "No se pudo eliminar el camión.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (visible) {
      fetchTrucks();
    }
  }, [visible]);

  const renderLeftActions = (item: any) => (
    <TouchableOpacity
      style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#60a5fa", width: 70 }}
      onPress={() => onEdit?.(item)}
    >
      <Ionicons name="create-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderRightActions = (item: any) => (
    <TouchableOpacity
      style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#ef4444", width: 70 }}
      onPress={() => handleDelete(item.id)}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable
      renderLeftActions={() => renderLeftActions(item)}
      renderRightActions={() => renderRightActions(item)}
    >
      <View style={{ padding: 15, backgroundColor: "#f3f4f6", borderRadius: 8, marginBottom: 10 }}>
        <Text style={{ fontWeight: "600", fontSize: 16 }}>{item.number_truck}</Text>
        <Text>{item.type} - {item.rol} - {item.name}</Text>
      </View>
    </Swipeable>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
          Lista de Camiones
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={trucks}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={{ textAlign: "center" }}>No hay camiones registrados.</Text>}
          />
        )}

        <TouchableOpacity
          onPress={onClose}
          style={{ marginTop: 20, padding: 12, backgroundColor: "#4b5563", borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ListTruckModal;


