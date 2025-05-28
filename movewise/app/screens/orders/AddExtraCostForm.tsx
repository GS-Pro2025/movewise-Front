import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme } from "react-native";
import { SearchParams, useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';

const AddExtraCostScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams.get("key"); // Recibe el parámetro key

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const handleAddExtraCost = async () => {
    try {
      const newWorkCost = { type: type, name: name, cost: value, id_order: key }; // Crea el nuevo WorkCost
      // console.log(t("adding_extra_cost"), newWorkCost);

      // Simula el guardado local (puedes llamar a una API aquí si es necesario)
      Alert.alert(t("success"), t("extra_cost_added"));

      // Regresa a ExtraCostScreen y pasa el nuevo WorkCost como parámetro
      router.replace({
        pathname: "./ExtraCostScreen",
        params: { newWorkCost: JSON.stringify(newWorkCost), key },
      });
    } catch (err) {
      console.error(t("error_adding_extra_cost"), err);
      Alert.alert(t("error"), t("failed_to_add_extra_cost"));
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? colors.header : colors.lightBackground }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="#004080" />
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
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>{t("cancel_button")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleAddExtraCost}>
          <Text style={styles.saveButtonText}>{t("save_button")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const isDarkMode = useColorScheme() === 'dark';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 20 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 40,
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
  },
  formContainer: { marginBottom: 20, marginTop: 20 },
  label: { fontSize: 14, color: "#004080", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#004080",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
    color: "#004080",
  },
  buttonContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
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

export default AddExtraCostScreen;