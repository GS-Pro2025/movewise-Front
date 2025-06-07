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
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { getOrdersAllStatus, OrdersResponse } from "@/hooks/api/GetOrders";
import colors from "@/app/Colors"; // Asegúrate de importar tus colores
import { formatLocalDate } from "@/app/components/orders/FormattedDate";
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
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Función para cargar órdenes con filtros
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      // Formatear fecha para el backend
      const formattedDate = selectedDate 
        ? formatLocalDate(selectedDate) 
        : undefined;
      
      const response = await getOrdersAllStatus(undefined, {
        date: formattedDate,
        search: searchText,
        status: null // No status filter
      });
      
      setOrders(response?.results || []);
    } catch (error) {
      console.error(t("error_loading_orders"), error);
      Alert.alert(t("error"), t("could_not_load_orders"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, selectedDate, searchText]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
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
          underlayColor={isDarkMode ? colors.highlightDark : colors.highlightLight}
          onPress={() =>
            router.push({
              pathname: "../../modals/SummaryComponent",
              params: {
                order: item.key,
                key_ref: item.key_ref,
                customerFName: item.person.first_name,
                customerLName: item.person.last_name,
              },
            })
          }
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
                {`${item.person?.first_name || ""} ${item.person?.last_name || ""}`}
              </Text>
            </View>
            <View style={styles.orderStatus}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: 
                      item.status.toLowerCase() === 'pending' ? colors.pendingStatus :
                      item.status.toLowerCase() === 'completed' ? colors.completedStatus : colors.completedStatus
                  },
                ]}
              >
                {t(item.status.toLowerCase())}
              </Text>
              <Text style={[styles.dateText, { color: isDarkMode ? colors.placeholderDark : colors.placeholderLight }]}>
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </GestureHandlerRootView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header con espacio aumentado para iOS */}
      <View style={[styles.header, { 
        backgroundColor: isDarkMode ? colors.third : colors.lightBackground,
        minHeight: 70,
        paddingVertical: 20,
        borderBottomColor: isDarkMode ? colors.borderDark : colors.borderLight,
      }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDarkMode ? colors.secondary : colors.primary,
          }}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDarkMode ? colors.darkText : colors.lightText} 
          />
        </TouchableOpacity>
        <Text style={[styles.title, { 
          flex: 1, 
          textAlign: 'center', 
          marginLeft: 0,
          color: isDarkMode ? colors.darkText : colors.primary
        }]}>
          {t("orders")}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Barra de búsqueda */}
      <View style={[styles.searchContainer, { 
        backgroundColor: isDarkMode ? colors.third : colors.lightBackground 
      }]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={isDarkMode ? colors.secondary : colors.primary} 
        />
        <TextInput
          style={[styles.searchInput, { 
            color: isDarkMode ? colors.darkText : colors.lightText 
          }]}
          placeholder={t("search_placeholder")}
          placeholderTextColor={isDarkMode ? colors.placeholderDark : colors.placeholderLight}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons 
              name="close-circle" 
              size={18} 
              color={isDarkMode ? colors.secondary : colors.primary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtro de fecha única */}
      <View style={[styles.datePickerContainer, { 
        backgroundColor: isDarkMode ? colors.third : colors.lightBackground 
      }]}>
        <TouchableOpacity
          style={[styles.datePickerButton, {
            borderColor: isDarkMode ? colors.secondary : colors.primary,
            backgroundColor: isDarkMode ? colors.third : colors.highlightLight,
          }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: isDarkMode ? colors.darkText : colors.lightText }}>
            {selectedDate ? selectedDate.toLocaleDateString() : t("select_date")}
          </Text>
          <Ionicons 
            name="calendar" 
            size={20} 
            color={isDarkMode ? colors.secondary : colors.primary} 
          />
        </TouchableOpacity>
        {selectedDate && (
          <TouchableOpacity onPress={clearDateFilter} style={{ marginLeft: 10 }}>
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={isDarkMode ? colors.secondary : colors.primary} 
            />
          </TouchableOpacity>
        )}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={loadOrders}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { 
                color: isDarkMode ? colors.emptyTextDark : colors.emptyTextLight 
              }]}>
                {t("no_matching_orders")}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
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
  listContainer: {
    paddingBottom: 20,
  },
});

export default ListOfOrdersForSummary;