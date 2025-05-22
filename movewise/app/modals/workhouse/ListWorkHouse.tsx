import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, FlatList, ActivityIndicator, RefreshControl, Alert, SafeAreaView, TextInput } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { TouchableHighlight } from "react-native";
import colors from "@/app/Colors";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import AddWorkhouseForm from "./AddWorkhouseForm";
import { ListWorkHouse } from "@/hooks/api/GetWorkhouse";
import { DeleteOrder } from "@/hooks/api/DeleteOrder";
import InfoOrderModal from "../InfoOrderModal";

interface WorkhouseModalProps {
  visible: boolean;
  onClose: () => void;
}

interface WorkhouseOrder {
  key: string;
  key_ref: string;
  date: string;
  status: string;
  customer_factory: number;
  customer_factory_name: string;
  job: number;
  job_name: string;
  dispatch_ticket?: string;
  weight?: number;
  state_usa?: string;
  evidence?: string;
  person?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
  };
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


const WorkhouseModal: React.FC<WorkhouseModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedOrderInfo, setSelectedOrderInfo] = useState<WorkhouseOrder | null>(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<WorkhouseOrder | null>(null);
  const [orders, setOrders] = useState<WorkhouseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();


  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ListWorkHouse();
      console.log("Respuesta procesada:", response); // Verifica que sea un array

      // Mapea solo si response es un array
      if (Array.isArray(response)) {
        const mappedOrders = response.map((order: any) => ({
          key: order.key,
          key_ref: order.key_ref,
          date: order.date,
          status: order.status,
          customer_factory: order.customer_factory,
          customer_factory_name: order.customer_factory_name,
          job: order.job,
          job_name: order.job_name,
          dispatch_ticket: order.dispatch_ticket_url,
          weight: order.weight,
          state_usa: order.state_usa,
          evidence: order.evidence,
          person: order.person
        }));
        setOrders(mappedOrders);
      } else {
        console.error("La respuesta no es un array:", response);
      }
    } catch (error) {
      console.error("Error detallado:", error);
      Alert.alert(t("error"), t("could_not_load_orders"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
      loadOrders();
  }, [loadOrders]); // Añade loadOrders como dependencia


  const handleDelete = async (key: string) => {
    Alert.alert(
      t("confirm_delete"),
      t("delete_order_confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              await DeleteOrder(key);
              setOrders(prev => prev.filter(order => order.key !== key));
              Toast.show({ type: "success", text1: t("order_deleted") });
            } catch (error) {
              Toast.show({ type: "error", text1: t("delete_error") });
            }
          }
        }
      ]
    );
  };

  const handleEdit = (order: WorkhouseOrder) => {
    setSelectedOrderForEdit(order);
    setEditModalVisible(true);
  };

  const handleViewInfo = (order: WorkhouseOrder) => {
    setSelectedOrderInfo(order);
    setInfoModalVisible(true);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const renderItem = ({ item }: { item: WorkhouseOrder }) => (
    <GestureHandlerRootView>
      <Swipeable
        renderLeftActions={() => (
          <View style={styles.leftSwipeActions}>
            <TouchableOpacity
              style={[styles.editAction, { backgroundColor: colors.primary }]}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="create-outline" size={24} color={colors.darkText} />
              <Text style={styles.actionText}>{t("edit")}</Text>
            </TouchableOpacity>
          </View>
        )}
        renderRightActions={() => (
          <View style={styles.rightSwipeActions}>
            <TouchableOpacity
              style={[styles.deleteAction, { backgroundColor: colors.swipeDelete }]}
              onPress={() => handleDelete(item.key)}
            >
              <Ionicons name="trash-outline" size={24} color={colors.darkText} />
              <Text style={styles.actionText}>{t("delete")}</Text>
            </TouchableOpacity>
          </View>
        )}
      >
        <TouchableHighlight
          underlayColor={isDarkMode ? colors.highlightDark : colors.highlightLight}
          onPress={() => handleViewInfo(item)}
        >
          <View style={[styles.orderItem, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
            <View style={styles.orderIconContainer}>
              <Ionicons
                name="business-outline"
                size={24}
                color={isDarkMode ? colors.secondary : colors.primary}
              />
            </View>
            <View style={styles.orderDetails}>
              <Text style={[styles.orderRef, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                {item.key_ref}
              </Text>
              <Text style={[styles.customerName, { color: isDarkMode ? colors.placeholderDark : colors.lightText }]}>
                {item.customer_factory_name}
              </Text>
            </View>
            <View style={styles.orderStatus}>
              <Text style={[styles.statusText, { color: colors.pendingStatus }]}>
                {t(item.status.toLowerCase())}
              </Text>
              <Text style={[styles.dateText, { color: isDarkMode ? colors.placeholderDark : colors.placeholderLight }]}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={isDarkMode ? colors.placeholderDark : colors.placeholderLight}
              />
            </View>
          </View>
        </TouchableHighlight>
      </Swipeable>
    </GestureHandlerRootView>
  );

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
          {/* Botón de back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDarkMode ? colors.secondary : colors.primary}
            />
          </TouchableOpacity>

          <TextInput
            placeholder={t("search_placeholder")}
            placeholderTextColor={isDarkMode ? colors.placeholderDark : colors.placeholderLight}
            style={[styles.searchInput, { color: isDarkMode ? colors.darkText : colors.primary }]}
            value={searchText}
            onChangeText={setSearchText}
          />

          <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addButton}>
            <Ionicons
              name="add-circle-outline"
              size={34}
              color={isDarkMode ? colors.secondary : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={orders.filter(order =>
              order.key_ref.toLowerCase().includes(searchText.toLowerCase()) ||
              order.customer_factory_name.toLowerCase().includes(searchText.toLowerCase())
            )}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="sad-outline" size={40} color={colors.primary} />
                <Text style={[styles.emptyText, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
                  {t("no_workhouse_orders")}
                </Text>
              </View>
            }
            contentContainerStyle={orders.length === 0 ? styles.emptyListContainer : undefined}
          />
        )}

        {/* Modal para agregar nuevo workhouse */}
        <AddWorkhouseForm
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSuccess={() => {
            loadOrders();
            setAddModalVisible(false);
          }}
        />

        {/* Modal para editar workhouse */}
        <AddWorkhouseForm
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedOrderForEdit(null);
          }}
          onSuccess={() => {
            loadOrders();
            setEditModalVisible(false);
            setSelectedOrderForEdit(null);
          }}
          editOrder={selectedOrderForEdit}
        />

        <InfoOrderModal
          visible={infoModalVisible}
          onClose={() => {
            setInfoModalVisible(false);
            setSelectedOrderInfo(null);
          }}
          order={selectedOrderInfo}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingTop: 30,
    marginBottom: -5,
    borderBottomWidth: 2,
    width: "100%",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginHorizontal: 10,
  },
  addButton: {
    padding: 4,
    marginLeft: 10,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  plus: { fontSize: 24, fontWeight: "bold" },
  buttonContainer: { flexDirection: "row", justifyContent: "center", gap: 120, marginTop: 20 },
  backButtonText: { color: "#FFF", fontWeight: "bold" },
  saveButtonText: { fontWeight: "bold" },
  datePickerContainer: {},
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
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
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
  emptyListContainer: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
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
  infoIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  rightSwipeActions: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '92%',
    width: 100,
    marginVertical: 4,
    marginRight: 16,
    borderRadius: 8,
  },
  leftSwipeActions: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '92%',
    width: 100,
    marginVertical: 4,
    marginLeft: 16,
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
  documentIcon: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
});

export default WorkhouseModal;