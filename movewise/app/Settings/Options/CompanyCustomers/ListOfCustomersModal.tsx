import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { Customer, CustomerFactory, DeleteCompany } from "../../../../hooks/api/CustomerFactoryClient";
import CreateCustomerModal, { CreateCustomerProvider } from "./CreateCustomerModal";

interface ListOfCustomersModalProps {
  visible: boolean;
  onClose: () => void;
}

const ListOfCustomersModal: React.FC<ListOfCustomersModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [createCustomerVisible, setCreateCustomerVisible] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await CustomerFactory();
      setCustomers(response.map((c: any) => ({
        id_factory: c.id_factory,
        name: c.name,
      })));
    } catch (error) {
      console.error(t("error_loading_customers"), error);
      Alert.alert(t("error"), t("could_not_load_customers"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    if (visible) {
      loadCustomers();
    }
  }, [visible, loadCustomers]);

  const onRefresh = useCallback(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = customers.filter(customer =>
    (customer.name || '').toLowerCase().includes(searchText.toLowerCase())
  );

  // Si tienes endpoint de delete, reemplaza esta función
  const handleDeleteCustomer = async (id: number) => {
    Alert.alert(
      t("confirm_delete"),
      t("delete_customer_confirmation") || "¿Eliminar este cliente?",
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              console.log("Id del customer a eliminar", id)
              await DeleteCompany(id);
              loadCustomers()
              Toast.show({
                type: "success",
                text1: t("customer_deleted") || "Cliente eliminado",
                text2: t("customer_deleted_successfully") || "El cliente fue eliminado correctamente"
              });
            } catch (error) {
              console.error(t("error_deleting_customer"), error);
              Alert.alert(t("error"), t("could_not_delete_customer") || "No se pudo eliminar el cliente");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Customer }) => {
    const renderRightActions = () => (
      <View style={styles.rightSwipeActions}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: '#e74c3c' }]}
          onPress={() => handleDeleteCustomer(item.id_factory)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>{t("delete")}</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <GestureHandlerRootView>
        <Swipeable renderRightActions={renderRightActions}>
          <View style={[styles.jobItem, { backgroundColor: isDarkMode ? '#1E3A5F' : '#f5f5f5' }]}>
            <Ionicons
              size={30}
              name="briefcase-outline"
              color={isDarkMode ? '#ffffff' : '#000000'} // blanco en modo oscuro, negro en modo claro
            />

            <View style={styles.jobDetails}>
              <Text style={[styles.jobTitle, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                {item.name}
              </Text>
            </View>
          </View>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? '#112A4A' : '#ffffff' }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.backButton, { borderColor: isDarkMode ? '#FFF' : '#0458AB' }]}
          >
            <Text style={[styles.backIcon, { color: isDarkMode ? '#FFF' : '#0458AB' }]}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#0458AB', flex: 1, textAlign: 'center' }]}>
            {t('customers') || "Clientes"}
          </Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: isDarkMode ? '#FFF' : '#0458AB' }
            ]}
            onPress={() => setCreateCustomerVisible(true)}
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
            placeholder={t("search_placeholder_customer") || "Buscar cliente"}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0458AB" />
          </View>
        ) : (
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item, index) => (item.id_factory ? item.id_factory.toString() : index.toString())}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#000000"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDarkMode ? '#0458AB' : '#666666' }]}>
                  {t("no_customers_available") || "No hay clientes disponibles"}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
      <CreateCustomerProvider
        visible={createCustomerVisible}
        onClose={() => setCreateCustomerVisible(false)}
        onSuccess={loadCustomers}
      >
        <CreateCustomerModal />
      </CreateCustomerProvider>
      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingTop: 30,
    borderBottomWidth: 2,
    width: '100%',
    paddingHorizontal: 20,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: { fontSize: 20, fontWeight: "bold", alignItems: 'center', marginLeft: 20 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
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
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  jobDetails: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
  },
  briefcaseImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    borderRadius: 20,
    borderRightWidth: 18,
    borderLeftWidth: 18
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightSwipeActions: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '100%',
    width: 100,
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
});

export default ListOfCustomersModal;