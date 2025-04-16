import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getToolsList } from '@/hooks/api/GetToolsList';
import {
  GestureHandlerRootView,
  TouchableHighlight,
  Swipeable
} from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/hooks/api/apiClient";
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { GetAssignToolByOrder } from '@/hooks/api/GetAssignToolByOrder';

interface Tool {
  id: number;
  name: string;
  job: number;
}

interface ToolsManagerProps {
  visible: boolean;
  onClose: () => void;
  assignment: any;
  isDarkMode: boolean;
}

const ToolsManager: React.FC<ToolsManagerProps> = ({
  visible,
  onClose,
  assignment,
  isDarkMode
}) => {
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [showSelectedModal, setShowSelectedModal] = useState(false);

  useEffect(() => {
    const loadAssignedTools = async () => {
      if (visible && assignment?.data_order?.key) {
        try {
          const response = await GetAssignToolByOrder(assignment.data_order.key);
          const assignedTools = response.data.map((tool: any) => ({
            id: tool.tool.id,
            name: tool.tool.name,
            job: tool.tool.job
          }));
          setSelectedTools(assignedTools);
        } catch (error) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: "Error",
            textBody: "No se pudieron cargar las herramientas asignadas",
            autoClose: 3000,
          });
        }
      }
    };

    if (visible) loadAssignedTools();
  }, [visible, assignment?.data_order?.key]);

  const loadTools = async (pageToLoad: number) => {
    if (!hasNextPage && pageToLoad > 1) return;
    pageToLoad === 1 ? setLoading(true) : setLoadingMore(true);

    try {
      const toolsData = await getToolsList(pageToLoad);
      if (Array.isArray(toolsData)) {
        if (pageToLoad === 1) {
          setTools(toolsData);
        } else {
          setTools(prev => [...prev, ...toolsData]);
        }
        setHasNextPage(toolsData.length > 0);
      }
    } catch (e) {
      console.error("Error loading tools:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setPage(1);
      setHasNextPage(true);
      loadTools(1);
    }
  }, [visible]);

  useEffect(() => {
    if (page > 1) {
      loadTools(page);
    }
  }, [page]);

  const handleToolSelection = (tool: Tool) => {
    setSelectedTools(prev => {
      const exists = prev.some(t => t.id === tool.id);
      return exists
        ? prev.filter(t => t.id !== tool.id)
        : [...prev, tool];
    });
  };

  const handleSave = async () => {
    const payload = selectedTools.map(tool => ({
      id_tool: tool.id,
      key: assignment.data_order?.key, // Asegurarse de que 'key' no sea undefined
      date: new Date().toISOString().split('T')[0]
    }));

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await apiClient.post('/assignTools/', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Toast.show({
        type: response.data.status === "success" ? ALERT_TYPE.SUCCESS : ALERT_TYPE.DANGER,
        title: response.data.status === "success" ? "Success" : "Error",
        textBody: response.data.messDev,
        autoClose: 3000,
      });

      const updatedResponse = await GetAssignToolByOrder(assignment.data_order?.key); // Asegurarse de que 'key' no sea undefined
      const updatedTools = updatedResponse.data.map((tool: any) => ({
        id: tool.id_tool,
        name: tool.name,
        job: tool.job
      }));
      setSelectedTools(updatedTools);

      onClose();
    } catch (error) {
      console.error('Error sending data:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Error sending data",
        autoClose: 3000,
      });
    }
  };

  const renderToolItem = ({ item }: { item: Tool }) => {
    const isSelected = selectedTools.some(t => t.id === item.id);

    return (
      <GestureHandlerRootView>
        <TouchableHighlight
          underlayColor={isDarkMode ? '#333' : '#eee'}
          onPress={() => handleToolSelection(item)}
        >
          <Swipeable
            ref={(ref) => ref && swipeableRefs.current.set(item.id, ref)}
            renderLeftActions={() => (
              <View style={[styles.rightSwipeActions, { backgroundColor: '#28a745' }]}>
                <Text style={styles.checkText}>{isSelected ? 'Remove' : 'Select'}</Text>
              </View>
            )}
            onSwipeableOpen={() => handleToolSelection(item)}
          >
            <View style={[
              styles.toolItem,
              {
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF',
                borderColor: isDarkMode ? '#333' : '#E0E0E0'
              },
              isSelected && {
                backgroundColor: isDarkMode ? '#0458AB' : '#E3F2FD',
                borderColor: '#0458AB'
              }
            ]}>
              <View style={styles.toolInfo}>
                <Text style={[
                  styles.toolName,
                  { color: isSelected ? (isDarkMode ? '#FFF' : '#0458AB') : (isDarkMode ? '#FFF' : '#333') }
                ]}>
                  {item.name}
                </Text>
                <Text style={[styles.toolJob, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                  Job {item.job}
                </Text>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={isDarkMode ? "#FFF" : "#0458AB"}
                />
              )}
            </View>
          </Swipeable>
        </TouchableHighlight>
      </GestureHandlerRootView>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.toolsModalOverlay}>
        <View style={[
          styles.toolsModalContainer,
          { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF' }
        ]}>
          {/* Header */}
          <View style={[
            styles.toolsModalHeader,
            { backgroundColor: isDarkMode ? '#333' : '#0458AB' }
          ]}>
            <Text style={styles.toolsModalTitle}>Tools</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Counter and ID */}
          <View style={styles.toolsModalInfo}>
            <Text style={[styles.toolsModalSubtitle, { color: isDarkMode ? '#FFF' : '#333' }]}>
              Order #{assignment.id}
            </Text>
            <TouchableOpacity onPress={() => setShowSelectedModal(true)}>
              <Text style={[styles.toolsModalSelection, { color: isDarkMode ? '#CCC' : '#666' }]}>
                Show Selected Tools ({selectedTools.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0458AB" />
            </View>
          ) : (
            <FlatList
              data={tools}
              keyExtractor={item => item.id.toString()}
              renderItem={renderToolItem}
              contentContainerStyle={styles.listContainer}
              onEndReached={() => {
                if (!loadingMore && hasNextPage) {
                  setPage(prev => prev + 1);
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                loadingMore
                  ? <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#0458AB" />
                  </View>
                  : null
              }
            />
          )}

          {/* Action buttons */}
          <View style={styles.toolsModalFooter}>
            <TouchableOpacity
              style={[styles.toolsModalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={{ color: isDarkMode ? '#FFF' : '#333' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolsModalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={{ color: '#FFF' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Selected Tools Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSelectedModal}
        onRequestClose={() => setShowSelectedModal(false)}
      >
        <View style={styles.toolsModalOverlay}>
          <View style={[
            styles.toolsModalContainer,
            { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF' }
          ]}>
            <View style={[
              styles.toolsModalHeader,
              { backgroundColor: isDarkMode ? '#333' : '#0458AB' }
            ]}>
              <Text style={styles.toolsModalTitle}>
                Selected Tools ({selectedTools.length})
              </Text>
              <TouchableOpacity onPress={() => setShowSelectedModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedTools}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={[
                  styles.toolItem,
                  {
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF',
                    borderColor: isDarkMode ? '#333' : '#E0E0E0'
                  }
                ]}>
                  <View style={styles.toolInfo}>
                    <Text style={{ color: isDarkMode ? '#FFF' : '#333' }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: isDarkMode ? '#BDBDBD' : '#757575' }}>
                      Job {item.job}
                    </Text>
                  </View>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={isDarkMode ? "#FFF" : "#0458AB"}
                  />
                </View>
              )}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={{ color: isDarkMode ? '#FFF' : '#333' }}>
                    No tools selected
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
};


const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    paddingBottom: 30,
    paddingHorizontal: 8
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    justifyContent: 'space-between'
  },
  toolInfo: { flex: 1 },
  toolName: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  toolJob: { fontSize: 14, fontWeight: '400' },
  rightSwipeActions: {
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: 80,
  },
  editAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkIcon: {
    textAlign: 'center'
  },
  checkText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Modal styles that were previously in AssignmentDetails
  toolsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  toolsModalContainer: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  toolsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  toolsModalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  toolsModalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  toolsModalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  toolsModalSelection: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  toolsModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  toolsModalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#0458AB',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  //list of tools selected
  selectedToolsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  selectedToolText: {
    color: '#28a745',      // green
    fontSize: 14,
    marginBottom: 4,
  },
  //loading more container
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },


});


export default ToolsManager;