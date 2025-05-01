import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, FlatList, TextInput, ActivityIndicator, RefreshControl, Alert, SafeAreaView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import AddOrderForm from "./AddOrderForm";
import UpdateOrder from "./UpdateOrder";
import { getOrders } from "../../hooks/api/GetOrders";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { TouchableHighlight } from "react-native";
import Toast from "react-native-toast-message";
import { DeleteOrder } from "@/hooks/api/DeleteOrder";
import { useTranslation } from "react-i18next";

interface OrderModalProps {
  visible: boolean;
  onClose: () => void;
}

interface OrderPerson {
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Order {
  key: string;
  key_ref: string;
  date: string | null; // Changed to allow null date
  distance: number | null;
  expense: string | null;
  income: string | null;
  weight: string;
  status: string;
  payStatus: number | null;
  state_usa: string;
  person: OrderPerson;
  job: number;
}

const OrderModal: React.FC<OrderModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation(); // Hook para traducción

  const [addOrderVisible, setAddOrderVisible] = useState(false);
  const [updateOrderVisible, setUpdateOrderVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  // Function to load orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await getOrders();
      console.log(response)
      // Check response structure
      const ordersData = Array.isArray(response) ? response : response?.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error(t("error_loading_orders"), error);
      Alert.alert(t("error"), t("could_not_load_orders"));
      //router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [visible, loadOrders]);

  const onRefresh = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  // Normalize dates for comparison
  const normalizeDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const filteredOrders = orders.filter(order => {
    const orderDate = order.date ? normalizeDate(new Date(order.date)) : null; // Handle null date

    const isDateMatch = (!startDate && !endDate) ||
      (orderDate && startDate && endDate && orderDate >= startDate && orderDate <= endDate) ||
      (orderDate && startDate && !endDate && orderDate >= startDate) ||
      (orderDate && !startDate && endDate && orderDate <= endDate);

    const searchLower = searchText.toLowerCase();
    const fullName = `${order.person?.first_name || ''} ${order.person?.last_name || ''}`.trim().toLowerCase();

    const isTextMatch = !searchText ||
      order.key_ref.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower);

    return isDateMatch && isTextMatch;
  });

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleEditOrder = (order: Order) => {
    if (order) {
      setSelectedOrder(order);
      setUpdateOrderVisible(true);
    } else {
      Alert.alert(t("error"), t("selected_order_null"));
    }
  };
  const handleDeleteOrder = (key: string) => {
    Alert.alert(
      t("confirm_delete"),
      t("delete_order_confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              console.log(t("deleting_order"), key);
              await DeleteOrder(key);
              setOrders((prev) => prev.filter((order) => order.key !== key));
              Toast.show({
                type: "success",
                text1: t("order_deleted"),
                text2: t("order_deleted_successfully"),
              });
              loadOrders();
            } catch (error) {
              console.error(t("error_deleting_order"), error);
              Toast.show({
                type: "error",
                text1: t("order_not_deleted"),
                text2: t("order_could_not_be_deleted"),
              });
            }
          },
        },
      ]
    );
  };
  const renderItem = ({ item }: { item: Order }) => {
    const renderLeftActions = () => (
      <View style={styles.leftSwipeActions}>
        <TouchableOpacity
          style={[styles.editAction, { backgroundColor: '#3498db' }]}
          onPress={() => handleEditOrder(item)}
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
          onPress={() => handleDeleteOrder(item.key)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );

    const formatDate = (dateString: string | null) => {
      if (!dateString) return ''; // Handle null case
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
      });
    };

    return (
      <GestureHandlerRootView>
        <Swipeable
          renderRightActions={renderRightActions}
          renderLeftActions={renderLeftActions}
        >
          <TouchableHighlight
            underlayColor={isDarkMode ? '#f0f0f0' : '#e0e0e0'}
            onPress={() => handleEditOrder(item)}
          >
            <View style={[styles.orderItem, { backgroundColor: isDarkMode ? '#1E3A5F' : '#f5f5f5' }]}>
              <View style={styles.orderIconContainer}>
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color={isDarkMode ? "#A1C6EA" : "#0458AB"}
                />
              </View>
              <View style={styles.orderDetails}>
                <Text style={[styles.orderRef, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {item.key_ref}
                </Text>
                <Text style={[styles.customerName, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
                  {`${item.person?.first_name || ''} ${item.person?.last_name || ''}`}
                </Text>
              </View>
              <View style={styles.orderStatus}>
                <Text style={[styles.statusText, {
                  color: item.status === 'Pending' ? '#f39c12' :
                    item.status === 'Completed' ? '#48dc33' : '#48dc33' // Cambiado a verde para completado
                }]}>
                  {t(item.status.toLowerCase())} {/* Traducción del estado */}
                </Text>
                <Text style={[styles.dateText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
                  {formatDate(item.date)}
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
        {/* Encabezado */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff", borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
          <Text style={[styles.title, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>{t("create_order")}</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isDarkMode ? "#FFF" : "#0458AB" }]}
            onPress={() => setAddOrderVisible(true)} // Mostrar el modal AddOrderForm
          >
            <Text style={[styles.plus, { color: isDarkMode ? "#0458AB" : "#FFF" }]}>+</Text>
          </TouchableOpacity>
        </View>
  
        {/* Filtros */}
        {/* FECHAS */}
        <View style={[styles.datePickerContainer, { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isDarkMode ? '#1E3A5F' : '#f0f0f0', borderRadius: 0, padding: 10 }]}>
          <TouchableOpacity
            style={[styles.datePickerButton, { borderWidth: 1, borderColor: isDarkMode ? '#A1C6EA' : '#0458AB', borderRadius: 8, padding: 10, flex: 1, marginRight: 5 }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={{ color: isDarkMode ? '#FFFFFF' : '#333333', fontSize: 16 }}>
              {startDate ? startDate.toLocaleDateString() : t("start_date")} {/* Manejar fecha nula */}
            </Text>
            <Ionicons name="calendar" size={20} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}
          <TouchableOpacity onPress={() => { setStartDate(null); setShowStartDatePicker(false); }}>
            <Ionicons name="close-circle" size={18} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[styles.datePickerButton, { borderWidth: 1, borderColor: isDarkMode ? '#A1C6EA' : '#0458AB', borderRadius: 8, padding: 10, flex: 1, marginLeft: 5 }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={{ color: isDarkMode ? '#FFFFFF' : '#333333', fontSize: 16 }}>
              {endDate ? endDate.toLocaleDateString() : t("end_date")} {/* Manejar fecha nula */}
            </Text>
            <Ionicons name="calendar" size={20} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}
          <TouchableOpacity onPress={() => { setEndDate(null); setShowEndDatePicker(false); }}>
            <Ionicons name="close-circle" size={18} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
          </TouchableOpacity>
        </View>
        {/* FECHAS */}
  
        <View style={[styles.filtersContainer, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff", borderRadius: 8, padding: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="search" size={20} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#333333', flex: 1, marginLeft: 10, borderWidth: 1, borderColor: isDarkMode ? '#A1C6EA' : '#0458AB', borderRadius: 8, padding: 10 }]}
              placeholder={t("search_placeholder")}
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
        </View>
  
        {/* Lista de órdenes */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0458AB" />
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item, index) => `${item.key_ref}-${index}`}
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
                  {orders.length === 0 ? t("no_orders_available") : t("no_matching_orders")}
                </Text>
              </View>
            }
          />
        )}
        {loading ? null : (
          <View style={[styles.container, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
            <View style={[styles.buttonContainer, { justifyContent: 'center', alignItems: 'flex-end' }]}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: isDarkMode ? "#0458AB" : "#545257", width: 120, height: 50, alignItems: 'center', justifyContent: 'center' }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.backButtonText, { color: isDarkMode ? "#FFFFFF" : "#000000", textAlign: 'center' }]}>{t("back")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: isDarkMode ? "#FFFFFF" : "#0458AB", width: 120, height: 50, alignItems: 'center', justifyContent: 'center' }]}
              >
                <Text style={[styles.saveButtonText, { color: isDarkMode ? "#0458AB" : "#FFFFFF", textAlign: 'center' }]}>
                  {t("save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
      {/* Aquí controlamos la visibilidad de los modales AddOrderForm y UpdateOrder */}
      <AddOrderForm visible={addOrderVisible} onClose={() => setAddOrderVisible(false)} />
      <UpdateOrder visible={updateOrderVisible} onClose={() => setUpdateOrderVisible(false)} orderData={selectedOrder || {}} />
      <Toast />
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
  orderItem: {
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
  orderIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  orderDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  orderRef: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 14,
    marginTop: 4,
  },
  orderStatus: {
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
});

export default OrderModal;