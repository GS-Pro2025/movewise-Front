import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SearchParams, useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";

const AddExtraCostScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams.get("key"); // Recibe el parámetro key

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const handleAddExtraCost = async () => {
    try {
      const newWorkCost = { type: type, name: name, cost: value, id_order: key }; // Crea el nuevo WorkCost
      console.log("Adding ExtraCost:", newWorkCost);
  
      // Simula el guardado local (puedes llamar a una API aquí si es necesario)
      Alert.alert("Success", "Extra cost added successfully!");
  
      // Regresa a ExtraCostScreen y pasa el nuevo WorkCost como parámetro
      router.replace({
        pathname: "./ExtraCostScreen",
        params: { newWorkCost: JSON.stringify(newWorkCost), key },
      });
    } catch (err) {
      console.error("Error adding ExtraCost:", err);
      Alert.alert("Error", "Failed to add ExtraCost.");
    }
  };
  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Extra Cost</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Type</Text>
        <TextInput
          style={styles.input}
          placeholder="Snacks"
          placeholderTextColor="#A9A9A9"
          value={type}
          onChangeText={setType}
        />

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#A9A9A9"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="0.0"
          placeholderTextColor="#A9A9A9"
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleAddExtraCost}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#004080', textAlign: 'center',
        marginBottom: 10, marginTop: 20 },
  formContainer: { marginBottom: 20, marginTop: 20 },
  label: { fontSize: 14, color: '#004080', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#004080',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
    color: '#004080',
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  cancelButton: {
    backgroundColor: '#555555',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  saveButton: {
    backgroundColor: '#5AA2E7',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default AddExtraCostScreen;
