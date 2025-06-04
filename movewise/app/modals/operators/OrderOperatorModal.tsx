import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, FlatList, TextInput, ActivityIndicator, RefreshControl, Alert, SafeAreaView } from "react-native";
import { useState, useEffect, useCallback, memo } from "react";
import { useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
// import AddOrderForm from "./AddOrderForm";
import AddOrderForm from '@/app/screens/orders/AddOrderForm';
import UpdateOrder from '@/app/screens/orders/UpdateOrder';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { TouchableHighlight } from "react-native";
import Toast from "react-native-toast-message";
import { DeleteOrder } from "@/hooks/api/DeleteOrder";
import { useTranslation } from "react-i18next";
import InfoOrderModal from '@/app/screens/orders/InfoOrderModal';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from "expo-router"; 
import { getOrdersAllStatus, OrdersResponse } from "@/hooks/api/GetOrders";
import colors from "@/app/Colors";
import { Picker } from '@react-native-picker/picker';


interface OrderModalProps {
  visible: boolean;
  onClose: () => void;
  isOperator?: boolean;
}

interface OrderPerson {
  email: string;
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
  const isOperator = true;

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
  const [pagination, setPagination] = useState({
    next: null as string | null,
    previous: null as string | null,
    count: 0,
  });
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  // Efecto para debounce en la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchText(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    loadOrders();
  }, [selectedDate, statusFilter, searchText]);

  const loadOrders = useCallback(async (url?: string) => {
    const isFirstPage = !url;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setRefreshing(true);

    try {
      // Formatear la fecha para el backend
      const formattedDate = selectedDate
        ? new Date(selectedDate.toISOString().split('T')[0])
        : undefined;

      const response = await getOrdersAllStatus(url, {
        date: formattedDate,
        status: statusFilter,
        search: searchText
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
  }, [t, selectedDate, statusFilter, searchText]);

  // Recargar al enfocar la pantalla
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
      router.push({
        pathname: '../../screens/orders/UpdateOrder',
        params: { order: JSON.stringify(order) }
      });
    } else if (order.status === 'FINISHED') {
      Toast.show({
        type: "info",
        text1: t("order_completed"),
        text2: t("completed_orders_cant_edit"),
      });
    } else {
      Alert.alert(t("error"), t("selected_order_null"));
    }
  }, [router, t]);

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
    const handlePress = useCallback(() => {
      handleOpenInfoModal(item);
    }, [item]);
    
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
            onPress={handlePress}
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

  const handleOpenInfoModal = useCallback((order: Order) => {
    setSelectedOrderInfo(order);
    setTimeout(() => {
      setInfoModalVisible(true);
    }, 100);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>

      {/* Header */}
      {/* <View style={[styles.header, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground, borderBottomColor: isDarkMode ? colors.borderDark : colors.borderLight, minHeight: 100 }]}>
        <TouchableOpacity
          style={[styles.backButton]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? colors.lightText : colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { ...(isDarkMode ? { color: colors.darkText } : { color: colors.primary }) }]}>{t("Orders")}</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: isDarkMode ? colors.lightBackground : colors.primary }]}
          onPress={() => router.push('../../screens/orders/AddOrderForm')}
        >
          <Text style={[styles.plus, { color: isDarkMode ? colors.primary : colors.lightBackground }]}>+</Text>
        </TouchableOpacity>
      </View> */}

      {/* Filtros combinados: Fecha + Estado */}
      <View style={[styles.filtersRow, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>

        {/* Date Picker */}
        <View style={[styles.filterItem, { marginRight: 5 }]}>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              {
                borderWidth: 1,
                borderColor: isDarkMode ? colors.secondary : colors.primary,
                backgroundColor: isDarkMode ? colors.third : colors.highlightLight,
              }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: isDarkMode ? colors.darkText : colors.lightText, fontSize: 16 }}>
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
            <TouchableOpacity onPress={clearDateFilter} style={{ position: 'absolute', top: 8, right: 8 }}>
              <Ionicons name="close-circle" size={20} color={isDarkMode ? colors.secondary : colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter */}
        <View style={[styles.filterItem]}>
          <Picker
            selectedValue={statusFilter}
            onValueChange={(itemValue) => setStatusFilter(itemValue)}
            style={[styles.picker, {
              color: isDarkMode ? colors.darkText : colors.lightText,
              backgroundColor: isDarkMode ? colors.third : colors.highlightLight,
              flex: 1,
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

      {/* Search Bar */}
      <View style={[styles.filtersContainer, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
      </View>

      {/* Orders List */}
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
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={7}
        />
      )}

      {/* Info Modal */}
      <InfoOrderModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        order={selectedOrderInfo}
        isWorkhouse={false}
      />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20, 
    minHeight: 70, 
    borderBottomWidth: 1,
    elevation: 2,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: 10,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'space-between',
  },
  filterItem: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  orderIconContainer: {
    marginRight: 15,
  },
  orderDetails: {
    flex: 1,
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
    flexDirection: 'row',
    width: 80,
  },
  rightSwipeActions: {
    flexDirection: 'row',
    width: 80,
  },
  editAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
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