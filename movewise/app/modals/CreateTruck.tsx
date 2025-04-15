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
import { CreateTruck } from "@/hooks/api/TruckClient";
import { ModelAddTruck } from "@/models/ModelAddTruck";
import DropDownPicker from "react-native-dropdown-picker";
import Toast from "react-native-toast-message";

const CreateTruckScreen: React.FC = () => {
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
    { label: "Refrigerated", value: "Refrigerated" },
    { label: "Tanker", value: "Tanker" },
    { label: "Flatbed", value: "Flatbed" },
    { label: "Cargo", value: "Cargo" },
  ];
  
  const categoryOptions = [
    { label: "Category A", value: "a" },
    { label: "Category B", value: "b" },
  ];
  const [errors, setErrors] = useState({
    type: false,
    category: false,
    name: false,
    number: false,
  });

  const validateFields = () => {
    const newErrors = {
      type: !type,
      category: !category,
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
    const newTruck: ModelAddTruck = {
      number_truck: number,
      type: type,
      rol: category,
      name: name,
    };

    setLoading(true);

    try {
      await CreateTruck(newTruck);
      Toast.show({
        type: "success",
        text1: "Truck created",
      });
      setLoading(false);
      setShowConfirmModal(false);
      navigation.goBack();
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
    <View style={styles.container}>
      <HeaderWithDivider />

      <View style={styles.form}>
        <View style={{ zIndex: 1000 }}>
          <Text style={styles.label}>Type <Text style={styles.required}>(*)</Text></Text>
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
        <View style={{ zIndex: 999 }}>
          <Text style={styles.label}>Category <Text style={styles.required}>(*)</Text></Text>
          <DropDownPicker
            open={openCategory}
            value={category}
            items={categoryOptions}
            setOpen={setOpenCategory}
            setValue={setCategory}
            setItems={() => {}}
            placeholder="Select Category"
            placeholderStyle={{ color: "#9ca3af" }}
            style={[styles.input, { borderColor: errors.category ? "red" : "#0458AB" }]}
            listMode="SCROLLVIEW"
            dropDownContainerStyle={{ maxHeight: 200 }}
          />
        </View>

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

        <Text style={styles.label}>
          Number of Truck <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.number && styles.errorBorder]}
          placeholder="0.0"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
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
              {loading ? "Saving..." : "save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Type: {type}</Text>
            <Text style={styles.modalText}>Category: {category}</Text>
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
