import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, FlatList, TextInput, ActivityIndicator, RefreshControl, Alert, SafeAreaView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { TouchableHighlight } from "react-native";
import { ListTruck, DeleteTruck, UpdateTruckStatus, CreateTruck } from "../hooks/api/TruckClient"; // Import TruckClient methods
// import CreateTruckScreen from "../app/modals/CreateTruck";


import Toast from "react-native-toast-message";
import Truck from "@/hooks/api/TruckClient"
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import UpdateTruckModal from "@/app/screens/trucks/UpdateTruckModal";
import CreateTruckModal from "@/app/screens/trucks/CreateTruckModal";
import colors from "@/app/Colors";

interface ListTruckModalProps {
  visible: boolean;
  onClose: () => void;
}

const ListTruckModal: React.FC<ListTruckModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation(); // Hook para traducción
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
    console.log(`loading trucks`);
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await ListTruck();
      setTrucks(response.data || []);
      console.log(`trucks loaded: ${JSON.stringify(trucks)}`);
    } catch (error) {
      console.error(t("error_loading_trucks"), error);
      Alert.alert(t("error"), t("could_not_load_trucks"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);
// console.log(`truck visible: ${visible}`);
  useEffect(() => {
    if (visible) {
      loadTrucks();
    }
  }, [visible, loadTrucks]);

  const onRefresh = useCallback(() => {
    loadTrucks();
  }, [loadTrucks]);

  const filteredTrucks = trucks.filter(truck => {
    const number_truck = truck.number_truck || ''; // Fallback to an empty string if undefined
    const category = truck.category || ''; // Fallback to an empty string if undefined

    return (
      number_truck.toLowerCase().includes(searchText.toLowerCase()) ||
      category.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleEditTruck = (truck: Truck) => {
    setSelectedTruck(truck);
    setUpdateTruckVisible(true);
  };

  const handleDeleteTruck = async (id_truck: string) => {
    Alert.alert(
      t("confirm_delete"),
      t("delete_truck_confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              await UpdateTruckStatus(id_truck, 'False');
              setTrucks(prev => prev.filter(truck => truck.id_truck !== id_truck));
              Toast.show({
                type: "success",
                text1: t("truck_deleted"),
                text2: t("truck_deleted_successfully")
              });
              loadTrucks();
            } catch (error) {
              console.error(t("error_deleting_truck"), error);
              Alert.alert(t("error"), t("could_not_delete_truck"));
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
          <Text style={styles.actionText}>{t("edit")}</Text>
        </TouchableOpacity>
      </View>
    );

    const renderRightActions = () => (
      <View style={styles.rightSwipeActions}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: '#e74c3c' }]}
          onPress={() => handleDeleteTruck(item.id_truck)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>{t("delete")}</Text>
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
                  {item.number_truck}
                </Text>
                <Text style={[styles.truckModel, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
                  {t("category")}: {item.category}
                </Text>
                <Text style={[styles.truckModel, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
                  {t("type")}: {item.type}
                </Text>
              </View>
            </View>
          </TouchableHighlight>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={[
            styles.header,
            { backgroundColor: isDarkMode ? '#112A4A' : '#ffffff' }
          ]}
        >
          {/* Back Button */}
          {/* <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { borderColor: isDarkMode ? '#FFF' : '#0458AB' }]}
          >
            <Text style={[styles.backIcon, { color: isDarkMode ? '#FFF' : '#0458AB' }]}>
              ←
            </Text>
          </TouchableOpacity> */}

          {/* Title centrado */}
          <Text
            style={[
              styles.title,
              {
                color: isDarkMode ? '#FFFFFF' : '#0458AB',
                flex: 1,
                textAlign: 'center'
              }
            ]}
          >
            {t('trucks')}
          </Text>

          {/* Add Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: isDarkMode ? '#FFF' : '#0458AB' }
            ]}
            onPress={() => setAddTruckVisible(true)}
          >
            <Text
              style={[
                styles.plus,
                { color: isDarkMode ? '#0458AB' : '#FFF' }
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.filtersContainer, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
          <Ionicons name="search" size={20} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}
            placeholder={t("search_placeholder_truck")}
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
        {/* Lista de camiones */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0458AB" />
          </View>
        ) : (
          <FlatList
            data={filteredTrucks}
            renderItem={renderItem}
            keyExtractor={(item) => item.id_truck}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0458AB']}
                tintColor="#0458AB"
              />
            }
            contentContainerStyle={[
              styles.listContent,
              filteredTrucks.length === 0 && styles.emptyListContent
            ]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name="car-outline" 
                  size={60} 
                  color={isDarkMode ? '#666' : '#999'} 
                  style={{ marginBottom: 10 }}
                />
                <Text style={[styles.emptyText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
                  {t('no_trucks_available')}
                </Text>
                <TouchableOpacity
                  style={[styles.secondAddButton, { marginTop: 20 }]}
                  onPress={() => setAddTruckVisible(true)}
                >
                  <Ionicons name="add" size={24} color="white" />
                  <Text style={styles.addButtonText}>
                    {t('add_truck')}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </SafeAreaView>
      <CreateTruckModal
        visible={addTruckVisible}
        onClose={() => setAddTruckVisible(false)}
        onSuccess={loadTrucks}
      />
      <UpdateTruckModal
        visible={updateTruckVisible}
        onClose={() => setUpdateTruckVisible(false)}
        truck={selectedTruck || null}
        onSuccess={loadTrucks}
      />
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 80 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingTop: 10,
    borderBottomWidth: 2,
    width: '100%',
    paddingHorizontal: 20,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: { fontSize: 20, fontWeight: "bold" },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondAddButton: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: 200,
      height: 40,
      borderRadius: 20,
      borderColor: colors.primary,
      borderWidth: 1,
      backgroundColor: colors.primary,
    },
  plus: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: { flexDirection: "row", justifyContent: "center", gap: 120, marginTop: 20 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
});
export default ListTruckModal;