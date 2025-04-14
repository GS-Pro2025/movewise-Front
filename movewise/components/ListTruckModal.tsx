import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { ListTruck, DeleteTruck } from "@/hooks/api/TruckClient";
import Toast from "react-native-toast-message";

interface ListTruckModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit?: (truck: any) => void;
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
      const response = await ListTruck();
      setTrucks(response.data);
      Toast.show({
        type: "success",
        text1: "Trucks loaded",
        text2: "List of trucks successfully fetched.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error loading trucks",
        text2: "Failed to fetch the list of trucks.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await DeleteTruck(id);
      setTrucks((prev) => prev.filter((t) => t.id_truck !== id));
      Toast.show({
        type: "success",
        text1: "Truck deleted",
        text2: "The truck has been successfully removed.",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Deletion failed",
        text2: "Could not delete the truck.",
      });
    }
  };

  useEffect(() => {
    if (visible) {
      fetchTrucks();
    }
  }, [visible]);

  const renderLeftActions = (item: any) => (
    <TouchableOpacity
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#60a5fa",
        width: 70,
      }}
      onPress={() => onEdit?.(item)}
    >
      <Ionicons name="create-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderRightActions = (item: any) => (
    <TouchableOpacity
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ef4444",
        width: 70,
      }}
      onPress={() => handleDelete(item.id_truck)}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable
      renderLeftActions={() => renderLeftActions(item)}
      renderRightActions={() => renderRightActions(item)}
    >
      <View
        style={{
          padding: 15,
          backgroundColor: "#f3f4f6",
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontWeight: "600", fontSize: 16 }}>{item.number_truck}</Text>
        <Text>
          {item.type} - {item.rol || "No role"} - {item.name}
        </Text>
      </View>
    </Swipeable>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Truck List
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={trucks}
            keyExtractor={(item) => String(item.id_truck)}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={{ textAlign: "center" }}>No trucks registered.</Text>
            }
          />
        )}

        <TouchableOpacity
          onPress={onClose}
          style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: "#4b5563",
            borderRadius: 8,
          }}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
          >
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ListTruckModal;
