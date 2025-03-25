import React, { useState } from 'react';
import { Image, useColorScheme } from 'react-native';
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

  const colorScheme = useColorScheme(); // Detecta el modo del sistema
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    topSafeArea: {
      flex: 0,
      backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF',
    },
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF',
      padding: 16,
    },
    header: {
      backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal:16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#0458AB',
      textAlign: 'center',
      flex:1,
      paddingRight:40,
    },
    searchLabel: {
      fontSize: 16,
      color: isDarkMode ? 'white' : '#0458AB',
      marginBottom: 8,
      paddingTop:30,
      paddingLeft:10,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#ffffff36' : 'white',
      borderRadius: 13,
      borderColor: isDarkMode ? '#9ca3af' : '#0458AB',
      borderWidth: 2,
      width: '90%', // Reduce el ancho al 80% del contenedor
    alignSelf: 'center', // Centra los inputs en la pantalla
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
      marginBottom: 4,
      paddingLeft:10,
      paddingRight:10,
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
      width: '90%', // Reduce el ancho al 80% del contenedor
      alignSelf: 'center', // Centra los inputs en la pantalla
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding:50,
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
    },GeneralData:{
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#0458AB',
      padding:10,
      paddingTop:20,
      paddingBottom:20,
    },avatarContainer:{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#0052A5',
    },userIcono:{
      width: 40,  
    height: 40, 
    paddingRight:0, 
      
    }, searchIcon: {
      width: 24,
      height: 24,
    },searchButton: {
      padding: 12,
    }

  });

  const handleSave = () => {
    console.log('Saving operator data:', operatorData);
  };

  const handleCancel = () => {
    console.log('Operation cancelled');
  };

  return (
    <>
      <SafeAreaView style={styles.topSafeArea} />
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={isDarkMode ? '#112A4A' : '#0458AB'} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        
        <View style={styles.header}>
  <Image 
    source={require('../assets/images/LOGOPNG.png')} 
    style={[styles.userIcono, { tintColor: isDarkMode ? '#ffffff' : '#0458AB' }]} 
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
        <Text style={styles.GeneralData}>General Data Operator</Text>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={isDarkMode ? '#a0a0a0' : '#606060'}
          value={operatorData.name}
          onChangeText={(text) => setOperatorData({ ...operatorData, name: text })}
        />
        <Text style={styles.inputLabel}>Cost (USD)</Text>
        <TextInput
          style={styles.input}
          value={operatorData.cost}
          placeholder="0.0"
          placeholderTextColor={isDarkMode ? '#a0a0a0' : '#606060'}
          onChangeText={(text) => setOperatorData({ ...operatorData, cost: text })}
          keyboardType="numeric"
        />
        <Text style={styles.inputLabel}>Additional Cost (USD)</Text>
        <TextInput
          style={styles.input}
          value={operatorData.additionalCost}
          placeholder="0.0"
          placeholderTextColor={isDarkMode ? '#a0a0a0' : '#606060'}
          onChangeText={(text) => setOperatorData({ ...operatorData, additionalCost: text })}
          keyboardType="numeric"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

export default AddOperatorScreen;
