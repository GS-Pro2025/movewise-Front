import React, { useState } from 'react';
import { Image, useColorScheme, Modal } from 'react-native';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

    interface OperatorData {
    id: string;
    name: string;
    Number: string;
    Category: string;
    Type: string;
    }

interface AddOperatorScreenProps { 
  visible: boolean;
  onClose: () => void;
}

const TruckModal: React.FC<AddOperatorScreenProps> = ({ visible, onClose }) => {
  const [operatorData, setOperatorData] = useState<OperatorData>({
    id: '',
    name: '',
    Number: '',
    Category: '',
    Type: '',
  });

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF',
      padding: 16,
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
      marginBottom: 16,
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

  const handleSave = () => {
    console.log('Saving operator data:', operatorData);
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
          <Text style={styles.headerTitle}>Add Truck</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <Text style={styles.searchLabel}>Search Truck Id</Text>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={operatorData.id}
            placeholder="000101"
            placeholderTextColor={isDarkMode ? '#a0a0a0' : '#606060'}
            onChangeText={(text) => setOperatorData({ ...operatorData, id: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Image 
              source={require('../../assets/images/search.png')} 
              style={[styles.searchIcon, { tintColor: isDarkMode ? '#9ca3af' : '#0458AB' }]}
            />
          </TouchableOpacity>
        </View>

        {/* Other inputs */}
        {['Name', 'Number', 'Category', 'Type'].map((field) => (
          <View key={field}>
            <Text style={styles.inputLabel}>{field}</Text>
            <TextInput
              style={styles.input}
              placeholder={field}
              placeholderTextColor={isDarkMode ? '#a0a0a0' : '#606060'}
              value={operatorData[field.toLowerCase() as keyof OperatorData]}
              onChangeText={(text) => setOperatorData({ ...operatorData, [field.toLowerCase()]: text })}
              keyboardType={field === 'Number' || field === 'Category' || field === 'Type' ? 'numeric' : 'default'}
            />
          </View>
        ))}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default TruckModal;
