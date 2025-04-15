import React, { useState, useEffect } from 'react';
import { Image, useColorScheme, Modal } from 'react-native';
import { getTruckById } from '@/hooks/api/GetTruckById';
import Toast from 'react-native-toast-message';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface TruckData {
  id: number;
  name: string;
  number: string;
  category: string;
  type: string;
}

interface AddOperatorScreenProps {
  visible: boolean;
  onClose: () => void;
  orderKey: string;
}

const TruckModal: React.FC<AddOperatorScreenProps> = ({ visible, onClose, orderKey }) => {
  if (!orderKey) {
    return null;
  }

  const [TruckData, setTruckData] = useState<TruckData>({
    id: 0,
    name: '',
    number: '',
    category: '',
    type: '',
  });

  // Agrega un useEffect para resetear el estado
  useEffect(() => {
    if (visible) {
      setTruckData({
        id: 0,
        name: '',
        number: '',
        category: '',
        type: '',
      });
    }
  }, [visible]);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF',
      padding: 16,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      marginTop: 'auto'
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#0458AB',
      textAlign: 'center',
      flex: 1,
      paddingRight: 40,
    },
    closeButton: {
      padding: 10,
    },
    closeButtonText: {
      fontSize: 18,
      color: isDarkMode ? '#ffffff' : '#0458AB',
    },
    searchLabel: {
      fontSize: 16,
      color: isDarkMode ? 'white' : '#0458AB',
      marginBottom: 8,
      paddingTop: 30,
      paddingLeft: 10,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#ffffff36' : 'white',
      borderRadius: 13,
      borderColor: isDarkMode ? '#9ca3af' : '#0458AB',
      borderWidth: 2,
      width: '95%',
      alignSelf: 'center',
      height: 45,
    },
    searchInput: {
      flex: 1,
      height: 50,
      paddingHorizontal: 16,
      fontSize: 16,
      color: isDarkMode ? '#112A4A' : 'black',
    },
    inputLabel: {
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#0458AB',
      marginTop: 5,
      paddingLeft: 10,
    },
    input: {
      backgroundColor: isDarkMode ? '#ffffff36' : 'white',
      borderRadius: 13,
      height: 47,
      paddingHorizontal: 12,
      fontSize: 16,
      marginBottom: 0,
      borderColor: isDarkMode ? '#9ca3af' : '#0458AB',
      borderWidth: 2,
      color: isDarkMode ? 'white' : 'black',
      width: '95%',
      alignSelf: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 50,
    },
    cancelButton: {
      backgroundColor: isDarkMode ? '#0458AB' : '#545257',
      borderRadius: 14,
      paddingVertical: 10,
      width: '45%',
      alignItems: 'center',
    },
    cancelButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    saveButton: {
      backgroundColor: isDarkMode ? '#ffffff' : '#0458AB',
      borderRadius: 14,
      paddingVertical: 10,
      width: '45%',
      alignItems: 'center',
    },
    saveButtonText: {
      color: isDarkMode ? '#112A4A' : '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    searchIcon: {
      width: 24,
      height: 24,
    },
    searchButton: {
      padding: 12,
    },
  });

  const handleSearch = async () => {
    const truckData = await getTruckById(TruckData.id);
    if (truckData) {
      setTruckData({
        id: truckData.id_truck, 
        name: truckData.name,
        number: truckData.number_truck,
        category: truckData.category,
        type: truckData.type,
      });
    } else {
      setTruckData({
        id: 0, // Campo vacío
        name: '', // Campo vacío
        number: '', // Campo vacío
        category: '', // Campo vacío
        type: '', // Campo vacío
      });
      Toast.show({
        text1: "Error: " + (truckData?.sms || "truck not found"),
        type: 'error',
      });
    }
  };

  const handleSave = () => {
    console.log('Saving operator data:', TruckData);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar backgroundColor={isDarkMode ? '#112A4A' : '#0458AB'} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/LOGOPNG.png')}
            style={{ width: 40, height: 40, tintColor: isDarkMode ? '#ffffff' : '#0458AB' }}
          />
          <Text style={styles.headerTitle}>Agregar Camión</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <Text style={styles.searchLabel}>Search Truck Id</Text>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={TruckData.id.toString()}
            placeholder="000101"
            placeholderTextColor={isDarkMode ? '#a0a0a0' : '#606060'}
            onChangeText={(text) => {
              const numericValue = text.trim() === "" ? 0 : parseInt(text, 10) || 0;
              setTruckData({ ...TruckData, id: numericValue });
            }}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Image
              source={require('../../assets/images/search.png')}
              style={[styles.searchIcon, { tintColor: isDarkMode ? '#9ca3af' : '#0458AB' }]}
            />
          </TouchableOpacity>
        </View>

        {/* Other inputs */}
        {['name', 'number', 'category', 'type'].map((field) => (
          <View key={field}>
            <Text style={styles.inputLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
            <TextInput
              style={styles.input}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              placeholderTextColor={isDarkMode ? '#a0a0a0' : '#606060'}
              value={TruckData[field as keyof TruckData]}
              onChangeText={(text) => setTruckData({ ...TruckData, [field]: text })}
              keyboardType={field === 'number' || field === 'category' || field === 'type' ? 'numeric' : 'default'}
            />
          </View>
        ))}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default TruckModal;
