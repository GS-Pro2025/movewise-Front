// UpdateTruckModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "@/hooks/api/apiClient";

type Truck = {
  id_truck: string;
  plate: string;
  brand: string;
};

type UpdateTruckModalProps = {
  visible: boolean;
  truck: Truck | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const UpdateTruckModal = ({ visible, truck, onClose, onSuccess }: UpdateTruckModalProps) => {
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (truck) {
      setPlate(truck.plate);
      setBrand(truck.brand);
    }
  }, [truck]);

  const handleUpdate = async () => {
    if (!plate || !brand) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      await apiClient.put(`/trucks/${truck?.id_truck}/`, {
        plate,
        brand,
      });

      Alert.alert("Éxito", "Camión actualizado correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error actualizando camión:", error);
      Alert.alert("Error", "No se pudo actualizar el camión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Actualizar Camión</Text>

        <TextInput
          style={styles.input}
          placeholder="Placa"
          value={plate}
          onChangeText={setPlate}
        />
        <TextInput
          style={styles.input}
          placeholder="Marca"
          value={brand}
          onChangeText={setBrand}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 30,
    right: 20,
  },
});

export default UpdateTruckModal;
