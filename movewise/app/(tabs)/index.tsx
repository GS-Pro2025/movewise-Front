import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';
import AddOrderForm from '../../components/AddOrderForm';



export default function OrderScreen() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    header: {
      paddingTop: 50,
      paddingBottom: 30,
      borderBottomWidth: 2,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#FFFFFF' : '#0458AB',
      marginBottom: -5,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      backgroundColor: '#0458AB',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#FFFFFF' }}>
      <View style={[styles.header, { backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff' }]}>
        <Text style={styles.title}>Order Screen</Text>
      </View>



      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Add Order</Text>
        </TouchableOpacity>
        <AddOrderForm visible={modalVisible} onClose={() => setModalVisible(false)} />
      </View>
    </View>
  );
}
