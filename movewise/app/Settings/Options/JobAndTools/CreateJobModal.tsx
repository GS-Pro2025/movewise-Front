import React, { useState, createContext, useContext } from "react";
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
import DropDownPicker from "react-native-dropdown-picker";
import Toast from "react-native-toast-message";
import { createJob, CreateJobModel } from "../../../../hooks/api/JobClient"; 
import { useTranslation } from "react-i18next";

// Contexto para la creación de trabajos
const CreateJobContext = createContext<{
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
} | undefined>(undefined);

export const CreateJobProvider = ({
  visible,
  onClose,
  onSuccess,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <CreateJobContext.Provider value={{ visible, onClose, onSuccess }}>
      {children}
    </CreateJobContext.Provider>
  );
};

export const useCreateJob = () => {
  const context = useContext(CreateJobContext);
  if (!context) {
    throw new Error("useCreateJob debe usarse dentro de un CreateJobProvider");
  }
  return context;
};

// Reemplaza el contenido de tu componente actual por este
const CreateJobModal = () => {
  const { visible, onClose, onSuccess } = useCreateJob()!;
  const navigation = useNavigation();
  const { t } = useTranslation(); // Importar el hook de traducción
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [errors, setErrors] = useState({
    name: false,
  });

  const validateFields = () => {
    const newErrors = {
      name: !name.trim(),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const confirmBeforeSave = () => {
    if (!validateFields()) return;
    setShowConfirmModal(true);
  };

  const handleSave = async () => {
    const newJob: CreateJobModel = {
      name: name,
    };

    setLoading(true);

    try {
      await createJob(newJob);
      setLoading(false);
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
          text1: t("job_created"), // Asegúrate de tener esta traducción
          text2: t("job_added"), // Asegúrate de tener esta traducción
        });
      }, 500);
    } catch (error) {
      console.error(t("job_creation_error"), error); // Asegúrate de tener esta traducción
      setLoading(false);
      setTimeout(() => {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("job_creation_error"),
        });
      }, 500);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{t("Create_job")}</Text>
            <View style={styles.divider} />
          </View>

        <View style={styles.form}>
          {/* Nombre del Job */}
          <Text style={styles.label}>
            {t("job_name")} <Text style={styles.required}>*</Text> 
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.errorBorder]}
            placeholder={t("job_name_placeholder")}
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
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
              <Text style={styles.modalText}>
                {t("job_name")}
                <Text style={{ fontWeight: "bold" }}> {name}</Text>
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

export default CreateJobModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 30,
  },
    headerContainer: {
    paddingTop: 20,
    backgroundColor: "#fff",
    marginTop: 32,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0458AB", // azul tipo Moviwise
    marginBottom: 8,
  },
  divider: {
    height: 2,
    backgroundColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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