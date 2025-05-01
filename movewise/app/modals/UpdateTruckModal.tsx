import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { UpdateTruck } from "@/hooks/api/TruckClient";
import Truck from "@/hooks/api/TruckClient";
import { useTranslation } from "react-i18next";

type UpdateTruckModalProps = {
  visible: boolean;
  truck: Truck | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const UpdateTruckModal = ({ visible, truck, onClose, onSuccess }: UpdateTruckModalProps) => {
  const [number, setNumber] = useState("");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (truck) {
      setNumber(truck.number_truck);
      setType(truck.type);
      setName(truck.name);
      setCategory(truck.category ?? "");
    }
  }, [truck]);

  const handleUpdate = async () => {
    if (!number || !type || !name || !category) {
      Toast.show({
        type: "error",
        text1: t("mandatory_fields"),
        text2: t("complete_required_fields"),
      });
      return;
    }

    setLoading(true);
    try {
      if (truck) {
        await UpdateTruck(truck.id_truck, {
          number_truck: number,
          type,
          name,
          category: category,
        });

        Toast.show({
          type: "success",
          text1: t("truck_updated"),
          text2: t("truck_updated_successfully"),
        });

        onSuccess?.();
        onClose();
      } else {
        throw new Error(t("truck_data_missing"));
      }
    } catch (error) {
      console.error(t("error_updating_truck"), error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("truck_update_failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("update_truck")}</Text>
        <Text style={styles.labelInput}>{t("type")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("type_placeholder")}
          value={type}
          onChangeText={setType}
        />
        <Text style={styles.labelInput}>{t("name")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("name_placeholder")}
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.labelInput}>{t("category")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("category_placeholder")}
          value={category}
          onChangeText={setCategory}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>{t("save_changes")}</Text>
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
  labelInput: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 0,
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
