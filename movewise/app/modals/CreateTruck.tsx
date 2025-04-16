import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HeaderWithDivider from "@/components/HeaderWithDivider";
import DropDownPicker from "react-native-dropdown-picker";
import Toast from "react-native-toast-message";
import CreateTruckModel  from "@/models/ModelCreateTruck"
import { CreateTruck } from "@/hooks/api/TruckClient";

type CreateTruckScreenProps = {
  visible: boolean;
  onClose: () => void;
};
// Reemplaza el contenido de tu componente actual por este
const CreateTruckScreen = ({ visible, onClose }: CreateTruckScreenProps) => {
  const navigation = useNavigation();
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const typeOptions = [
    { label: "Carga ligera", value: "Carga ligera" },
    { label: "Carga mediana", value: "Carga mediana" },
    { label: "Carga pesada", value: "Carga pesada" },
  ];

  const categoryOptions = [
    { label: "Categoría A", value: "a" },
    { label: "Categoría B", value: "b" },
  ];

  const [errors, setErrors] = useState({
    type: false,
    name: false,
    number: false,
  });

  const validateFields = () => {
    const newErrors = {
      type: !type,
      name: !name.trim(),
      number: !number.trim(),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const confirmBeforeSave = () => {
    if (!validateFields()) return;
    setShowConfirmModal(true);
  };

  const handleSave = async () => {
    const newTruck: CreateTruckModel = {
      number_truck: number,
      category: category,
      type: type,
      name: name,
    };

    setLoading(true);

    try {
      await CreateTruck(newTruck);
      setLoading(false);
      setShowConfirmModal(false);
      Toast.show({
        type: "success",
        text1: "Truck created",
        text2: "Truck created and added to the list"
      });
    } catch (error) {
      console.error("Error on the truck creation:", error);
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error on the truck creation",
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <HeaderWithDivider />

        <View style={styles.form}>
          {/* Type */}
          <View style={{ zIndex: 1000 }}>
            <Text style={styles.label}>
              Truck Type <Text style={styles.required}>*</Text>
            </Text>
            <DropDownPicker
              open={openType}
              value={type}
              items={typeOptions}
              setOpen={setOpenType}
              setValue={setType}
              setItems={() => {}}
              placeholder="Select Type"
              placeholderStyle={{ color: "#9ca3af" }}
              style={[styles.input, { borderColor: errors.type ? "red" : "#0458AB" }]}
              listMode="SCROLLVIEW"
              dropDownContainerStyle={{ maxHeight: 200 }}
            />
          </View>

          {/* Category */}
          <View style={{ zIndex: 999 }}>
            <Text style={styles.label}>Category</Text>
            <DropDownPicker
              open={openCategory}
              value={category}
              items={categoryOptions}
              setOpen={setOpenCategory}
              setValue={setCategory}
              setItems={() => {}}
              placeholder="(Optional)"
              placeholderStyle={{ color: "#9ca3af" }}
              style={styles.input}
              listMode="SCROLLVIEW"
              dropDownContainerStyle={{ maxHeight: 200 }}
            />
          </View>

          {/* Name */}
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.errorBorder]}
            placeholder="Truck Name"
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
          />

          {/* Number */}
          <Text style={styles.label}>
            Truck Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.number && styles.errorBorder]}
            placeholder="DEF456"
            placeholderTextColor="#ccc"
            keyboardType="default"
            value={number}
            onChangeText={setNumber}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={confirmBeforeSave}
              disabled={loading}
            >
              <Text style={styles.saveText}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showConfirmModal}
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Truck Type: {type}</Text>
              <Text style={styles.modalText}>Category: {category || "N/A"}</Text>
              <Text style={styles.modalText}>Name: {name}</Text>
              <Text style={styles.modalText}>Number: {number}</Text>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveText}>{loading ? "..." : "OK"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};


export default CreateTruckScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  label: {
    fontSize: 14,
    color: "#0458AB",
    marginBottom: 4,
    marginTop: 12,
  },
  required: {
    color: "red",
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: "#0458AB",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  picker: {
    height: Platform.OS === "ios" ? 200 : 48,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#0458AB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  errorBorder: {
    borderColor: "red",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    width: "48%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#3C3C3C",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#79B6EC",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#0458AB",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  modalText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
