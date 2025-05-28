import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { CreateTruck } from "@/hooks/api/TruckClient";
import Toast from "react-native-toast-message";

interface CreateTruckModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTruckModal: React.FC<CreateTruckModalProps> = ({ visible, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    number_truck: "",
    category: "",
    type: "",
  });

  const handleSubmit = async () => {
    try {
      await CreateTruck(formData);
      Toast.show({
        type: "success",
        text1: t("Truck created successfully"),
      });
      onSuccess();
      onClose();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("Error creating truck"),
      });
    }
  };

  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{t('create_truck')}</Text>
          <ScrollView>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('name')}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder={t('truck_number')}
                value={formData.number_truck}
                onChangeText={(text) => setFormData({ ...formData, number_truck: text })}
              />
              <TextInput
                style={styles.input}
                placeholder={t('category')}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
              />
              <TextInput
                style={styles.input}
                placeholder={t('type')}
                value={formData.type}
                onChangeText={(text) => setFormData({ ...formData, type: text })}
              />
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{t('create')}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default CreateTruckModal;
