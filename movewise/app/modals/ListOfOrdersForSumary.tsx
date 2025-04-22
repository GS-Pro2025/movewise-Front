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
} from "react-native";
import { useRouter } from "expo-router";
import { getOrders } from "../../hooks/api/GetOrders";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Function to load orders
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
  }, [loadOrders]);

  const renderItem = ({ item }: { item: Order }) => {
    const formatDate = (dateString: string | null) => {
      if (!dateString) return ""; // Handle null case
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      });
    };

    return (
      <GestureHandlerRootView>
        <TouchableHighlight
          underlayColor="#e0e0e0"
          onPress={() => router.push({ pathname: "./SummaryComponent", params: { order: item.key, key_ref: item.key_ref,customerFName: item.person.first_name, customerLName: item.person.last_name} })}
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
                      item.status === "Pending"
                        ? "#f39c12"
                        : item.status === "Completed"
                        ? "#48dc33"
                        : "#48dc33",
                  },
                ]}
              >
                {item.status}
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
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0458AB" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => `${item.key_ref}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={loadOrders}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {orders.length === 0 ? "No orders available" : "No matching orders found"}
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
});

export default ListOfOrdersForSummary;