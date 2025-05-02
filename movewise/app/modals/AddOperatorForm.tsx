import { Modal, SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { getOperatorByNumberId } from '../../hooks/api/GetOperatorByNumberId';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { ToastAndroid, Platform } from 'react-native';
import { token } from '@/hooks/api/apiClient';
import { url } from '../../hooks/api/apiClient';
import { useTranslation } from 'react-i18next';

interface Operator {
  id_operator: number;
  first_name: string;
  role?: string;
  additionalCosts?: number;
  truckId?: number;
}

interface AddOperatorFormProps {
  visible: boolean;
  onClose: () => void;
  onAddOperator?: (operator: Operator) => void;
  orderKey: string;
}

export default function AddOperatorForm({ visible, onClose, onAddOperator, orderKey }: AddOperatorFormProps) {
  const { t } = useTranslation();

  if (!orderKey) {
    console.error('orderKey is required');
    return null;
  }

  // Notify message
  function notifyMessage(msg: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT)
    }
  }

  const [operatorId, setOperatorId] = useState('');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');
  const [fetchedOperatorId, setFetchedOperatorId] = useState<number | null>(null); // Now properly managed as state
  const colorScheme = useColorScheme();

  const handleSearch = () => {
    if (operatorId.length > 0) {
      try {
        console.log("Buscando operador con ID:", operatorId);
        getOperatorByNumberId(Number(operatorId)).then(data => {
          if (data) {
            console.log("Datos recibidos:", data);
            notifyMessage(`${t('operator')} ${data.first_name} ${data.last_name} ${t('found')}`);

            // Actualiza estos accesos
            setName(`${data.first_name} ${data.last_name}`);
            setCost(data.salary ? data.salary.toString() : '');
            console.log("Id del operador en la empresa:", data.id_number);
            console.log("Id del operador en la API:", data.id_operator);  
            setFetchedOperatorId(data.id_operator); // Usar id_operator directo
          } else {
            resetForm();
          }
        });
      } catch (error) {
        resetForm();
        console.error('Error fetching operator:', error);
      }
    } else {
      resetForm();
    }
  };

  // Función auxiliar para resetear el formulario
  const resetForm = () => {
    setName('');
    setCost('');
    setFetchedOperatorId(null);
  };

  const handleSubmit = () => {
    console.log("Submitting operator data: ",fetchedOperatorId)
    if (!fetchedOperatorId) {
      notifyMessage("Busque un operador válido primero");
      return;
    }

    const newOperator: Operator = {
      id_operator: fetchedOperatorId,
      first_name: name.split(' ')[0],
      role: "operator", // Valor por defecto
      additionalCosts: additionalCost.trim() !== '' ? parseFloat(additionalCost) : 0,
    };

    if (onAddOperator) {
      onAddOperator(newOperator);
    }

    // Limpiar formulario
    setOperatorId('');
    setName('');
    setCost('');
    setAdditionalCost('');
    setFetchedOperatorId(null);
    onClose();
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
            <Text style={styles.textLarge}>{t('add_operator')}</Text>
          </View>
          <Text style={[styles.text, { fontSize: 12, textAlign: 'center' }]}>
            {t("current_order")} #
            <Text style={{ fontWeight: 'bold', color: colorScheme === 'dark' ? 'green' : '#0458AB' }}>{orderKey}</Text></Text>

          <ThemedView style={styles.container}>
            <Text style={styles.text}>{t("search_operator_id")}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TextInput
                style={[styles.input, { flex: 0.8, marginRight: 8 }]}
                placeholder={t('operator_id_placeholder')}
                placeholderTextColor="#9ca3af"
                value={operatorId}
                onChangeText={setOperatorId}
                keyboardType="numeric"
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

            <Text style={styles.text}>{t('name')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('name_placeholder')}
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              editable={false}
            />
            <Text style={styles.text}>{t('cost')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('cost_placeholder')}
              placeholderTextColor="#9ca3af"
              value={cost}
              onChangeText={setCost}
              editable={false}
            />
            <Text style={styles.text}>
              {t('additional_cost')}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t('additional_cost_placeholder')}
              placeholderTextColor="#9ca3af"
              value={additionalCost}
              onChangeText={setAdditionalCost}
              keyboardType="numeric"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                <Text style={styles.buttonTextCancel}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSave} onPress={handleSubmit}>
                <Text style={styles.buttonTextSave}>{t('add')}</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}