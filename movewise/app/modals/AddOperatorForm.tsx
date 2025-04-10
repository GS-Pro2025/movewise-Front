import { Modal, SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { getOperatorById } from '../../hooks/api/GetOperatorById';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { ToastAndroid, Platform } from 'react-native';
import { url, token } from '../../hooks/api/apiClient';
interface AddOperatorFormProps {
  visible: boolean;
  onClose: () => void;
  onAddOperator: (operator: string) => void; // ← Added this prop
  orderKey: string;
}

export default function AddOperatorForm({ visible, onClose, onAddOperator, orderKey }: AddOperatorFormProps) {
  if (!orderKey) {
    console.error('orderKey is required');
    return null;
  }

  //Notify message
  function notifyMessage(msg: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT)
    }
  }

  const [operatorId, setOperatorId] = useState('');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');
  const colorScheme = useColorScheme();
  let fetchedOperatorId: number | null = null; // Variable para almacenar el ID del operador

  const handleSearch = () => {
    if (operatorId.length > 0) {
      try {
        getOperatorById(Number(operatorId)).then(data => {
          if (data) {
            notifyMessage("Operador " + (data.person.name || data.person.last_name) + " encontrado ");
            setName(data.person.last_name || '');
            setCost(data.salary ? data.salary.toString() : ''); // Asegurando que el salary se establece correctamente
            fetchedOperatorId = data.person.id_operator; // Guardar el ID del operador
          } else {
            setName('');
            setCost('');
          }
        });
      } catch (error) {
        setName('');
        setCost('');
        console.error('Error fetching operator:', error);
      }
    } else {
      setName('');
      setCost('');
    }
  };

  const handleSubmit = async () => {
    if (name.trim() !== '' && fetchedOperatorId) {
      onAddOperator(name);

      // Validar que additionalCost sea un número válido
      const additionalCostValue = additionalCost.trim() !== ''
        ? parseFloat(additionalCost)
        : 0;

      if (isNaN(additionalCostValue)) {
        notifyMessage("El costo adicional debe ser un número válido");
        return;
      }

      // Preparar el cuerpo de la petición
      const requestBody = {
        operator: fetchedOperatorId,
        order: orderKey,
        assigned_at: new Date().toISOString(),
        rol: "operator",
        additional_costs: additionalCostValue
      };

      try {
        // Obtener el token directamente de AsyncStorage
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }

        // Hacer la petición directamente con fetch
        const response = await fetch(url + '/assigns/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        console.log(response);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error en la petición");
        }

        notifyMessage("Operador asignado exitosamente");

        // Limpiar el formulario
        setOperatorId('');
        setName('');
        setCost('');
        setAdditionalCost('');
        onClose();
      } catch (error) {
        console.error('Error asignando operador:', error);
        notifyMessage(error.message || "Error al asignar el operador");
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 19,
      borderRadius: 10,
      backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff',
    },
    header: {
      backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff',
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    textLarge: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#0458AB',
      marginTop: 16,
      marginBottom: 8,
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#0458AB',
      marginTop: 8,
    },
    input: {
      borderWidth: 2,
      borderColor: colorScheme === 'dark' ? '#64748b' : '#d1d5db',
      backgroundColor: colorScheme === 'dark' ? '#FFFFFF36' : '#ffffff',
      padding: 8,
      borderRadius: 8,
      color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    buttonCancel: {
      backgroundColor: colorScheme === 'dark' ? '#0458AB' : '#545257',
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
      marginRight: 8,
    },
    buttonSave: {
      backgroundColor: colorScheme === 'dark' ? '#FFFFFF' : '#0458AB',
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
    },
    buttonTextCancel: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    buttonTextSave: {
      color: colorScheme === 'dark' ? '#0458AB' : '#FFFFFF',
      fontWeight: 'bold',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#FFFFFF' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.header}>
            <Text style={styles.textLarge}>Add Operator</Text>
          </View>
          <Text style={[styles.text, { fontSize: 12, textAlign: 'center' }]}>Current order is: #<Text style={{ fontWeight: 'bold', color: colorScheme === 'dark' ? 'green' : '#0458AB' }}>{orderKey}</Text></Text>

          <ThemedView style={styles.container}>
            <Text style={styles.text}>Search Operator ID</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TextInput
                style={[styles.input, { flex: 0.8, marginRight: 8 }]}
                placeholder="Operator ID"
                placeholderTextColor="#9ca3af"
                value={operatorId}
                onChangeText={setOperatorId}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#FFFFFF' : '#0458AB',
                  height: 45,
                  flex: 0.2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                }}
                onPress={handleSearch}
              >
                <MaterialIcons
                  name="search"
                  size={22}
                  color={colorScheme === 'dark' ? '#0458AB' : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.text}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              editable={false}
            />

            <Text style={styles.text}>Cost (USD)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor="#9ca3af"
              value={cost}
              onChangeText={setCost}
              editable={false}
            />

            <Text style={styles.text}>Additional Cost (USD)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor="#9ca3af"
              value={additionalCost}
              onChangeText={setAdditionalCost}
              keyboardType="numeric"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                <Text style={styles.buttonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSave} onPress={handleSubmit}>
                <Text style={styles.buttonTextSave}>Add</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
