import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, useColorScheme, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { CreateTruck } from "@/hooks/api/TruckClient";
import Toast from "react-native-toast-message";
import colors from "@/app/Colors";
import DropDownPicker from "react-native-dropdown-picker";

interface CreateTruckModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTruckModal: React.FC<CreateTruckModalProps> = ({ visible, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';

  // Dropdown states
  const [type, setType] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [openType, setOpenType] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [number_truck, setNumberTruck] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    type: false,
    name: false,
    number_truck: false,
  });

  const typeOptions = [
    { label: t("rented"), value: "rented" },
    { label: t("owned"), value: "owned" }
  ];

  const categoryOptions = [
    { label: t("vans"), value: "vans" },
    { label: t("Truck_26"), value: "truck_26" },
    { label: t("Trailer"), value: "trailer" },
  ];

  const validateFields = () => {
    const newErrors = {
      type: !type,
      name: !name.trim(),
      number_truck: !number_truck.trim(),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      await CreateTruck({
        name,
        number_truck,
        category: category || "",
        type: type || "",
      });
      Toast.show({
        type: "success",
        text1: t("truck_created"),
        text2: t("truck_added"),
      });
      setLoading(false);
      onSuccess();
      onClose();
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("truck_creation_error"),
      });
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
          <Text style={[styles.title, { color: isDarkMode ? colors.textDark : colors.lightText }]}>{t('create_truck')}</Text>
          <ScrollView>
            <View style={styles.formContainer}>
              {/* Tipo */}
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
                style={[styles.input, { borderColor: errors.type ? "red" : colors.primary }]}
                listMode="SCROLLVIEW"
                dropDownContainerStyle={{ maxHeight: 200 }}
                zIndex={1000}
              />

              {/* Categoría */}
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
                zIndex={999}
              />

              {/* Nombre */}
              <Text style={styles.label}>
                {t("name")} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.errorBorder]}
                placeholder={t('name')}
                placeholderTextColor={isDarkMode ? colors.textDark : colors.lightText}
                value={name}
                onChangeText={setName}
              />

              {/* Número */}
              <Text style={styles.label}>
                {t("truck_number")} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.number_truck && styles.errorBorder]}
                placeholder={t('truck_number')}
                placeholderTextColor={isDarkMode ? colors.textDark : colors.lightText}
                value={number_truck}
                onChangeText={setNumberTruck}
              />
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.swipeDelete }]} onPress={onClose}>
              <Text style={[styles.cancelButtonText, { color: colors.lightBackground }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.secondary }]} onPress={handleSubmit} disabled={loading}>
              <Text style={[styles.submitButtonText, { color: colors.lightBackground }]}>
                {loading ? t("saving") : t('create')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  title: {
    fontSize: 20,
    width: '100%',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
    zIndex: 1000,
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
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  errorBorder: {
    borderColor: "red",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  submitButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default CreateTruckModal;
