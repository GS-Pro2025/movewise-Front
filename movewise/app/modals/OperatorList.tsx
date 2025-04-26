import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import { ListOperators } from '@/hooks/api/Get_listOperator';
import CreateOperator from './CreateOperator';
import { Operator, FormData } from './CreateOperator/Types';
import { router, useGlobalSearchParams } from 'expo-router';
// Interface for pagination response
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Operator[];
}

const OperatorList = () => {
  const { isEdit } = useGlobalSearchParams<{ isEdit: string }>();
  const isCreating = isEdit === 'false';  // ahora esto sí funciona
  console.log(isCreating)

  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!isCreating) {
      loadOperators();
    }
  }, [isCreating]);

  //open if IsCREATing mode
  useEffect(() => {
    if (isCreating) {
      setModalVisible(true);
    }
  }, [isCreating]);


  const loadOperators = async (page = 1, reset = true) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Assuming your API supports page parameter
      const response = await ListOperators(page);
      // console.log("API Response:", JSON.stringify(response, null, 2));

      // Handle different response structures
      if (response) {
        let newOperators: Operator[] = [];
        let paginationInfo = { ...pagination };

        if (response.results && Array.isArray(response.results)) {
          // Standard pagination structure
          newOperators = response.results;
          paginationInfo = {
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
          };
        } else if (Array.isArray(response)) {
          // Direct array response
          newOperators = response;
          // Without pagination info, we can't determine if there are more pages
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
      console.error('Error loading operators:', error);
      setError('Failed to load operators. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreOperators = () => {
    if (pagination.next && !loadingMore && !loading) {
      loadOperators(currentPage + 1, false);
    }
  };

  // Function to map Operator to FormData
  const mapOperatorToFormData = (op: Operator): FormData => ({
    id_operator: op.id_operator ?? 0,
    first_name: op.first_name ?? '',
    last_name: op.last_name ?? '',
    birth_date: op.birth_date ?? '',
    type_id: op.type_id ?? '',
    id_number: op.id_number != null
      ? String(op.id_number)
      : '',
    address: op.address ?? '',
    phone: op.phone ?? '',
    email: op.email ?? '',
    number_licence: op.number_licence ?? '',
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
    photo: op.photo
      ? { uri: op.photo, name: '', type: '' }
      : null,
    license_front: op.license_front
      ? { uri: op.license_front, name: '', type: '' }
      : null,
    license_back: op.license_back
      ? { uri: op.license_back, name: '', type: '' }
      : null,
    status: op.status ?? '',
  });

  const renderLeftActions = (operator: Operator) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          setSelectedOperator(operator);
          setModalVisible(true);
        }}>
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const handleBackPress = () => {
    if (router && router.back) {
      router.back();
    }
  };

  const renderOperatorItem = ({ item }: { item: Operator }) => (
    <GestureHandlerRootView>
      <Swipeable renderLeftActions={() => renderLeftActions(item)}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => {
            setSelectedOperator(item);
            setModalVisible(true);
          }}
        >
          <View style={styles.avatarContainer}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.noAvatar]}>
                <Text style={styles.avatarText}>
                  {(item.first_name?.[0] || '') + (item.last_name?.[0] || '')}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.operatorInfo}>
            <Text style={styles.operatorName}>{item.first_name} {item.last_name}</Text>
            <Text style={styles.operatorDetail}>{item.type_id} {item.id_number}</Text>
            <Text style={styles.operatorDetail}>
              <Ionicons name="call-outline" size={14} color="#666" /> {item.phone}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: item.status === 'activo' ? '#4CAF50' : '#FF9800' }]} />
              <Text style={styles.statusText}>{item.status || 'N/A'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </GestureHandlerRootView>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3498db" />
        <Text style={styles.footerText}>loading more operators...</Text>
      </View>
    );
  };

  const handleSuccess = () => {
    loadOperators(1, true); 
    setModalVisible(false);
    setSelectedOperator(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Operators</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedOperator(null);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading && operators.length === 0 ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loadingText}>Loading Operators...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Ionicons name="alert-circle-outline" size={50} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadOperators()}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : operators.length === 0 ? (
            <View style={styles.centerContent}>
              <Ionicons name="people-outline" size={50} color="#95a5a6" />
              <Text style={styles.noDataText}>there's no more operators</Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.addFirstText}>Add Operator</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listWrapper}>
              <FlatList
                data={operators}
                keyExtractor={(item, index) => (item.id_operator ? item.id_operator.toString() : index.toString())}
                renderItem={renderOperatorItem}
                contentContainerStyle={styles.listContainer}
                refreshing={loading}
                onRefresh={() => loadOperators(1, true)}
                onEndReached={loadMoreOperators}
                onEndReachedThreshold={0.3}
                ListFooterComponent={renderFooter}
              />
              {/* Pagination info */}
              <View style={styles.paginationInfo}>
                <Text style={styles.paginationText}>
                  show {operators.length} of {pagination.count} Operators
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Modal for Create/Edit Operator */}
        <Modal visible={modalVisible} animationType="slide">
          <CreateOperator
            isEditing={!!selectedOperator}
            initialData={selectedOperator ? mapOperatorToFormData(selectedOperator) : undefined}
            onClose={handleSuccess}
          />
        </Modal>
      </View>
    </SafeAreaView>
  );
}

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
    alignItems: 'flex-end',         // baja los ítems al fondo del header
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 30,                  // más espacio arriba
    paddingBottom: 10,               // menos espacio abajo
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  content: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 60, // Add extra padding at bottom for pagination info
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
});

export default OperatorList;