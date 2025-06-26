import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { ListOperatorsAndFreelances } from '@/hooks/api/Get_operators_and_freelances';

interface Operator {
  id_operator: number;
  code: string;
  first_name: string;
  last_name: string;
  id_number: string;
  type_id: string;
  photo: string | null;
  salary: string;
  status: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
}

interface AddOperatorFormProps {
  visible: boolean;
  onClose: () => void;
  onAddOperators: (operators: any[]) => void;
  orderKey: string;
  assignedOperatorIds: number[];
}

export default function AddOperatorForm({ visible, onClose, onAddOperators, orderKey, assignedOperatorIds = [] }: AddOperatorFormProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [operators, setOperators] = useState<Operator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedOperators, setSelectedOperators] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedOperators(new Set());
    }
  }, [visible]);


  const toggleOperatorSelection = (operatorId: number) => {
    setSelectedOperators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(operatorId)) {
        newSet.delete(operatorId);
      } else {
        newSet.add(operatorId);
      }
      return newSet;
    });
  };

  // Cargar operadores
  const fetchOperators = async (pageNumber = 1, reset = false) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      console.log(`Fetching operators, page: ${pageNumber}`);
      const response = await ListOperatorsAndFreelances(pageNumber);

      if (!response || !response.results) {
        throw new Error('Invalid response format from server');
      }

      const newOperators = response.results || [];
      if (reset || pageNumber === 1) {
        setOperators(newOperators);
      } else {
        setOperators(prev => [...prev, ...newOperators]);
      }

      setHasMore(!!response.next);
      setPage(pageNumber);
    } catch (error: any) {
      console.error('Error fetching operators:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          headers: error.config?.headers
        }
      });

      let errorMessage = t('error_fetching_operators') || 'Error al cargar operadores';

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }

      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Filtrar operadores por término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOperators(operators);
    } else {
      const filtered = operators.filter(operator => {
        const fullName = `${operator.first_name || ''} ${operator.last_name || ''}`.toLowerCase();
        const idNumber = (operator.id_number || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        return fullName.includes(search) || idNumber.includes(search);
      });
      setFilteredOperators(filtered);
    }
  }, [searchTerm, operators]);

  // Cargar operadores al abrir el modal
  useEffect(() => {
    if (visible) {
      fetchOperators(1, true);
      setSearchTerm('');
    }
  }, [visible]);

  const handleAddSelectedOperators = () => {
    if (selectedOperators.size === 0) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('no_operators_selected') || 'Selecciona al menos un operador',
      });
      return;
    }

    setAdding(true);

    try {
      // Obtener los operadores seleccionados
      const selected = operators.filter(op => selectedOperators.has(op.id_operator));

      // Crear la lista en el formato esperado por el padre
      const operatorsToAdd = selected.map(operator => ({
        id_operator: operator.id_operator,
        name: `${operator.first_name} ${operator.last_name}`,
      }));

      // Llamar a la función del padre con todos los operadores
      if (onAddOperators) {
        onAddOperators(operatorsToAdd);
      }

      Toast.show({
        type: 'success',
        text1: t('operators_added'),
        text2: t('operators_added_message', { count: selected.length }),
      });

      // Cerrar el modal después de agregar
      onClose();
    } catch (error) {
      console.error('Error adding operators:', error);
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('error_adding_operators') || 'Error al agregar operadores',
      });
    } finally {
      setAdding(false);
    }
  };

  // Cargar más operadores
  const loadMoreOperators = () => {
    if (hasMore && !loadingMore) {
      fetchOperators(page + 1);
    }
  };

  const handleClose = () => {
    setSelectedOperators(new Set());
    onClose(); // Call the parent's onClose handler
  };

  // Renderizar item de operador
  const renderOperatorItem = ({ item }: { item: Operator }) => {
    const isSelected = selectedOperators.has(item.id_operator);
    const isAssigned = assignedOperatorIds.includes(item.id_operator);

    return (
      <TouchableOpacity
        style={[
          styles.operatorItem,
          {
            backgroundColor: isAssigned
              ? (colorScheme === 'dark' ? '#2d3748' : '#e5e7eb')
              : isSelected
                ? (colorScheme === 'dark' ? '#2d3748' : '#ebf8ff')
                : (colorScheme === 'dark' ? '#1e293b' : '#f8fafc'),
            borderColor: isAssigned
              ? (colorScheme === 'dark' ? '#64748b' : '#d1d5db')
              : isSelected
                ? (colorScheme === 'dark' ? '#4ade80' : '#38b2ac')
                : (colorScheme === 'dark' ? '#334155' : '#e5e7eb'),
            borderWidth: 2,
            opacity: isAssigned ? 0.6 : 1,
          }
        ]}
        onPress={() => {
          if (!isAssigned) {
            toggleOperatorSelection(item.id_operator);
          }
        }}
        disabled={isAssigned}
      >
        <View style={styles.operatorInfo}>
          <View style={styles.photoContainer}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.operatorPhoto} />
            ) : (
              <View style={[styles.operatorPhoto, styles.noPhoto]}>
                <Ionicons
                  name="person"
                  size={30}
                  color={colorScheme === 'dark' ? '#64748b' : '#94a3b8'}
                />
              </View>
            )}
          </View>

          <View style={styles.operatorDetails}>
            <Text style={[
              styles.operatorName,
              {
                color: isAssigned
                  ? (colorScheme === 'dark' ? '#94a3b8' : '#9ca3af')
                  : (colorScheme === 'dark' ? '#ffffff' : '#1f2937')
              }
            ]}>
              {`${item.first_name} ${item.last_name}`}
            </Text>
            <Text style={[styles.operatorId, { color: colorScheme === 'dark' ? '#94a3b8' : '#6b7280' }]}>
              ID: {item.id_number}
            </Text>
            <Text style={[styles.operatorCode, { color: colorScheme === 'dark' ? '#94a3b8' : '#6b7280' }]}>
              {item.code}
            </Text>
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          {isAssigned ? (
            <Ionicons
              name="checkmark-done"
              size={24}
              color={colorScheme === 'dark' ? '#94a3b8' : '#64748b'}
            />
          ) : isSelected ? (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colorScheme === 'dark' ? '#4ade80' : '#38b2ac'}
            />
          ) : (
            <Ionicons
              name="ellipse-outline"
              size={24}
              color={colorScheme === 'dark' ? '#64748b' : '#cbd5e1'}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar footer con indicador de carga
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#ffffff' : '#0458AB'} />
        <Text style={[styles.loadingText, { color: colorScheme === 'dark' ? '#ffffff' : '#6b7280' }]}>
          {t('loading_more') || 'Cargando más...'}
        </Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#334155' : '#e5e7eb',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
    },
    closeButton: {
      padding: 8,
    },
    searchContainer: {
      padding: 16,
    },
    searchInput: {
      backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f9fafb',
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#475569' : '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    operatorItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      marginVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#334155' : '#e5e7eb',
    },
    operatorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    photoContainer: {
      marginRight: 12,
    },
    operatorPhoto: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    noPhoto: {
      backgroundColor: colorScheme === 'dark' ? '#374151' : '#f3f4f6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    operatorDetails: {
      flex: 1,
    },
    operatorName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    operatorId: {
      fontSize: 14,
      marginBottom: 2,
    },
    operatorCode: {
      fontSize: 12,
    },
    addButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      minWidth: 80,
      alignItems: 'center',
    },
    addButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14,
    },
    footerLoader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    loadingText: {
      marginLeft: 8,
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#94a3b8' : '#6b7280',
      textAlign: 'center',
      marginTop: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxContainer: {
      padding: 8,
    },
    addSelectedButton: {
      padding: 16,
      margin: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addSelectedButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {t('add_operator') || 'Agregar Operador'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons
              name="close"
              size={24}
              color={colorScheme === 'dark' ? '#ffffff' : '#1f2937'}
            />
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_by_name_or_id') || 'Buscar por nombre o cédula...'}
            placeholderTextColor={colorScheme === 'dark' ? '#94a3b8' : '#9ca3af'}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
          />
        </View>

        {/* Lista de operadores */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={colorScheme === 'dark' ? '#ffffff' : '#0458AB'}
              />
              <Text style={[styles.emptyText, { marginTop: 16 }]}>
                {t('loading') || 'Cargando...'}
              </Text>
            </View>
          ) : filteredOperators.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={48}
                color={colorScheme === 'dark' ? '#475569' : '#9ca3af'}
              />
              <Text style={styles.emptyText}>
                {searchTerm
                  ? (t('no_operators_found') || 'No se encontraron operadores')
                  : (t('no_operators_available') || 'No hay operadores disponibles')
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredOperators}
              renderItem={renderOperatorItem}
              keyExtractor={(item) => item.id_operator.toString()}
              onEndReached={loadMoreOperators}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.addSelectedButton,
            {
              backgroundColor: colorScheme === 'dark' ? '#0458AB' : '#0458AB',
              opacity: selectedOperators.size > 0 ? 1 : 0.5
            }
          ]}
          onPress={handleAddSelectedOperators}
          disabled={selectedOperators.size === 0 || adding}
        >
          {adding ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.addSelectedButtonText}>
              {t('add_selected_operators', { count: selectedOperators.size }) || `Agregar seleccionados (${selectedOperators.size})`}
            </Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}