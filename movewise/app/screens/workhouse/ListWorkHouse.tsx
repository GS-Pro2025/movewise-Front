//este modal se creo para listar todos los workhouse, activos e inactivos, es el modal principal que une
//el homeOperator con las vista de administracion de Work house
import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, FlatList, ActivityIndicator, RefreshControl, Alert, SafeAreaView, TextInput, SectionList } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { TouchableHighlight } from "react-native";
import colors from "@/app/Colors";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import AddWorkhouseForm from "./AddWorkhouseForm";
import { ListWorkHouse, WorkHouseResponse } from "@/hooks/api/GetWorkhouse";
import { DeleteOrder } from "@/hooks/api/DeleteOrder";
import EditWorkhouseForm from "./EditWorkhouseForm";
import InfoOrderModal from "../orders/InfoOrderModal"

interface WorkhouseModalProps {
  visible: boolean;
  onClose: () => void;
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
  const [selectedOrderInfo, setSelectedOrderInfo] = useState<Order | null>(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  const handleOpenAssignmentScreen = (order: Order) => {
    // Cerramos el modal actual
    onClose();

    // Navegamos después de un pequeño retraso para asegurar el desmontaje
    setTimeout(() => {
      router.push({
        pathname: '/freelance-assignment',
        params: { workhouseKey: order.key }
      });
    }, 50);
  };

  const loadOrders = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    try {
      // console.log(`Loading orders, page: ${page}, isRefresh: ${isRefresh}`);

      if (page === 1) {
        setLoading(true);
        setOrders([]); // Clear existing orders on refresh
      } else {
        setLoadingMore(true);
      }

      const response: WorkHouseResponse = await ListWorkHouse(page);
      // console.log('Workhouse API response:', response);

      if (response && Array.isArray(response.results)) {
        const mappedOrders = response.results.map((order: any) => ({
          key: order.key,
          key_ref: order.key_ref,
          date: order.date,
          distance: order.distance,
          expense: order.expense,
          income: order.income,
          weight: order.weight,
          status: order.status,
          payStatus: order.payStatus,
          state_usa: order.state_usa,
          person: order.person,
          job: order.job,
          job_name: order.job_name,
          evidence: order.evidence,
          dispatch_ticket: order.dispatch_ticket,
          customer_factory: order.customer_factory,
          customer_factory_name: order.customer_factory_name,
        }));

        setOrders(prev => isRefresh ? mappedOrders : [...prev, ...mappedOrders]);
        setTotalCount(response.count || 0);
        setHasNextPage(!!response.next);
        setCurrentPage(page);
      } else {
        console.error('Unexpected response format:', response);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Received unexpected data format from server',
        });
      }
    } catch (error) {
      console.error('Error loading workhouses:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load workhouses. Please try again.',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  // useEffect(() => {
  //   console.log('ListWorkHouse state:', {
  //     loading,
  //     loadingMore,
  //     refreshing,
  //     ordersCount: orders.length,
  //     currentPage,
  //     hasNextPage,
  //     totalCount,
  //   });
  // }, [loading, loadingMore, refreshing, orders.length, currentPage, hasNextPage, totalCount]);

  // Initial load
  useEffect(() => {
    // console.log('Workhouse modal became visible, loading data...');
    loadOrders(1, true);
  }, [loadOrders]);

  const loadMoreOrders = useCallback(async () => {
    if (!loadingMore && hasNextPage) {
      await loadOrders(currentPage + 1);
    }
  }, [loadOrders, currentPage, hasNextPage, loadingMore]);

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
              // Recargar desde la primera página para mantener consistencia
              loadOrders(1, true);
            } catch (error) {
              Toast.show({ type: "error", text1: t("delete_error") });
            }
          }
        }
      ]
    );
  };

  const handleEdit = (order: Order) => {
    setSelectedOrderForEdit(order);
    setEditModalVisible(true);
  };

  const handleViewInfo = (order: Order) => {
    setSelectedOrderInfo(order);
    setInfoModalVisible(true);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasNextPage(true);
    await loadOrders(1, true);
    setRefreshing(false);
  }, [loadOrders]);

  const renderItem = ({ item }: { item: Order }) => {
    const isInactive = item.status.toLowerCase() === 'inactive';

    return (
      <GestureHandlerRootView>
        <Swipeable
          renderLeftActions={isInactive ? undefined : () => (
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
          renderRightActions={isInactive ? undefined : () => (
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
                <Text style={[styles.statusText, {
                  color: item.status.toLowerCase() === 'inactive'
                    ? colors.warning
                    : item.status.toLowerCase() === 'pending'
                      ? colors.completedStatus
                      : colors.pendingStatus
                }]}>
                  {t(item.status.toLowerCase())}
                </Text>
                <Text style={[styles.dateText, { color: isDarkMode ? colors.placeholderDark : colors.placeholderLight }]}>
                  {item.date}
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
    )
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }]}>
      <Text style={[styles.sectionHeaderText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
        {section.title}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingMoreText, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
          {t("loading_more")}...
        </Text>
      </View>
    );
  };

  const handleEndReached = () => {
    // console.log('handleEndReached llamado:', { hasNextPage, loadingMore, loading });
    if (hasNextPage && !loadingMore && !loading && orders.length > 0) {
      // console.log('Cargando más órdenes...');
      loadMoreOrders();
    }
  };

  const filteredSections = () => {
    const searchLower = searchText.toLowerCase();

    // Primero filtramos por búsqueda
    const filtered = orders.filter(order =>
      order.key_ref.toLowerCase().includes(searchLower) ||
      (order.customer_factory_name?.toLowerCase() || '').includes(searchLower)
    );

    // Luego separamos en activos e inactivos
    const active = filtered.filter(order => order.status?.toLowerCase() !== 'inactive');
    const inactive = filtered.filter(order => order.status?.toLowerCase() === 'inactive');

    const sections = [];

    // Solo mostramos la sección de activos si hay resultados o si no hay búsqueda
    if (active.length > 0 || searchText === '') {
      sections.push({
        title: t('active_orders'),
        data: active,
        key: 'active'
      });
    }

    // Solo mostramos inactivos si hay resultados
    if (inactive.length > 0) {
      sections.push({
        title: t('inactive_orders'),
        data: inactive,
        key: 'inactive'
      });
    }

    return sections;
  };

  const keyExtractor = (item: any, index: number) => {
    return `${item.key}_${index}`; // Aseguramos una clave única
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground }]}>
      <View style={[styles.headerContainer, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}>
        <View style={styles.headerTopRow}>

          <Text style={[styles.headerTitle, { color: isDarkMode ? colors.darkText : colors.primary }]}>
            {t("workhouse")} ({totalCount})
          </Text>

          <View style={styles.emptySpace} />
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder={t("search_placeholder")}
            placeholderTextColor={isDarkMode ? colors.placeholderDark : colors.placeholderLight}
            style={[styles.searchInput, {
              backgroundColor: isDarkMode ? colors.darkBackground : '#f5f5f5',
              color: isDarkMode ? colors.darkText : colors.primary
            }]}
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
            style={styles.addButton}
          >
            <Ionicons
              name="add-circle-outline"
              size={34}
              color={isDarkMode ? colors.secondary : colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <SectionList
          sections={filteredSections()}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
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
          handleRefresh(); // Usar handleRefresh en lugar de loadOrders
          setAddModalVisible(false);
        }}
      />

      {/* Modal para editar workhouse */}
      <EditWorkhouseForm
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={() => {
          handleRefresh(); // Usar handleRefresh en lugar de loadOrders
          setEditModalVisible(false);
        }}
        order={selectedOrderForEdit}
        onOpenAssignment={handleOpenAssignmentScreen}
      />

      <InfoOrderModal
        visible={infoModalVisible}
        isWorkhouse={true}
        userRole={"admin"}
        onClose={() => {
          setInfoModalVisible(false);
          setSelectedOrderInfo(null);
        }}
        order={selectedOrderInfo}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  emptySpace: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  addButton: {
    padding: 4,
  },
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
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
  },
});

export default WorkhouseModal;