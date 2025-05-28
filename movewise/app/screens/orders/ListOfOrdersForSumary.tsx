import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableHighlight,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { GetOrderWithAllStatus } from "@/hooks/api/GetOrderWithAllStatus";

interface OrderPerson {
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Order {
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
}
const ListOfOrdersForSummary: React.FC = () => {
  const { t } = useTranslation(); // Hook para traducción
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  // Función para cargar órdenes
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await GetOrderWithAllStatus();
      const ordersData = Array.isArray(response) ? response : response?.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error(t("error_loading_orders"), error);
      Alert.alert(t("error"), t("could_not_load_orders"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Normalizar fechas para comparación
  const normalizeDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Filtrar órdenes según rango de fechas y búsqueda
  const filteredOrders = orders.filter((order) => {
    const orderDate = order.date ? normalizeDate(new Date(order.date)) : null;

    const isDateMatch =
      (!startDate && !endDate) ||
      (orderDate && startDate && endDate && orderDate >= startDate && orderDate <= endDate) ||
      (orderDate && startDate && !endDate && orderDate >= startDate) ||
      (orderDate && !startDate && endDate && orderDate <= endDate);

    const isSearchMatch =
      order.key_ref.toLowerCase().includes(searchText.toLowerCase()) ||
      `${order.person.first_name || ""} ${order.person.last_name || ""}`
        .toLowerCase()
        .includes(searchText.toLowerCase());

    return isDateMatch && isSearchMatch;
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

  const renderItem = ({ item }: { item: Order }) => {
    const formatDate = (dateString: string | null) => {
      if (!dateString) return t("date_placeholder");
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      });
    };

    return (
      <GestureHandlerRootView>
        <TouchableHighlight
          underlayColor="#e0e0e0"
          onPress={() =>
            router.push({
              pathname: "./SummaryComponent",
              params: {
                order: item.key,
                key_ref: item.key_ref,
                customerFName: item.person.first_name,
                customerLName: item.person.last_name,
              },
            })
          }
        >
          <View style={styles.orderItem}>
            <View style={styles.orderIconContainer}>
              <Ionicons name="cube-outline" size={24} color="#0458AB" />
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderRef}>{item.key_ref}</Text>
              <Text style={styles.customerName}>
                {`${item.person?.first_name || ""} ${item.person?.last_name || ""}`}
              </Text>
            </View>
            <View style={styles.orderStatus}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status.toLocaleLowerCase() === 'pending'
                        ? "#f39c12"
                        : item.status.toLocaleLowerCase() === t("completed")
                        ? "#48dc33"
                        : "#48dc33",
                  },
                ]}
              >
                {t(item.status.toLowerCase())}
              </Text>
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            </View>
          </View>
        </TouchableHighlight>
      </GestureHandlerRootView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: '#FFF',
            backgroundColor: '#0458AB',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { flex: 1, textAlign: 'center', marginLeft: 0 }]}>
          {t("orders")}
        </Text>
        {/* Espacio para mantener el título centrado */}
        <View style={{ width: 40 }} />
      </View>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t("search_placeholder")}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {/* Filtros de fecha */}
      <View style={styles.datePickerContainer}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.datePickerText}>
            {startDate ? startDate.toLocaleDateString() : t("start_date")}
          </Text>
          <Ionicons name="calendar" size={20} color="#0458AB" />
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.datePickerText}>
            {endDate ? endDate.toLocaleDateString() : t("end_date")}
          </Text>
          <Ionicons name="calendar" size={20} color="#0458AB" />
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}
      </View>

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
          refreshing={refreshing}
          onRefresh={loadOrders}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {orders.length === 0 ? t("no_orders_available") : t("no_matching_orders")}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 40,
    padding: 16,
    backgroundColor: "#0458AB",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#0458AB",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  listContainer: {
    backgroundColor: "#fff",
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  orderItem: {
    flexDirection: "row",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  orderIconContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  orderDetails: {
    flex: 1,
    justifyContent: "center",
  },
  orderRef: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0458AB",
  },
  customerName: {
    fontSize: 14,
    marginTop: 4,
    color: "#333",
  },
  orderStatus: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
    color: "#666",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#0458AB",
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 16,
  },
});

export default ListOfOrdersForSummary;