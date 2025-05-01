import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import Order, { getOrders } from '../../hooks/api/GetOrders'; // Import the API function
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const WorkDailyScreen = () => {
  const { t } = useTranslation(); // Hook para traducción
  const router = useRouter(); 
  const [orders, setOrders] = useState<Order[]>([]); // Estado para las órdenes
  const [loading, setLoading] = useState<boolean>(true); // Estado para la carga
  const [error, setError] = useState<string | null>(null); // Estado para los errores
  const [currentPage, setCurrentPage] = useState<number>(1); // Página actual
  const [nextPage, setNextPage] = useState<string | null>(null); // URL para la siguiente página
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false); // Estado para cargar más datos

  // Estados para el selector de fecha
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // Estado para la visibilidad del selector de fecha
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Estado para la fecha seleccionada

  // Obtener datos de las órdenes
  const fetchOrdersData = async (page: number = 1) => {
    if (page === 1) setLoading(true);
    setError(null);
    try {
      const response = await getOrders(); // Obtener órdenes
      console.log(t("api_response"), response);

      if (page === 1) {
        // Reemplazar datos para la primera página
        setOrders(response);
      } else {
        // Agregar datos para páginas posteriores
        setOrders((prev) => [...prev, ...response]);
      }

      // Actualizar la URL de la siguiente página (si aplica)
      setNextPage(null); // Suponiendo que la paginación no está implementada aún
    } catch (err) {
      console.error(t("error_fetching_orders"), err);

      // Manejar error de página inválida
      if ((err as any)?.response?.status === 404) {
        Toast.show({
          type: "info",
          text1: t("no_more_data"),
          text2: t("no_more_orders_to_load"),
        });
        setNextPage(null); // Detener más paginación
      } else {
        setError(t("failed_to_load_orders"));
        Alert.alert(t("error"), t("could_not_load_orders"));
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
        text1: t("no_more_data"),
        text2: t("no_more_orders_to_load"),
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
    fetchOrdersData(1); // Cargar la primera página al montar
  }, []);

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date); // Actualizar la fecha seleccionada
    setDatePickerVisibility(false); // Ocultar el selector de fecha
  };

  const handleItemPress = (item: Order) => {
    console.log(t("pressed_item"), item);
    router.push({
      pathname: "./ExtraCostScreen", // Ruta de la pantalla de destino
      params: {
        key: item.key, // Pasar el parámetro key
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
      <Text style={styles.title}>{t("orders")}</Text>

      <View style={styles.dateContainer}>
        <Text style={styles.selectDateText}>{t("select_date")}</Text>
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
        onEndReached={loadMoreData} // Activar loadMoreData al llegar al final
        onEndReachedThreshold={0.5} // Activar cuando el 50% de la lista sea visible
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