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
  cost: string;
  additionalCost: string;
}

const AddOperatorScreen: React.FC = () => {
  const [operatorData, setOperatorData] = useState<OperatorData>({
    id: '',
    name: '',
    cost: '',
    additionalCost: '',
  });

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
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
      borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#0458AB',
      textAlign: 'center',
      flex: 1,
      paddingRight: 40,
    },
    inputLabel: {
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#0458AB',
      marginBottom: 0,
      paddingLeft: 10,
      paddingRight: 10,
      padding:10,
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
      width: '90%',
      alignSelf: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
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
      width: '90%',
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
    searchIcon: {
      width: 24,
      height: 24,
    },
    searchButton: {
      padding: 12,
    }
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <SafeAreaView style={styles.container}>
          <StatusBar backgroundColor={isDarkMode ? '#112A4A' : '#0458AB'} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          
          <View style={styles.header}>
            <Image 
              source={require('../assets/images/LOGOPNG.png')} 
              style={{ width: 40, height: 40, tintColor: isDarkMode ? '#ffffff' : '#0458AB' }} 
            />
            <Text style={styles.headerTitle}>Add Operator</Text>
          </View>

          <Text style={styles.searchLabel}>Search Operator ID</Text>
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
                source={require('../assets/images/search.png')} 
                style={[styles.searchIcon, { tintColor: isDarkMode ? '#9ca3af' : '#0458AB' }]}
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Operator Name</Text>
          <TextInput
            style={styles.input}
            value={operatorData.name}
            placeholder="Enter name"
            onChangeText={(text) => setOperatorData({ ...operatorData, name: text })}
          />

          <Text style={styles.inputLabel}>Cost</Text>
          <TextInput
            style={styles.input}
            value={operatorData.cost}
            placeholder="Enter cost"
            onChangeText={(text) => setOperatorData({ ...operatorData, cost: text })}
          />

          <Text style={styles.inputLabel}>Additional Cost</Text>
          <TextInput
            style={styles.input}
            value={operatorData.additionalCost}
            placeholder="Enter additional cost"
            onChangeText={(text) => setOperatorData({ ...operatorData, additionalCost: text })}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </Modal>
  );
};

export default AddOperatorScreen;
