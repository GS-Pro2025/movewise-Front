import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, useColorScheme} from "react-native";
import { useTranslation } from "react-i18next";
import { CreateTruck } from "@/hooks/api/TruckClient";
import Toast from "react-native-toast-message";
import colors from "@/app/Colors";
interface CreateTruckModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTruckModal: React.FC<CreateTruckModalProps> = ({ visible, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';
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
      <View style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
          <Text style={[styles.title, { color: isDarkMode ? colors.textDark : colors.lightText }]}>{t('create_truck')}</Text>
          <ScrollView>
            <View style={styles.formContainer}>
              <TextInput
                style={[styles.input, { borderColor: isDarkMode ? colors.primary : colors.primary, color: isDarkMode ? colors.textDark : colors.lightText }]}
                placeholder={t('name')}
                placeholderTextColor={isDarkMode ? colors.textDark : colors.lightText}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <TextInput
                style={[styles.input, { borderColor: isDarkMode ? colors.primary : colors.primary, color: isDarkMode ? colors.textDark : colors.lightText }]}
                placeholder={t('truck_number')}
                placeholderTextColor={isDarkMode ? colors.textDark : colors.lightText}
                value={formData.number_truck}
                onChangeText={(text) => setFormData({ ...formData, number_truck: text })}
              />
              <TextInput
                style={[styles.input, { borderColor: isDarkMode ? colors.primary : colors.primary, color: isDarkMode ? colors.textDark : colors.lightText }]}
                placeholder={t('category')}
                placeholderTextColor={isDarkMode ? colors.textDark : colors.lightText}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
              />
              <TextInput
                style={[styles.input, { borderColor: isDarkMode ? colors.primary : colors.primary, color: isDarkMode ? colors.textDark : colors.lightText }]}
                placeholder={t('type')}
                placeholderTextColor={isDarkMode ? colors.textDark : colors.lightText}
                value={formData.type}
                onChangeText={(text) => setFormData({ ...formData, type: text })}
              />
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.swipeDelete }]} onPress={onClose}>
              <Text style={[styles.cancelButtonText, { color: colors.lightBackground }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.secondary }]} onPress={handleSubmit}>
              <Text style={[styles.submitButtonText, { color: colors.lightBackground }]}>{t('create')}</Text>
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
  },
  input: {
    borderWidth: 1,
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
