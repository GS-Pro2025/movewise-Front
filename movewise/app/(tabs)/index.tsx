import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';
import AddOrderForm from '../../components/AddOrderForm';

export default function App() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const colorScheme = useColorScheme();

 
    
  const styles = StyleSheet.create({
    header: {
      paddingTop: 50, // Baja el header un poco
      paddingBottom: 30, // Reduce espacio para que la línea suba
      borderBottomWidth: 2,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    image: {
      width: 30,
      height: 30,
      position: 'absolute',
      left: 10,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#FFFFFF' : '#0458AB', // Cambia el color según el tema
      marginBottom: -5, // Sube el título sin afectar padding
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -700,
      marginRight: 270,
    },
    button: {
      backgroundColor: '#0458AB',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      alignItems: 'center',
      marginTop: 20, // Asegura espacio entre botón y contenido
    },
    buttonText: {
      color: colorScheme === 'dark' ? '#FFFFFF' : '#FFFFFF', // Cambia el color según el tema
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  
  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#FFFFFF' }}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff' }]}>
        <Text style={styles.title}>OOOOOOOOOOOOOOO</Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Add Order</Text>
        </TouchableOpacity>
        <AddOrderForm visible={modalVisible} onClose={() => setModalVisible(false)} />
      </View>
    </View>
  );
}


