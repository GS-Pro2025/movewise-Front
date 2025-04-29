import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import Order, { getOrders } from '../../hooks/api/GetOrders'; // Import the API function
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

const WorkDailyScreen = () => {
    const router = useRouter(); 
    const [orders, setOrders] = useState<Order[]>([]); // State for orders
    const [loading, setLoading] = useState<boolean>(true); // State for loading
    const [error, setError] = useState<string | null>(null); // State for errors
    const [currentPage, setCurrentPage] = useState<number>(1); // Current page
    const [nextPage, setNextPage] = useState<string | null>(null); // URL for the next page
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false); // State for loading more data

    // Estados para el selector de fecha
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // Estado para la visibilidad del selector de fecha
    const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Estado para la fecha seleccionada

    // Fetch orders data
    const fetchOrdersData = async (page: number = 1) => {
        if (page === 1) setLoading(true);
        setError(null);
        try {
        const response = await getOrders(); // Fetch orders
        console.log("API Response:", response);

        if (page === 1) {
            // Replace data for the first page
            setOrders(response);
        } else {
            // Append data for subsequent pages
            setOrders((prev) => [...prev, ...response]);
        }

        // Update the next page URL (if applicable)
        setNextPage(null); // Assuming pagination is not implemented yet
        } catch (err) {
        console.error("Error fetching orders:", err);

        // Handle invalid page error
        if ((err as any)?.response?.status === 404) {
            Toast.show({
            type: "info",
            text1: "No More Data",
            text2: "There is no more orders to load.",
            });
            setNextPage(null); // Stop further pagination
        } else {
            setError("Failed to load orders.");
            Alert.alert("Error", "Could not load orders.");
        }
        } finally {
        if (page === 1) setLoading(false);
        setIsLoadingMore(false);
        }
    };

  const loadMoreData = () => {
    if (!nextPage) {
      Toast.show({
        type: "info",
        text1: "No More Data",
        text2: "There is no more orders to load.",
      });
      return;
    }

    if (!isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage((prevPage) => prevPage + 1);
      fetchOrdersData(currentPage + 1);
    }
  };

  useEffect(() => {
    fetchOrdersData(1); // Load the first page on mount
  }, []);

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date); // Actualiza la fecha seleccionada
    setDatePickerVisibility(false); // Oculta el selector de fecha
  };
  const handleItemPress = (item: Order) => {
    console.log("Pressed item:", item);
    router.push({
      pathname: "./ExtraCostScreen", // Ruta de la pantalla de destino
      params: {
        key: item.key, // Pasa el parámetro key
      },
    });
  };
  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemPress(item)}>
      <View style={styles.iconContainer}>
        <Image source={require('../../assets/images/box1.png')} style={styles.icon} />
      </View>
      <Text style={styles.referenceText}>{item.key_ref}</Text>
      <Text style={styles.customerName}>
        {item.person.first_name} {item.person.last_name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004080" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>

      <View style={styles.dateContainer}>
        <Text style={styles.selectDateText}>Select Date</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setDatePickerVisibility(true)}>
          <TextInput
            style={styles.dateText}
            value={format(selectedDate, "dd/MM/yyyy")}
            editable={false}
          />
          <Image source={require('../../assets/images/calendar.png')} style={styles.calendarIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.key.toString()} // Usa 'key' como clave única
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={loadMoreData} // Trigger loadMoreData when reaching the end
        onEndReachedThreshold={0.5} // Trigger when 50% of the list is visible
        ListFooterComponent={
            isLoadingMore ? (
            <ActivityIndicator size="small" color="#004080" />
            ) : null
        }
        />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", color: "#004080", marginBottom: 10 },
  dateContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  selectDateText: { fontSize: 16, fontWeight: "600", color: "#004080", marginRight: 10 },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#004080",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flex: 1,
  },
  dateText: { flex: 1, fontSize: 16, color: "#004080" },
  calendarIcon: { width: 20, height: 20, tintColor: "#004080" },
  list: { marginTop: 20 },
  itemContainer: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  iconContainer: {
    backgroundColor: "#004080",
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  icon: { width: 24, height: 24, tintColor: "#fff" },
  referenceText: { fontSize: 16, color: "#004080", flex: 1 },
  customerName: { fontSize: 14, color: "#333" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red" },
});

export default WorkDailyScreen;