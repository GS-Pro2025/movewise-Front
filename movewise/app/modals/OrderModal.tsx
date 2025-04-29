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
import colors from "../Colors";

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
  key_ref: string;
  date: string | null;
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

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await getOrders();
      const ordersData = Array.isArray(response) ? response : response?.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
      Alert.alert("Error", "Could not load orders");
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

  const normalizeDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const filteredOrders = orders.filter(order => {
    const orderDate = order.date ? normalizeDate(new Date(order.date)) : null;

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
      Alert.alert("Error", "Selected order data is null or undefined.");
    }
  };

  const handleDeleteOrder = (keyRef: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this order?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", onPress: () => {
            setOrders(prev => prev.filter(order => order.key_ref !== keyRef));
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Order }) => {
    const renderLeftActions = () => (
      <View style={styles.leftSwipeActions}>
        <TouchableOpacity
          style={[styles.editAction, { backgroundColor: colors.swipeEdit }]}
          onPress={() => handleEditOrder(item)}
        >
          <Ionicons name="create-outline" size={24} color={colors.darkText} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );

    const renderRightActions = () => (
      <View style={styles.rightSwipeActions}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: colors.swipeDelete }]}
          onPress={() => handleDeleteOrder(item.key_ref)}
        >
          <Ionicons name="trash-outline" size={24} color={colors.darkText} />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );

    const formatDate = (dateString: string | null) => {
      if (!dateString) return '';
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
            underlayColor={isDarkMode ? colors.highlightDark : colors.highlightLight}
            onPress={() => handleEditOrder(item)}
          >
            <View style={[styles.orderItem, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
              <View style={styles.orderIconContainer}>
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color={isDarkMode ? colors.secondary : colors.primary}
                />
              </View>
              <View style={styles.orderDetails}>
                <Text style={[styles.orderRef, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                  {item.key_ref}
                </Text>
                <Text style={[styles.customerName, { color: isDarkMode ? colors.placeholderDark : colors.lightText }]}>
                  {`${item.person?.first_name || ''} ${item.person?.last_name || ''}`}
                </Text>
              </View>
              <View style={styles.orderStatus}>
                <Text style={[styles.statusText, {
                  color: item.status === 'Pending' ? colors.pendingStatus :
                    item.status === 'Completed' ? colors.completedStatus : colors.completedStatus
                }]}>
                  {item.status}
                </Text>
                <Text style={[styles.dateText, { color: isDarkMode ? colors.placeholderDark : colors.placeholderLight }]}>
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
        <View style={[styles.header, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground, borderBottomColor: isDarkMode ? colors.borderDark : colors.borderLight }]}>
          <Text style={[styles.title, { color: isDarkMode ? colors.darkText : colors.primary }]}>Create Order</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isDarkMode ? colors.lightBackground : colors.primary }]}
            onPress={() => setAddOrderVisible(true)}
          >
            <Text style={[styles.plus, { color: isDarkMode ? colors.primary : colors.lightBackground }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Date Pickers for Start and End Dates */}

        <View style={[styles.datePickerContainer, { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isDarkMode ? colors.third : colors.highlightLight, borderRadius: 0, padding: 10 }]}>
          <TouchableOpacity
            style={[styles.datePickerButton, { borderWidth: 1, borderColor: isDarkMode ? colors.secondary : colors.primary, borderRadius: 8, padding: 10, flex: 1, marginRight: 5 }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={{ color: isDarkMode ? colors.darkText : colors.lightText, fontSize: 16 }}>
              {startDate ? startDate.toLocaleDateString() : 'start date'} {/* Handle null date */}
            </Text>
            <Ionicons name="calendar" size={20} color={isDarkMode ? colors.secondary : colors.primary} />
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
            <Ionicons name="close-circle" size={18} color={isDarkMode ? colors.secondary : colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.datePickerButton, { borderWidth: 1, borderColor: isDarkMode ? colors.secondary : colors.primary, borderRadius: 8, padding: 10, flex: 1, marginLeft: 5 }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={{ color: isDarkMode ? colors.darkText : colors.lightText, fontSize: 16 }}>
              {endDate ? endDate.toLocaleDateString() : 'End date'} {/* Handle null date */}
            </Text>
            <Ionicons name="calendar" size={20} color={isDarkMode ? colors.secondary : colors.primary} />
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
            <Ionicons name="close-circle" size={18} color={isDarkMode ? colors.secondary : colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}

        <View style={[styles.filtersContainer, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="search" size={20} color={isDarkMode ? colors.secondary : colors.primary} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? colors.darkText : colors.lightText }]}
              placeholder="Search reference or client"
              placeholderTextColor={isDarkMode ? colors.placeholderDark : colors.placeholderLight}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color={isDarkMode ? colors.secondary : colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList style={{ backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}
            data={filteredOrders}
            keyExtractor={(item, index) => `${item.key_ref}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDarkMode ? colors.emptyTextDark : colors.emptyTextLight }]}>
                  {orders.length === 0 ? "No orders available" : "No matching orders found"}
                </Text>
              </View>
            }
          />
        )}

        {/* Back and Save Buttons */}

        {loading ? null : (
          <View style={[styles.container, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
            <View style={[styles.buttonContainer, { justifyContent: 'center', alignItems: 'flex-end' }]}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: isDarkMode ? colors.primary : colors.neutralGray, width: 120, height: 50, alignItems: 'center', justifyContent: 'center' }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.backButtonText, { color: isDarkMode ? colors.darkText : colors.blackText, textAlign: 'center' }]}>
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: isDarkMode ? colors.lightBackground : colors.primary, width: 120, height: 50, alignItems: 'center', justifyContent: 'center' }]}
              >
                <Text style={[styles.saveButtonText, { color: isDarkMode ? colors.primary : colors.lightBackground, textAlign: 'center' }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* End of Back and Save Buttons */}
      </SafeAreaView>
      <AddOrderForm visible={addOrderVisible} onClose={() => setAddOrderVisible(false)} />
      <UpdateOrder visible={updateOrderVisible} onClose={() => setUpdateOrderVisible(false)} orderData={selectedOrder || {}} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 50 },
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