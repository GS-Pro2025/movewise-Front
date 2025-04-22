// app/screens/WorkDailyScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Order {
  id: number;
  reference: string;
  customerName: string;
}

const WorkDailyScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrderPress = (orderId: number) => {
    navigation.navigate('ExtraCostScreen' as never, { orderId } as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Work Daily</Text>
      <Text style={styles.selectDate}>Select Date</Text>
      {/* Aquí podrías agregar un selector de fecha */}
      
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderItem} onPress={() => handleOrderPress(item.id)}>
            <Ionicons name="cube-outline" size={24} color="#0053A4" />
            <Text style={styles.orderText}>
              {item.reference} - Name {item.customerName}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default WorkDailyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 12,
    color: '#0053A4',
  },
  selectDate: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0053A4',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
    padding: 12,
    backgroundColor: '#F0F4FF',
    borderRadius: 10,
  },
  orderText: {
    fontSize: 16,
    color: '#333',
  },
});
