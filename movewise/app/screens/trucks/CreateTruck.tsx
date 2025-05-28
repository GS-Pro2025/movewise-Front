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
import HeaderWithDividerCreateTruck from "@/components/HeaderWithDividerCreateTruck";
import DropDownPicker from "react-native-dropdown-picker";
import Toast from "react-native-toast-message";
import CreateTruckModel  from "@/models/ModelCreateTruck"
import { CreateTruck } from "@/hooks/api/TruckClient";
import { useTranslation } from "react-i18next";

type CreateTruckScreenProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};
// Reemplaza el contenido de tu componente actual por este
const CreateTruckScreen = ({ visible, onClose, onSuccess }: CreateTruckScreenProps) => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // Importar el hook de traducción
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const typeOptions = [
    { label: t("rented"), value: "rented" },
    { label: t("owned"), value: "owned" }
  ];

  const categoryOptions = [
    { label: t("vans"), value: "vans" },
    { label: t("Truck_26"), value: "truck_26" },
    { label: t("Trailer"), value: "trailer" },
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
      setShowConfirmModal(false);
        setTimeout(() => {
          onClose();
        }, 300); // Da tiempo a que el modal se cierre con animación

      //For refreshing the list
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: t("truck_created"),
          text2: t("truck_added"),
        });
      }, 500);

    } catch (error) {
      console.error(t("truck_creation_error"), error);
      setLoading(false);
      setTimeout(() => {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("truck_creation_error"),
        });
      }, 500);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <HeaderWithDividerCreateTruck />

        <View style={styles.form}>
          {/* Tipo */}
          <View style={{ zIndex: 1000 }}>
            <Text style={styles.label}>
              {t("truck_type")} <Text style={styles.required}>*</Text>
            </Text>
            <DropDownPicker
              open={openType}
              value={type}
              items={typeOptions}
              setOpen={setOpenType}
              setValue={setType}
              setItems={() => {}}
              placeholder={t("select_type")}
              placeholderStyle={{ color: "#9ca3af" }}
              style={[styles.input, { borderColor: errors.type ? "red" : "#0458AB" }]}
              listMode="SCROLLVIEW"
              dropDownContainerStyle={{ maxHeight: 200 }}
            />
          </View>

          {/* Categoría */}
          <View style={{ zIndex: 999 }}>
            <Text style={styles.label}>{t("category")}</Text>
            <DropDownPicker
              open={openCategory}
              value={category}
              items={categoryOptions}
              setOpen={setOpenCategory}
              setValue={setCategory}
              setItems={() => {}}
              placeholder={t("optional")}
              placeholderStyle={{ color: "#9ca3af" }}
              style={styles.input}
              listMode="SCROLLVIEW"
              dropDownContainerStyle={{ maxHeight: 200 }}
            />
          </View>

          {/* Nombre */}
          <Text style={styles.label}>
            {t("name")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.errorBorder]}
            placeholder={t("truck_name")}
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
          />

          {/* Número */}
          <Text style={styles.label}>
            {t("truck_number")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.number && styles.errorBorder]}
            placeholder={t("truck_number_placeholder")}
            placeholderTextColor="#ccc"
            keyboardType="default"
            value={number}
            onChangeText={setNumber}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => onClose()}
            >
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={confirmBeforeSave}
              disabled={loading}
            >
              <Text style={styles.saveText}>
                {loading ? t("saving") : t("save")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de Confirmación */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showConfirmModal}
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{t("truck_type")}: {type}</Text>
              <Text style={styles.modalText}>{t("category")}: {category || t("not_applicable")}</Text>
              <Text style={styles.modalText}>{t("name")}: {name}</Text>
              <Text style={styles.modalText}>{t("number")}: {number}</Text>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.cancelText}>{t("cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveText}>{loading ? "..." : t("ok")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <Toast />
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
