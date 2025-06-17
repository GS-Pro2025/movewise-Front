import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';

interface AddExtraCostFormProps {
  orderKey: string;
  onSave: (newCost: any) => void;
  onClose: () => void;
}

const AddExtraCostForm = ({ orderKey, onSave, onClose }: AddExtraCostFormProps) => {
  const { t } = useTranslation();
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      paddingHorizontal: 20,
      paddingTop: 20,
      backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 20,
      paddingTop: 20,
      marginTop: 40,
      backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground
    },
    backButton: {
      padding: 10,
      marginRight: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      flex: 1,
      textAlign: "center",
      color: isDarkMode ? colors.textDark : colors.lightText
    },
    formContainer: { 
      marginBottom: 20, 
      marginTop: 20 
    },
    label: { 
      fontSize: 14, 
      color: isDarkMode ? colors.textDark : colors.lightText, 
      marginBottom: 5 
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? colors.primary : colors.primary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginBottom: 15,
      fontSize: 16,
      color: isDarkMode ? colors.lightText : colors.darkText,
      backgroundColor: isDarkMode ? colors.darkBackground : colors.white
    },
    buttonContainer: { 
      flexDirection: "row", 
      justifyContent: "space-around", 
      marginTop: 20 
    },
    cancelButton: {
      backgroundColor: isDarkMode ? colors.swipeDelete : colors.secondary,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
    },
    cancelButtonText: { 
      color: colors.lightBackground, 
      fontSize: 16, 
      fontWeight: "600" 
    },
    saveButton: {
      backgroundColor: isDarkMode ? colors.secondary : colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
    },
    saveButtonText: { 
      color: colors.lightBackground, 
      fontSize: 16, 
      fontWeight: "600" 
    },
  });

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExtraCost = async () => {
    if (!type || !name || !cost) {
      Alert.alert(t("error"), t("all_fields_required"));
      return;
    }

    setIsSubmitting(true);
    try {
      const newWorkCost = { 
        type, 
        name, 
        cost: parseFloat(cost), 
        id_order: orderKey 
      };
      
      await onSave(newWorkCost);
      
      // Reset form
      setType("");
      setName("");
      setCost("");
    } catch (err) {
      console.error(t("error_adding_extra_cost"), err);
      Alert.alert(t("error"), t("failed_to_add_extra_cost"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={isDarkMode ? colors.textDark : colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("add_extra_cost_title")}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>{t("type_label")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("type_placeholder")}
          placeholderTextColor="#A9A9A9"
          value={type}
          onChangeText={setType}
        />

        <Text style={styles.label}>{t("name")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("name_placeholder")}
          placeholderTextColor="#A9A9A9"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>{t("value_label")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("value_placeholder")}
          placeholderTextColor="#A9A9A9"
          value={cost}
          onChangeText={setCost}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>{t("cancel_button")}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, { 
            backgroundColor: isSubmitting ? colors.lightText : colors.primary,
            opacity: isSubmitting ? 0.7 : 1
          }]}
          onPress={handleAddExtraCost}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? t("saving") : t("save")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddExtraCostForm;