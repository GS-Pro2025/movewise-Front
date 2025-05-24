import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Image, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import Order, { getOrders } from '../../hooks/api/GetOrders'; // Import the API function
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import colors from '../Colors';
import { useTranslation } from 'react-i18next';

const WorkDailyScreen = () => {
    
  const { t } = useTranslation(); // Hook para traducción
  const router = useRouter();
  const theme = useColorScheme(); // Detect the current theme
  const isDarkMode = theme === 'dark'; // Determine if dark mode is active

  const [orders, setOrders] = useState<Order[]>([]); // State for orders
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [error, setError] = useState<string | null>(null); // State for errors
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page
  const [nextPage, setNextPage] = useState<string | null>(null); // URL for the next page
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false); // State for loading more data
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
        // Replace data for the first page
        setOrders(response);
      } else {
        // Append data for subsequent pages
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
    <View style={[
        styles.itemWrapper,
        { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }
      ]}>
      <TouchableOpacity
        style={[
          styles.itemContainer,
          { backgroundColor: isDarkMode ? colors.third : colors.lightBackground },
        ]}
        onPress={() => handleItemPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? colors.secondary : colors.primary }]}>
          <Image source={require('../../assets/images/box1.png')} style={styles.icon} />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[styles.referenceText, { color: isDarkMode ? colors.darkText : colors.primary }]}
            numberOfLines={1} // Limita a una línea si es posible
            ellipsizeMode="tail" // Muestra "..." si el texto es demasiado largo
          >
            {item.key_ref}
          </Text>
          <Text
            style={[styles.customerName, { color: isDarkMode ? colors.placeholderDark : colors.lightText }]}
            numberOfLines={1} // Limita a una línea si es posible
            ellipsizeMode="tail" // Muestra "..." si el texto es demasiado largo
          >
            {item.person.first_name} {item.person.last_name}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDarkMode ? colors.secondary : colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: isDarkMode ? colors.swipeDelete : colors.primary }]}>
          {error}
        </Text>
      </View>
    );
  }

return (
  <>
    {/* Header and Date Picker */}
    <View style={[styles.header, { backgroundColor: isDarkMode ? colors.header : colors.lightBackground }]}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 1,
          marginLeft: 30,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: isDarkMode ? '#FFF' : colors.primary,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#FFF' : colors.primary }}>←</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("orders")}</Text>

      <View style={styles.dateContainer}>
        <Text style={[styles.selectDateText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
          {t("select_date")}
        </Text>
        <TouchableOpacity
          style={[
            styles.datePickerButton,
            { borderColor: isDarkMode ? colors.secondary : colors.primary },
          ]}
          onPress={() => setDatePickerVisibility(true)}
        >
          <TextInput
            style={[styles.dateText, { color: isDarkMode ? colors.darkText : colors.primary }]}
            value={format(selectedDate, "dd/MM/yyyy")}
            editable={false}
          />
          <Image
            source={require('../../assets/images/calendar.png')}
            style={[styles.calendarIcon, { tintColor: isDarkMode ? colors.secondary : colors.primary }]}
          />
        </TouchableOpacity>
      </View>
    </View>
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground },
      ]}
    >
      <FlatList
        data={orders}
        keyExtractor={(item) => item.key.toString()} // Usa 'key' como clave única
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={loadMoreData} // Activar loadMoreData al llegar al final
        onEndReachedThreshold={0.5} // Activar cuando el 50% de la lista sea visible
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator size="small" color={isDarkMode ? colors.secondary : colors.primary} />
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
  </>
);
};
const styles = StyleSheet.create({
  header: {paddingTop: 20, marginTop: 40},
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 0 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  dateContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  selectDateText: { fontSize: 16, fontWeight: "600", marginRight: 10, paddingHorizontal: 10 },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginHorizontal: 10,
    flex: 1,
  },
  dateText: { flex: 1, fontSize: 16 },
  calendarIcon: { width: 20, height: 20 },
  list: { marginTop: 20, marginBottom: 20, paddingBottom: 20 },
  itemWrapper: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 10,
  },
  iconContainer: {
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  icon: { width: 24, height: 24, tintColor: colors.lightBackground },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16 },
  textContainer: {
    flex: 1,
    flexDirection: "column", // Asegura que los textos se apilen verticalmente
  },
  referenceText: {
    fontSize: 16,
    fontWeight: "bold",
    flexWrap: "wrap", // Permite que el texto se ajuste si es necesario
  },
  customerName: {
    fontSize: 14,
    flexWrap: "wrap", // Permite que el texto se ajuste si es necesario
  },
});
export default WorkDailyScreen;