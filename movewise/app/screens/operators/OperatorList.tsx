import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, useColorScheme, Image, ActivityIndicator, SafeAreaView, Alert, TextInput, Platform } from 'react-native';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import { ListOperators } from '@/hooks/api/Get_listOperator';
import { SoftDeleteOperator } from '@/hooks/api/SoftDeleteOperator';
import CreateOperator from './CreateOperator';
import InfoOperatorModal from './InfoOperatorModal';
import { Operator, FormData } from '@/types/operator.types';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import colors from '@/app/Colors';

// Interface for pagination response
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Operator[];
}

const OperatorList = ({ isEdit, onClose }: { isEdit: string, onClose: () => void }) => {
  const { t } = useTranslation();
  const isCreating = isEdit === 'false';
  console.log(isCreating);

  // Estados existentes
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nuevos estados para el filtro
  const [allOperators, setAllOperators] = useState<Operator[]>([]); // Todos los operadores cargados
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]); // Operadores filtrados
  const [searchQuery, setSearchQuery] = useState<string>(''); // Texto de búsqueda
  const [isSearching, setIsSearching] = useState(false); // Estado de búsqueda activa
  const [loadingAllData, setLoadingAllData] = useState(false); // Cargando todos los datos
  const [allDataLoaded, setAllDataLoaded] = useState(false); // Si ya se cargaron todos los datos

  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  }>({
    count: 0,
    next: null,
    previous: null,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeSwipeable, setActiveSwipeable] = useState<Swipeable | null>(null);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    if (!isCreating) {
      loadOperators();
    }
  }, [isCreating]);

  useEffect(() => {
    if (isCreating) {
      setModalVisible(true);
    }
  }, [isCreating]);

  // Efecto para filtrar operadores cuando cambia el texto de búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setIsSearching(false);
      setFilteredOperators([]);
    } else {
      setIsSearching(true);
      if (allDataLoaded) {
        filterOperators(searchQuery);
      } else {
        // Si no tenemos todos los datos, cargarlos primero
        loadAllOperators().then(() => {
          filterOperators(searchQuery);
        });
      }
    }
  }, [searchQuery, allDataLoaded]);

  const loadOperators = async (page = 1, reset = true) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await ListOperators(page);

      if (response) {
        let newOperators: Operator[] = [];
        let paginationInfo = { ...pagination };

        if (response.results && Array.isArray(response.results)) {
          newOperators = response.results;
          paginationInfo = {
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
          };
        } else if (Array.isArray(response)) {
          newOperators = response;
          paginationInfo = {
            count: response.length,
            next: null,
            previous: null,
          };
        }

        setPagination(paginationInfo);

        if (reset) {
          setOperators(newOperators);
        } else {
          setOperators(prev => [...prev, ...newOperators]);
        }

        setCurrentPage(page);
        setError(null);
      }
    } catch (error) {
      console.error(t("error_loading_operators"), error);
      setError(t("could_not_load_operators"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Nueva función para cargar todos los operadores de todas las páginas
  const loadAllOperators = async (): Promise<void> => {
    if (allDataLoaded || loadingAllData) {
      return;
    }

    try {
      setLoadingAllData(true);
      let allOps: Operator[] = [];
      let currentPageNum = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await ListOperators(currentPageNum);

        if (response) {
          let pageOperators: Operator[] = [];

          if (response.results && Array.isArray(response.results)) {
            pageOperators = response.results;
            hasMorePages = !!response.next;
          } else if (Array.isArray(response)) {
            pageOperators = response;
            hasMorePages = false; // Sin paginación
          }

          allOps = [...allOps, ...pageOperators];
          currentPageNum++;

          // Evitar bucle infinito
          if (currentPageNum > 100) {
            console.warn('Deteniendo carga después de 100 páginas');
            break;
          }
        } else {
          hasMorePages = false;
        }
      }

      setAllOperators(allOps);
      setAllDataLoaded(true);
    } catch (error) {
      console.error('Error loading all operators:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: t("error"),
        textBody: t("error_loading_all_operators"),
        autoClose: 3000,
      });
    } finally {
      setLoadingAllData(false);
    }
  };

  // Función para filtrar operadores por nombre
  const filterOperators = (query: string) => {
    if (!query.trim()) {
      setFilteredOperators([]);
      return;
    }

    const lowercaseQuery = query.toLowerCase().trim();
    const filtered = allOperators.filter(operator => {
      const fullName = `${operator.first_name || ''} ${operator.last_name || ''}`.toLowerCase();
      const firstName = (operator.first_name || '').toLowerCase();
      const lastName = (operator.last_name || '').toLowerCase();

      return fullName.includes(lowercaseQuery) ||
        firstName.includes(lowercaseQuery) ||
        lastName.includes(lowercaseQuery);
    });

    setFilteredOperators(filtered);
  };

  const loadMoreOperators = () => {
    if (pagination.next && !loadingMore && !loading && !isSearching) {
      loadOperators(currentPage + 1, false);
    }
  };

  // Función para limpiar la búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setFilteredOperators([]);
  };

  // Función mapOperatorToFormData permanece igual
  const mapOperatorToFormData = (op: Operator): FormData => ({
    id_operator: op.id_operator ?? 0,
    first_name: op.first_name ?? '',
    last_name: op.last_name ?? '',
    birth_date: op.birth_date ?? '',
    type_id: op.type_id ?? '',
    id_number: op.id_number != null ? String(op.id_number) : '',
    address: op.address ?? '',
    phone: op.phone ?? '',
    email: op.email ?? '',
    number_licence: op.number_licence ?? '',
    zipcode: op.zipcode ?? '',
    code: op.code ?? '',
    has_minors: Array.isArray(op.sons) && op.sons.length > 0,
    n_children: op.n_children ?? 0,
    sons: Array.isArray(op.sons)
      ? op.sons.map(son => ({
        name: son.name ?? '',
        birth_date: son.birth_date ?? '',
        gender: son.gender ?? 'M',
      }))
      : [],
    salary: op.salary ?? '',
    size_t_shift: op.size_t_shift ?? '',
    name_t_shift: op.name_t_shift ?? '',
    photo: op.photo ? { uri: op.photo, name: '', type: '' } : null,
    license_front: op.license_front ? { uri: op.license_front, name: '', type: '' } : null,
    license_back: op.license_back ? { uri: op.license_back, name: '', type: '' } : null,
    status: op.status ?? '',
  });

  const handleSoftDelete = async (operatorId: number) => {
    try {
      if (activeSwipeable) {
        activeSwipeable.close();
        setActiveSwipeable(null);
      }

      Alert.alert(
        t("delete_operator"),
        t("delete_operator_confirmation"),
        [
          {
            text: t("cancel"),
            style: "cancel"
          },
          {
            text: t("delete"),
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true);

                const response = await SoftDeleteOperator(operatorId);

                Alert.alert(
                  t("success"),
                  t("operator_deleted_successfully"),
                  [{ text: t("ok") }]
                );

                // Refrescar listas
                loadOperators();
                if (allDataLoaded) {
                  setAllDataLoaded(false); // Forzar recarga de todos los datos
                }
                if (isSearching) {
                  setSearchQuery(''); // Limpiar búsqueda
                }
              } catch (error) {
                console.error('Error deleting operator:', error);
                Alert.alert(
                  t("error"),
                  t("failed_to_delete_operator"),
                  [{ text: t("ok") }]
                );
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in delete handler:', error);
      Alert.alert(
        t("error"),
        t("an_unexpected_error_occurred"),
        [{ text: t("ok") }]
      );
    }
  };

  const renderLeftActions = (operator: Operator) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          setSelectedOperator(operator);
          setModalVisible(true);
        }}
      >
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderRightActions = (operator: Operator) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          if (operator.id_operator) {
            handleSoftDelete(operator.id_operator);
          }
        }}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const handleBackPress = () => {
    if (onClose) {
      onClose();
    } else if (router && router.canGoBack()) {
      router.back();
    }
  };

  const handleViewOperator = (operator: Operator) => {
    setSelectedOperator(operator);
    setInfoModalVisible(true);
  };

  const handleEditOperator = (operator: Operator) => {
    setSelectedOperator(operator);
    setModalVisible(true);
  };

  const renderOperatorItem = ({ item }: { item: Operator }) => {
    let swipeableRef: Swipeable | null = null;

    return (
      <GestureHandlerRootView style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
        <Swipeable
          ref={ref => {
            swipeableRef = ref;
          }}
          renderLeftActions={() => renderLeftActions(item)}
          renderRightActions={() => renderRightActions(item)}
          onSwipeableOpen={() => {
            if (activeSwipeable && activeSwipeable !== swipeableRef) {
              activeSwipeable.close();
            }
            if (swipeableRef) {
              setActiveSwipeable(swipeableRef);
            }
          }}
        >
          <TouchableOpacity
            style={[styles.listItem, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight, borderColor: isDarkMode ? colors.textLight : colors.textDark }]}
            onPress={() => handleViewOperator(item)}
          >
            <View style={[styles.avatarContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.noAvatar]}>
                  <Text style={[styles.avatarText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                    {(item.first_name?.[0] || '') + (item.last_name?.[0] || '')}
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.operatorInfo, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
              <Text style={[styles.operatorName, { color: isDarkMode ? colors.darkText : colors.primary }]}>{item.first_name} {item.last_name}</Text>
              <Text style={[styles.operatorDetail, { color: isDarkMode ? colors.darkText : colors.primary }]}>{item.type_id} {item.id_number}</Text>
              <Text style={[styles.operatorDetail, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                <Ionicons name="call-outline" size={14} color="#666" /> {item.phone}
              </Text>
              <View style={[styles.statusContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                <View style={[styles.statusIndicator, { backgroundColor: item.status === 'activo' ? '#4CAF50' : '#FF9800' }]} />
                <Text style={[styles.statusText, { color: isDarkMode ? colors.darkText : colors.primary }]}>{item.status || t("not_available")}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  const renderFooter = () => {
    if (isSearching || !loadingMore) return null;

    return (
      <View style={[styles.footerLoader, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
        <ActivityIndicator size="small" color="#3498db" />
        <Text style={[styles.footerText, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("loading_more_operators")}</Text>
      </View>
    );
  };

  const handleSuccess = () => {
    loadOperators(1, true);
    setModalVisible(false);
    setSelectedOperator(null);
    // Invalidar datos cargados para forzar recarga en próxima búsqueda
    setAllDataLoaded(false);
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: t("success"),
      textBody: t("operator_saved_successfully"),
      autoClose: 3000,
    });
    setTimeout(() => setSuccessModalVisible(true), 400);
  };

  // Determinar qué datos mostrar
  const displayData = isSearching ? filteredOperators : operators;
  const showingSearchResults = isSearching && searchQuery.trim() !== '';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
      <View style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("operators")}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedOperator(null);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color={isDarkMode ? colors.darkText : colors.lightBackground} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
          <View style={[styles.searchInputContainer, { backgroundColor: isDarkMode ? colors.third : '#f5f5f5', borderColor: isDarkMode ? colors.darkText : '#ddd' }]}>
            <Ionicons name="search-outline" size={20} color={isDarkMode ? colors.darkText : colors.primary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? colors.darkText : colors.primary }]}
              placeholder={t("search_by_name")}
              placeholderTextColor={isDarkMode ? colors.darkText : colors.primary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? colors.darkText : '#666'} />
              </TouchableOpacity>
            )}
          </View>
          {loadingAllData && (
            <View style={styles.searchLoadingContainer}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={[styles.searchLoadingText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                {t("loading_all_data")}
              </Text>
            </View>
          )}
        </View>

        {/* Search Results Info */}
        {showingSearchResults && (
          <View style={[styles.searchResultsInfo, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
            <Text style={[styles.searchResultsText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
              {filteredOperators.length} {t("results_for")} "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Content */}
        <View style={[styles.content, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
          {loading && operators.length === 0 ? (
            <View style={[styles.centerContent, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
              <ActivityIndicator size="large" color={isDarkMode ? colors.third : colors.lightBackground} />
              <Text style={[styles.loadingText, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("loading_operators")}</Text>
            </View>
          ) : error ? (
            <View style={[styles.centerContent, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
              <Ionicons name="alert-circle-outline" size={50} color={isDarkMode ? colors.third : colors.lightBackground} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadOperators()}>
                <Text style={styles.retryText}>{t("retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : displayData.length === 0 ? (
            <View style={[styles.centerContent, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
              <Ionicons name="people-outline" size={50} color={isDarkMode ? colors.third : colors.lightBackground} />
              <Text style={[styles.noDataText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                {showingSearchResults ? t("no_operators_found") : t("no_operators_available")}
              </Text>
              {!showingSearchResults && (
                <TouchableOpacity
                  style={styles.addFirstButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addFirstText}>{t("add_operator")}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={[styles.listWrapper, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
              <FlatList
                style={{ backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }}
                data={displayData}
                keyExtractor={(item, index) => (item.id_operator ? item.id_operator.toString() : index.toString())}
                renderItem={renderOperatorItem}
                contentContainerStyle={styles.listContainer}
                refreshing={loading}
                onRefresh={() => {
                  loadOperators(1, true);
                  if (isSearching) {
                    setAllDataLoaded(false);
                  }
                }}
                onEndReached={loadMoreOperators}
                onEndReachedThreshold={0.3}
                ListFooterComponent={renderFooter}
              />
              {/* Pagination info */}
              {!isSearching && (
                <View style={styles.paginationInfo}>
                  <Text style={styles.paginationText}>
                    {t("showing")} {operators.length} {t("of")} {pagination.count} {t("operators")}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Modal for Create/Edit Operator */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <CreateOperator
            isEditing={!!selectedOperator}
            initialData={selectedOperator ? mapOperatorToFormData(selectedOperator) : undefined}
            onClose={() => {
              setModalVisible(false);
              loadOperators(1, true);
              setSelectedOperator(null);
              // Invalidar datos para forzar recarga en próxima búsqueda
              setAllDataLoaded(false);
            }}
          />
        </Modal>

        <InfoOperatorModal
          visible={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
          operator={selectedOperator}
          onEdit={() => {
            setInfoModalVisible(false);
            handleEditOperator(selectedOperator!);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 2,
    height: Platform.OS === 'ios' ? 50 : 40,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: Platform.OS === 'ios' ? 40 : 'auto',
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
  },
  clearButton: {
    padding: 5,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  searchLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  searchResultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 60,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  noAvatar: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  operatorDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    color: '#e74c3c',
    textAlign: 'center',
  },
  noDataText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addFirstButton: {
    marginTop: 16,
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  swipeActions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginVertical: 6,
  },
  editButton: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '90%',
    borderRadius: 8,
    left: 15,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  footerText: {
    marginLeft: 8,
    color: '#666',
  },
  paginationInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paginationText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
});

export default OperatorList;