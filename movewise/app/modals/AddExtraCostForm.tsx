// app/screens/AddExtraCostForm.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { createExtraCostPayload } from '@/models/ModelExtraCost';


const AddExtraCostForm = () => {
  const navigation = useNavigation();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSave = async () => {
    if (!type || !description || !amount) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }

    try {
      await axios.post(`http://TU_BACKEND_API/orders/${orderId}/extra-costs`, {
        type,
        description,
        amount: parseFloat(amount),
      });

      navigation.goBack(); // Vuelve a ExtraCostScreen
    } catch (error) {
      console.error('Error saving extra cost:', error);
      Alert.alert('Error', 'Failed to save extra cost.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Extra Cost</Text>

      <Text style={styles.label}>Tipo</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="001101"
        keyboardType="default"
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Name"
      />

      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="0.0"
        keyboardType="numeric"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddExtraCostForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
    color: '#0053A4',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#0053A4',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: '#444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
