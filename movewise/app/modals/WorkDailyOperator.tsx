import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, FlatList, ActivityIndicator, RefreshControl, Alert, SafeAreaView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { getWorkDailyByOperator } from "../../hooks/api/GetWorkDailyByOperator";
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

interface WorkDailyOperatorProps {
  visible: boolean;
  onClose: () => void;
}

interface Assignment {
  id: number;
  operator: number;
  order: string;
  data_order: {
    key: string;
    key_ref: string;
    date: string;
    distance: number | null;
    expense: string | null;
    income: string | null;
    weight: string;
    status: string;
    payStatus: number | null;
    evidence: string | null;
    state_usa: string;
    id_company: number | null;
    person: {
      first_name: string;
      last_name: string;
      email: string;
    };
    job: number;
    assign: number[];
    tool: number[];
  };
  truck: string | null;
  payment: string | null;
  assigned_at: string;
  rol: string | null;
  audit_records: any[];
  additional_costs: string | null;
}

const WorkDailyOperator: React.FC<WorkDailyOperatorProps> = ({ visible, onClose }) => {
  const { operatorId } = useLocalSearchParams<{ operatorId: string }>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  // Function to load assignments
  const loadAssignments = useCallback(async () => {
    console.log("Loading assignments for operator:", operatorId);

    setLoading(true);
    try {
      const response = await getWorkDailyByOperator(operatorId);
      console.log("API Response:", response);
      if (response && response.status === "success") {
        setAssignments(response.data || []);
      } else {
        console.error("API Error:", response);
        Alert.alert("Error", response?.messUser || "Could not load assignments");
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
      Alert.alert("Error", "Could not load assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [operatorId, visible]);

  // Format date for display
  const formatDate = (date: string | Date) => {
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Load assignments when component becomes visible
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const onRefresh = useCallback(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleAssignmentPress = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setModalVisible(true);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
          <Text style={[styles.title, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>Daily Work</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={isDarkMode ? "#FFFFFF" : "#0458AB"} />
          </TouchableOpacity>
        </View>

        {/* Assignment List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0458AB" />
          </View>
        ) : (
          <FlatList
            data={assignments.filter(assignment =>
              assignment.order.toLowerCase().includes(searchText.toLowerCase())
            )}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }: { item: Assignment }) => {
              const referenceName = `${item.data_order.key_ref} - ${item.data_order.person.first_name} ${item.data_order.person.last_name}`;
              return (
                <TouchableOpacity
                  onPress={() => handleAssignmentPress(item)}
                  disabled={item.rol !== 'leader'}
                >
                  <View style={[
                    styles.assignmentItem,
                    { backgroundColor: isDarkMode ? '#1E3A5F' : '#f5f5f5' },
                    item.rol !== 'leader' && styles.disabledItem
                  ]}>
                    <Ionicons name="briefcase-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#0458AB'} style={styles.icon} />
                    <View style={styles.assignmentDetails}>
                      <Text style={[styles.assignmentText, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                        {referenceName}
                      </Text>
                      <Text style={[styles.dateText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
                        {formatDate(item.data_order.date)}
                      </Text>
                      <Text style={[styles.rolText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
                        Role: {item.rol === 'leader' ? 'Leader' : 'Operator'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={[
              styles.listContainer,
              assignments.length === 0 && styles.emptyListContainer
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0458AB"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={50} color={isDarkMode ? '#FFFFFF80' : '#0458AB80'} />
                <Text style={[styles.emptyText, { color: isDarkMode ? '#FFFFFF' : '#666666' }]}>
                  "No assignments available"
                </Text>
              </View>
            }
          />
        )}

        {/* Modal for selected assignment - Only visible for leaders */}
        {selectedAssignment && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedAssignment.data_order.key_ref} - {selectedAssignment.data_order.person.first_name} {selectedAssignment.data_order.person.last_name}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                  <Text style={styles.modalInfoText}>
                    Date: {formatDate(selectedAssignment.data_order.date)}
                  </Text>
                  <Text style={styles.modalInfoText}>
                    Status: {selectedAssignment.data_order.status}
                  </Text>
                  <Text style={styles.modalInfoText}>
                    Role: {selectedAssignment.rol === 'leader' ? 'Leader' : 'Operator'}
                  </Text>
                </View>

                {selectedAssignment.rol === 'leader' && (
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        Alert.alert("Success", "Work marked as completed");
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalButtonText}>Work completed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        Alert.alert("Tools", "Opening tools list");
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalButtonText}>Tools list</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedAssignment.rol !== 'leader' && (
                  <View style={styles.modalMessageContainer}>
                    <Text style={styles.modalMessageText}>
                      You do not have leader permissions for this assignment
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dateSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearButton: {
    padding: 8,
  },
  assignmentDetails: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
  },
  rolText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  closeButton: {
    position: "absolute",
    right: 15,
    padding: 10, // Added padding to increase tap area
  },
  dateContainer: {
    padding: 15,
  },
  dateLabel: {
    marginBottom: 5,
    fontWeight: "500",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  // Debug styles
  debugContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'red',
    margin: 10,
    backgroundColor: 'rgba(255,0,0,0.1)'
  },
  debugText: {
    fontSize: 12,
    color: 'red'
  },
  searchContainer: {
    padding: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  assignmentItem: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledItem: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 10,
  },
  assignmentText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#2A4B8D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1, // Added to ensure text can wrap
  },
  modalClose: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalInfoText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#2A4B8D',
    fontWeight: 'bold',
  },
  modalMessageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default WorkDailyOperator;