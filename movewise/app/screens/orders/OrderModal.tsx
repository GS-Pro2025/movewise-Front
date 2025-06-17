import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, FlatList, TextInput, ActivityIndicator, RefreshControl, Alert, SafeAreaView } from "react-native";
import { useState, useEffect, useCallback, memo } from "react";
import { useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import AddOrderForm from "./AddOrderForm";
import UpdateOrder from "./UpdateOrder";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { TouchableHighlight } from "react-native";
import Toast from "react-native-toast-message";
import { DeleteOrder } from "@/hooks/api/DeleteOrder";
import { useTranslation } from "react-i18next";
import InfoOrderModal from './InfoOrderModal';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from "expo-router";
import { getOrdersAllStatus, OrdersResponse } from "@/hooks/api/GetOrders";
import colors from "@/app/Colors";
import { Picker } from '@react-native-picker/picker';
import { formatLocalDate } from "@/app/components/orders/FormattedDate";
import { getRegisteredLocations } from "@/hooks/api/GetRegisteredLocations";

interface OrderModalProps {
  visible: boolean;
  onClose: () => void;
  isOperator?: boolean;
}

interface OrderPerson {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  phone: number | null;
}

export interface Order {
  key: string;
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
  job_name: string | null;
  evidence: string | null;
  dispatch_ticket: string | null;
  customer_factory: number | 0;
  customer_factory_name: string | null;
}

const OrderModal = () => {
  const params = useLocalSearchParams();
  const isOperator = false;

  const { t } = useTranslation();
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedOrderInfo, setSelectedOrderInfo] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [modalAddOrderVisible, setModalAddOrderVisible] = useState(false);
  const [updateOrderVisible, setUpdateOrderVisible] = useState(false);
  const [pagination, setPagination] = useState({
    next: null as string | null,
    previous: null as string | null,
    count: 0,
  });
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchText(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getRegisteredLocations();
        if (response?.data) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [selectedDate, statusFilter, searchText, locationFilter]);

  const loadOrders = useCallback(async (url?: string) => {
    const isFirstPage = !url;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setRefreshing(true);

    try {
      const formattedDate = selectedDate ? formatLocalDate(selectedDate) : undefined;
      const response = await getOrdersAllStatus(url, {
        date: formattedDate,
        status: statusFilter,
        search: searchText,
        location: locationFilter || undefined
      });

      if (!response || !response.results || !Array.isArray(response.results)) {
        console.error("Estructura de respuesta inválida:", response);
        if (isFirstPage) {
          setOrders([]);
        }
        return;
      }

      const mappedOrders = response.results.map((order: Order) => ({
        key: order.key,
        key_ref: order.key_ref,
        date: order.date,
        distance: order.distance,
        expense: order.expense,
        income: order.income,
        weight: order.weight,
        status: order.status.toUpperCase(),
        payStatus: order.payStatus,
        state_usa: order.state_usa,
        person: {
          email: order.person?.email || '',
          first_name: order.person?.first_name || null,
          last_name: order.person?.last_name || null,
          phone: order.person?.phone || null,
          address: order.person?.address || null,
        },
        job: order.job,
        job_name: order.job_name,
        evidence: order.evidence || null,
        dispatch_ticket: order.dispatch_ticket,
        customer_factory: order.customer_factory,
        customer_factory_name: order.customer_factory_name,
      }));

      if (isFirstPage) {
        setOrders(mappedOrders);
      } else {
        setOrders(prev => [...prev, ...mappedOrders]);
      }

      setPagination({
        next: response.next,
        previous: response.previous,
        count: response.count,
      });
    } catch (error) {
      console.error(t("error_loading_orders"), error);
      Alert.alert(t("error"), t("could_not_load_orders"));
      if (isFirstPage) {
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [t, selectedDate, statusFilter, searchText, locationFilter]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const onRefresh = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !pagination.next) return;
    loadOrders(pagination.next);
  }, [loadingMore, pagination.next, loadOrders]);

  const onDateChange = useCallback((event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const handleEditOrder = useCallback((order: Order) => {
    if (order && order.status !== 'FINISHED') {
      setSelectedOrder(order);
      setUpdateOrderVisible(true);
    } else if (order.status === 'FINISHED') {
      Toast.show({
        type: "info",
        text1: t("order_completed"),
        text2: t("completed_orders_cant_edit"),
      });
    } else {
      Alert.alert(t("error"), t("selected_order_null"));
    }
  }, [t]);

  const handleDeleteOrder = useCallback((Key: string) => {
    Alert.alert(
      t("confirm_delete"),
      t("delete_order_confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              await DeleteOrder(Key);
              setOrders(prev => prev.filter(order => order.key !== Key));
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
          }
        }
      ]
    );
  }, [t, loadOrders]);

  const OrderItem = memo(({ item }: { item: Order }) => {
    const formatDate = (dateString: string | null) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
      });
    };

    const renderLeftActions = !isOperator && item.status !== 'FINISHED' ? () => (
      <View style={styles.leftSwipeActions}>
        <TouchableOpacity
          style={[styles.editAction, { backgroundColor: colors.swipeEdit }]}
          onPress={() => handleEditOrder(item)}
        >
          <Ionicons name="create-outline" size={24} color={colors.darkText} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    ) : undefined;

    const renderRightActions = () => (
      <View style={styles.rightSwipeActions}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: colors.swipeDelete }]}
          onPress={() => handleDeleteOrder(item.key)}
        >
          <Ionicons name="trash-outline" size={24} color={colors.darkText} />
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
            underlayColor={isDarkMode ? colors.highlightDark : colors.highlightLight}
            onPress={() => {
              setSelectedOrderInfo(item);
              setInfoModalVisible(true);
            }}
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
                  color: item.status === 'PENDING' ? colors.pendingStatus :
                    item.status === 'FINISHED' ? colors.completedStatus : colors.swipeEdit
                }]}>
                  {t(item.status.toLowerCase())}
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
  });

  const clearDateFilter = useCallback(() => {
    setSelectedDate(null);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
      {/* Header unificado */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
        <Text style={[styles.title, { color: isDarkMode ? colors.darkText : colors.primary }]}>
          {t("Orders")}
        </Text>
        
        <View style={styles.headerRight}>
          <View style={styles.locationPickerContainer}>
            <Picker
              selectedValue={locationFilter || ''}
              style={[styles.locationPicker, { color: isDarkMode ? colors.darkText : colors.primary }]}
              dropdownIconColor={isDarkMode ? colors.darkText : colors.primary}
              onValueChange={(itemValue) => setLocationFilter(itemValue || null)}
            >
              <Picker.Item label={t('all_locations') || 'All Locations'} value="" />
              {locations.map((location, index) => (
                <Picker.Item key={index} label={location} value={location} />
              ))}
            </Picker>
          </View>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isDarkMode ? colors.secondary : colors.primary }]}
            onPress={() => setModalAddOrderVisible(true)}
          >
            <Ionicons name="add" size={20} color={colors.lightBackground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros: Fecha + Estado */}
      <View style={[styles.filtersRow, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
        <View style={styles.filterItem}>
          <TouchableOpacity
            style={[styles.datePickerButton, {
              borderColor: isDarkMode ? colors.secondary : colors.primary,
              backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight,
            }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: isDarkMode ? colors.darkText : colors.lightText, fontSize: 14 }}>
              {selectedDate ? selectedDate.toLocaleDateString() : t("select_date")}
            </Text>
            <Ionicons name="calendar" size={20} color={isDarkMode ? colors.secondary : colors.primary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          {selectedDate && (
            <TouchableOpacity onPress={clearDateFilter} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={isDarkMode ? colors.secondary : colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterItem}>
          <Picker
            selectedValue={statusFilter}
            onValueChange={(itemValue) => setStatusFilter(itemValue)}
            style={[styles.picker, {
              color: isDarkMode ? colors.darkText : colors.lightText,
              backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight,
            }]}
            dropdownIconColor={isDarkMode ? colors.secondary : colors.primary}
          >
            <Picker.Item label={t("all_statuses")} value={null} />
            <Picker.Item label={t("pending")} value="PENDING" />
            <Picker.Item label={t("in_progress")} value="IN_PROGRESS" />
            <Picker.Item label={t("completed")} value="FINISHED" />
          </Picker>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
        <Ionicons name="search" size={20} color={isDarkMode ? colors.secondary : colors.primary} />
        <TextInput
          style={[styles.searchInput, { color: isDarkMode ? colors.darkText : colors.lightText }]}
          placeholder={t("search_placeholder")}
          placeholderTextColor={isDarkMode ? colors.placeholderDark : colors.placeholderLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={isDarkMode ? colors.secondary : colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de órdenes */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={{ backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }}
          data={orders}
          keyExtractor={(item, index) => `${item.key}-${index}`}
          renderItem={({ item }) => <OrderItem item={item} />}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 10, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: isDarkMode ? colors.emptyTextDark : colors.emptyTextLight }]}>
                {t("no_matching_orders")}
              </Text>
            </View>
          }
        />
      )}

      {/* Modales */}
      <InfoOrderModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        order={selectedOrderInfo}
        userRole={"admin"}
        isWorkhouse={false}
      />
      
      <Modal visible={modalAddOrderVisible} animationType="slide">
        <AddOrderForm visible={modalAddOrderVisible} onClose={() => setModalAddOrderVisible(false)} />
      </Modal>

      {selectedOrder && (
        <UpdateOrder
          visible={updateOrderVisible}
          onClose={() => {
            setUpdateOrderVisible(false);
            setSelectedOrder(null);
            loadOrders();
          }}
          orderData={selectedOrder}
        />
      )}
      
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationPickerContainer: {
    width: 120,
    height: 52,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
  },
  locationPicker: {
    height: 52,
    width: '100%',
    fontSize: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  filterItem: {
    flex: 1,
    position: 'relative',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  picker: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 52,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontWeight: 'bold',
    fontSize: 16,
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
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
  },
  leftSwipeActions: {
    backgroundColor: colors.swipeEdit,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 80,
    marginVertical: 4,
    borderRadius: 8,
  },
  rightSwipeActions: {
    backgroundColor: colors.swipeDelete,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 80,
    marginVertical: 4,
    borderRadius: 8,
  },
  editAction: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  deleteAction: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
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
});

export default OrderModal;