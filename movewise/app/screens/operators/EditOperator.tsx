import { Modal, SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

interface AddOperatorFormProps {
  visible: boolean;
  onClose: () => void;
  onAddOperator: (operator: string) => void; // ← Se agregó esta prop
}

export default function AddOperatorForm({ visible, onClose, onAddOperator }: AddOperatorFormProps) {
  const { t } = useTranslation();
  const [operatorId, setOperatorId] = useState('');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');
  const colorScheme = useColorScheme();

  const router = useRouter();

  const handleSubmit = () => {
    if (name.trim() !== '') {
      onAddOperator(name); // ← Se envía el nombre del operador a OperatorModal
      setOperatorId('');
      setName('');
      setCost('');
      setAdditionalCost('');
      onClose(); // Cierra el modal después de agregar
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
            <Text style={styles.textLarge}>{t('edit_operator')}</Text>
          </View>
  
          <ThemedView style={styles.container}>
            <Text style={styles.text}>{t('search_operator_id')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('operator_id')}
              placeholderTextColor="#9ca3af"
              value={operatorId}
              onChangeText={setOperatorId}
            />
  
            <Text style={styles.text}>{t('name')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('name_placeholder')}
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
  
            <Text style={styles.text}>{t('cost_usd')}</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor="#9ca3af"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
            />
  
            <Text style={styles.text}>{t('additional_cost_usd')}</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor="#9ca3af"
              value={additionalCost}
              onChangeText={setAdditionalCost}
              keyboardType="numeric"
            />
  
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.buttonCancel} onPress={() => router.back()}>
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
