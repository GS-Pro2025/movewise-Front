// app/screens/ExtraCostScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

interface ExtraCost {
  id: number;
  description: string;
  amount: number;
}

const ExtraCostScreen = () => {
  const navigation = useNavigation();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [extraCosts, setExtraCosts] = useState<ExtraCost[]>([]);

  const fetchExtraCosts = async () => {
    try {
      const response = await axios.get(`http:///orders/${orderId}/extra-costs`);
      setExtraCosts(response.data);
    } catch (error) {
      console.error('Error fetching extra costs:', error);
      Alert.alert('Error', 'Could not load extra costs');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExtraCosts();
    }, [orderId])
  );

  const handleAddCost = () => {
    navigation.navigate('modals/AddExtraCostForm' as never, { orderId } as never);
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Extra Cost</Text>
        <TouchableOpacity onPress={handleAddCost}>
          <Ionicons name="add-circle-outline" size={30} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={extraCosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.costItem}>
            <Ionicons name="cash-outline" size={24} color="#0053A4" />
            <Text style={styles.costText}>
              {item.description || 'Extra cost'} {item.amount.toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No extra costs yet.</Text>}
      />

      {/* Opcional: botones al final */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExtraCostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0053A4',
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    marginBottom: 8,
  },
  costText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
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
