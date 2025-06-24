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
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
      {/* Header with search and filters */}
      <View style={styles.headerContainer}>
        {/* Search bar */}
        <View style={[styles.searchContainer, { 
          backgroundColor: isDarkMode ? colors.cardDark : colors.lightBackground,
          borderRadius: 8,
          paddingHorizontal: 10,
          marginBottom: 8,
        }]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={isDarkMode ? colors.secondary : colors.primary} 
          />
          <TextInput
            style={[styles.searchInput, { 
              color: isDarkMode ? colors.darkText : colors.textDark,
              backgroundColor: isDarkMode ? colors.cardDark : colors.lightBackground,
            }]}
            placeholder={t("search_placeholder")}
            placeholderTextColor={isDarkMode ? colors.placeholderDark : colors.placeholderLight}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchText('')}
              style={{ padding: 4 }}
            >
              <Ionicons 
                name="close-circle" 
                size={18} 
                color={isDarkMode ? colors.secondary : colors.primary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Date filter row */}
        <View style={styles.filterRow}>
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              style={[styles.datePickerButton, {
                borderColor: isDarkMode ? colors.borderDark : colors.borderLight,
                backgroundColor: isDarkMode ? colors.cardDark : colors.lightBackground,
              }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ 
                color: isDarkMode ? colors.darkText : colors.textDark,
                marginRight: 8,
              }}>
                {selectedDate ? selectedDate.toLocaleDateString() : t("select_date")}
              </Text>
              <Ionicons 
                name="calendar" 
                size={18} 
                color={isDarkMode ? colors.secondary : colors.primary} 
              />
            </TouchableOpacity>
            {selectedDate && (
              <TouchableOpacity 
                onPress={clearDateFilter} 
                style={{ marginLeft: 8, padding: 4 }}
              >
                <Ionicons 
                  name="close-circle" 
                  size={20} 
                  color={isDarkMode ? colors.secondary : colors.primary} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
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
        <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
          <ActivityIndicator size="large" color={isDarkMode ? colors.secondary : colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1, maxWidth: '100%' }}>
          <FlatList
            data={orders}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContainer, { 
              paddingHorizontal: 5,
              maxWidth: '100%',
            }]}
            refreshing={refreshing}
            onRefresh={loadOrders}
            ListEmptyComponent={
              <View style={[styles.emptyContainer, { 
                backgroundColor: isDarkMode ? colors.third : colors.lightBackground,
              }]}>
                <Ionicons 
                  name="document-text-outline" 
                  size={48} 
                  color={isDarkMode ? colors.placeholderDark : colors.placeholderLight} 
                  style={{ marginBottom: 16 }}
                />
                <Text style={[styles.emptyText, { 
                  color: isDarkMode ? colors.placeholderDark : colors.placeholderLight,
                }]}>
                  {t("no_matching_orders")}
                </Text>
              </View>
            }
            // Performance optimizations
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={50}
            windowSize={11}
            removeClippedSubviews={true}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    maxWidth: 800, // Limit maximum width for larger screens
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Combined header container for search and filters
  headerContainer: {
    padding: 10,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  datePickerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 40,
  },
  // Order item styles
  orderItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxWidth: '100%',
  },
  orderIconContainer: {
    marginRight: 15,
    justifyContent: 'center',
  },
  orderDetails: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  orderRef: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
  },
  orderStatus: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 100,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'right',
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
    color: '#888',
  },
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
  // List container
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
});

export default ListOfOrdersForSummary;