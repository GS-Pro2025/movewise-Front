import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  Modal,
  useColorScheme as _useColorScheme,
  Appearance,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Custom hook for theme management (simplified without toggle)
const useColorScheme = () => {
  const deviceTheme = _useColorScheme();
  const [theme, setTheme] = useState(deviceTheme || 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) setTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  return { theme };
};

interface Operator {
  id: string;
  name: string;
  role: string | null;
}

type RoleType = 'Driver' | 'Team leader';

const OperatorsScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const { theme } = useColorScheme();
  
  const operators: Operator[] = [
    { id: '1', name: 'Name Operator 1', role: null },
    { id: '2', name: 'Name Operator 2', role: null },
    { id: '3', name: 'Name Operator 3', role: null },
    { id: '4', name: 'Name Operator 4', role: null },
    { id: '5', name: 'Name Operator 5', role: null },
  ];

  const handleOperatorPress = (operator: Operator) => {
    setSelectedOperator(operator);
    setModalVisible(true);
  };

  const assignRole = (role: RoleType) => {
    if (selectedOperator) {
      console.log(`Assigned ${role} to ${selectedOperator.name}`);
    }
    setModalVisible(false);
  };

  const renderOperator = ({ item }: { item: Operator }) => (
    <TouchableOpacity 
      style={[styles.operatorItem, theme === 'dark' && styles.operatorItemDark]}
      onPress={() => handleOperatorPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Ionicons name="person" size={24} color="#fff" />
      </View>
      <Text style={[styles.operatorName, theme === 'dark' && styles.textDark]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, theme === 'dark' && styles.containerDark]}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
      <View style={[styles.header, theme === 'dark' && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../assets/images/LOGOPNG.png')} 
            style={[
              styles.userIcono, 
              { tintColor: theme === 'dark' ? '#FFFFFF' : '#112A4A' } //ocuro & claro  
            ]} 
          />
          <Text style={[styles.headerTitle, theme === 'dark' && styles.textDark]}>
            Operators
          </Text>
        </View>
        <TouchableOpacity style={[styles.addButton, theme === 'dark' && styles.addButtonDark]}>
          <Ionicons 
            name="add-circle-outline" 
            size={24} 
            color={theme === 'dark' ? "#FFFFFF" : "#112A4A"} 
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.listContainer, theme === 'dark' && styles.containerDark]}>
        <FlatList
          data={operators}
          renderItem={renderOperator}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, theme === 'dark' && styles.modalContentDark]}>
            <View style={[styles.modalHeader, theme === 'dark' && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, theme === 'dark' && styles.textDark]}>
                {selectedOperator ? selectedOperator.name : 'Name Operator'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={theme === 'dark' ? "#FFFFFF" : "#112A4A"} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.roleButtonsContainer}>
              <TouchableOpacity 
                style={[styles.roleButton, theme === 'dark' && styles.roleButtonDark]}
                onPress={() => assignRole('Driver')}
              >
                <Text style={styles.roleButtonText}>Driver</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, theme === 'dark' && styles.roleButtonDark]}
                onPress={() => assignRole('Team leader')}
              >
                <Text style={styles.roleButtonText}>Team leader</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#112A4A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerDark: {
    backgroundColor: '#112A4A',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#112A4A',
    marginLeft: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDark: {
    backgroundColor: '#1E3A5F',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  list: {
    paddingVertical: 8,
  },
  operatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 42, 74, 0.2)',
  },
  operatorItemDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#112A4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  operatorName: {
    fontSize: 16,
    color: '#112A4A',
  },
  textDark: {
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalContentDark: {
    backgroundColor: '#112A4A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalHeaderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#112A4A',
  },
  closeButton: {
    padding: 4,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  roleButton: {
    backgroundColor: '#112A4A',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  roleButtonDark: {
    backgroundColor: '#1E3A5F',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userIcono: {
    width: 38,  
    height: 38, 
    borderRadius: 20, 
  }
});

export default OperatorsScreen;