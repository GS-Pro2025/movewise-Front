import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, FlatList, TextInput, ActivityIndicator, RefreshControl, Alert, SafeAreaView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { TouchableHighlight } from "react-native";
import { ListTruck, DeleteTruck } from "../hooks/api/TruckClient"; // Import TruckClient methods
import CreateTruckScreen from "../app/modals/CreateTruck"; // Updated import for CreateTruck
import UpdateTruckModal from "../app/modals/UpdateTruckModal"; // Component for updating a truck
import CreateTruckModal from "../app/modals/CreateTruck";

interface Truck {
  id: string;
  licensePlate: string;
  model: string;
  capacity: string;
  status: string;
}

interface ListTruckModalProps {
  visible: boolean;
  onClose: () => void;
}

const ListTruckModal: React.FC<ListTruckModalProps> = ({ visible, onClose }) => {
  const [addTruckVisible, setAddTruckVisible] = useState(false);
  const [updateTruckVisible, setUpdateTruckVisible] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const loadTrucks = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await ListTruck();
      setTrucks(response.data || []);
    } catch (error) {
      console.error("Error loading trucks:", error);
      Alert.alert("Error", "Could not load trucks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadTrucks();
    }
  }, [visible, loadTrucks]);

  const onRefresh = useCallback(() => {
    loadTrucks();
  }, [loadTrucks]);

  const filteredTrucks = trucks.filter(truck => {
    const licensePlate = truck.licensePlate || ''; // Fallback to an empty string if undefined
    const model = truck.model || ''; // Fallback to an empty string if undefined
  
    return (
      licensePlate.toLowerCase().includes(searchText.toLowerCase()) ||
      model.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleEditTruck = (truck: Truck) => {
    setSelectedTruck(truck);
    setUpdateTruckVisible(true);
  };

  const handleDeleteTruck = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this truck?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await DeleteTruck(id);
              setTrucks(prev => prev.filter(truck => truck.id !== id));
            } catch (error) {
              console.error("Error deleting truck:", error);
              Alert.alert("Error", "Could not delete truck");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Truck }) => {
    const renderLeftActions = () => (
      <View style={styles.leftSwipeActions}>
        <TouchableOpacity
          style={[styles.editAction, { backgroundColor: '#3498db' }]}
          onPress={() => handleEditTruck(item)}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );

    const renderRightActions = () => (
      <View style={styles.rightSwipeActions}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: '#e74c3c' }]}
          onPress={() => handleDeleteTruck(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <GestureHandlerRootView>
        <Swipeable
          renderRightActions={renderRightActions}
          renderLeftActions={renderLeftActions}
        >
          <TouchableHighlight
            underlayColor={isDarkMode ? '#f0f0f0' : '#e0e0e0'}
            onPress={() => handleEditTruck(item)}
          >
            <View style={[styles.truckItem, { backgroundColor: isDarkMode ? '#1E3A5F' : '#f5f5f5' }]}>
              <View style={styles.truckDetails}>
                <Text style={[styles.truckLicense, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {item.licensePlate}
                </Text>
                <Text style={[styles.truckModel, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
                  {item.model}
                </Text>
              </View>
              <View style={styles.truckStatus}>
                <Text style={[styles.statusText, {
                  color: item.status === 'Available' ? '#48dc33' : '#f39c12'
                }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </TouchableHighlight>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
          <Text style={[styles.title, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>Trucks</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isDarkMode ? "#FFF" : "#0458AB" }]}
            onPress={() => setAddTruckVisible(true)}
          >
            <Text style={[styles.plus, { color: isDarkMode ? "#0458AB" : "#FFF" }]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.filtersContainer, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
          <Ionicons name="search" size={20} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}
            placeholder="Search by license or model"
            placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999999'}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
            </TouchableOpacity>
          )}
        </View>
        {/* Truck list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0458AB" />
          </View>
        ) : (
          <FlatList
            data={filteredTrucks}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0458AB"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDarkMode ? '#FFFFFF' : '#666666' }]}>
                  No trucks available
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
      <CreateTruckModal
        visible={addTruckVisible}
        onClose={() => setAddTruckVisible(false)}
      />
      
      <TouchableOpacity onPress={() => setAddTruckVisible(true)}>
      <Text>Agregar camión</Text>
      </TouchableOpacity>
      <UpdateTruckModal
        visible={updateTruckVisible}
        onClose={() => setUpdateTruckVisible(false)}
        truck={selectedTruck || null} // Pass the correct 'truck' prop
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 80 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingTop: 30,
    borderBottomWidth: 2,
    width: "100%",
    paddingHorizontal: 20,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  plus: { fontSize: 24, fontWeight: "bold" },
  buttonContainer: { flexDirection: "row", justifyContent: "center", gap: 120, marginTop: 20 },
  backButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  backButtonText: { color: "#FFF", fontWeight: "bold" },
  saveButtonText: { fontWeight: "bold" },
  // Additional styles for the list and filters
  datePickerContainer: {

  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    width: '30%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: '65%',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  truckItem: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  truckIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  truckDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  truckRef: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 14,
    marginTop: 4,
  },
  truckStatus: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
  },
  rightSwipeActions: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '100%',
    width: 100,
  },
  leftSwipeActions: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '100%',
    width: 100,
  },
  editAction: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  truckLicense: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  truckModel: {
    fontSize: 14,
    marginTop: 4,
  },
});
export default ListTruckModal;