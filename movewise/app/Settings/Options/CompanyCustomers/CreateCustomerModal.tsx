import React, { useState, createContext, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { CreateCustomerFactory } from "@/hooks/api/CustomerFactoryClient";

const CreateCustomerContext = createContext<{
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
} | undefined>(undefined);

export const CreateCustomerProvider = ({
  visible,
  onClose,
  onSuccess,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  children: React.ReactNode;
}) => (
  <CreateCustomerContext.Provider value={{ visible, onClose, onSuccess }}>
    {children}
  </CreateCustomerContext.Provider>
);

export const useCreateCustomer = () => {
  const context = useContext(CreateCustomerContext);
  if (!context) {
    throw new Error("useCreateCustomer debe usarse dentro de un CreateCustomerProvider");
  }
  return context;
};

const CreateCustomerModal = () => {
  const { visible, onClose, onSuccess } = useCreateCustomer();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState({ name: false });

  const validateFields = () => {
    const newErrors = { name: !name.trim() };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const confirmBeforeSave = () => {
    if (!validateFields()) return;
    setShowConfirmModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await CreateCustomerFactory({ name });
      setLoading(false);
      setShowConfirmModal(false);
      setTimeout(() => onClose(), 300);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: t("customer_created") || "Cliente creado",
          text2: t("customer_added") || "El cliente fue agregado correctamente",
        });
      }, 500);
    } catch (error) {
      setLoading(false);
      setTimeout(() => {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("customer_creation_error") || "No se pudo crear el cliente",
        });
      }, 500);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{t("create_customer") || "Crear Cliente"}</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>
            {t("customer_name") || "Nombre"} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.errorBorder]}
            placeholder={t("customer_name_placeholder") || "Nombre del cliente"}
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
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
              <Text style={styles.modalText}>
                {t("customer_name") || "Nombre"} <Text style={{ fontWeight: "bold" }}>{name}</Text>
              </Text>
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

export default CreateCustomerModal;

const styles = StyleSheet.create({
  // Puedes copiar los estilos de CreateJobModal aquí
  container: { flex: 1, backgroundColor: "#fff" },
  form: { paddingHorizontal: 16, paddingTop: 30 },
  headerContainer: { paddingTop: 20, backgroundColor: "#fff", marginTop: 32, },
  headerText: { fontSize: 18, fontWeight: "bold", textAlign: "center", color: "#0458AB", marginBottom: 8 },
  divider: { height: 2, backgroundColor: "#ccc", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  label: { fontSize: 14, color: "#0458AB", marginBottom: 4, marginTop: 12 },
  required: { color: "red" },
  input: { height: 48, borderWidth: 1.5, borderColor: "#0458AB", borderRadius: 8, paddingHorizontal: 12, backgroundColor: "#fff", fontSize: 16, marginBottom: 8 },
  errorBorder: { borderColor: "red" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  button: { width: "48%", height: 48, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cancelButton: { backgroundColor: "#3C3C3C" },
  cancelText: { color: "#fff", fontWeight: "bold" },
  saveButton: { backgroundColor: "#79B6EC" },
  saveText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "#0458AB", padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalText: { color: "#fff", fontSize: 16, marginBottom: 4 },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
});