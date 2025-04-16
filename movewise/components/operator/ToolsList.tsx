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
  const [initialAssignedTools, setInitialAssignedTools] = useState<Tool[]>([]);
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [showSelectedModal, setShowSelectedModal] = useState(false);

  // Computed property for filtered tools (tools not yet selected)
  const filteredTools = allTools.filter(
    tool => !selectedTools.some(selectedTool => selectedTool.id === tool.id)
  );

  useEffect(() => {
    const loadAssignedTools = async () => {
      if (visible && assignment?.data_order?.key) {
        try {
          setLoading(true);
          const response = await GetAssignToolByOrder(assignment.data_order.key);
          const assignedTools = response.data.map((tool: any) => ({
            id: tool.tool.id,
            name: tool.tool.name,
            job: tool.tool.job
          }));

          setSelectedTools(assignedTools);
          setInitialAssignedTools(assignedTools);

          await loadTools(1);
        } catch (error) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: "Error",
            textBody: "No se pudieron cargar las herramientas asignadas",
            autoClose: 3000,
          });
          await loadTools(1);
        } finally {
          setLoading(false);
        }
      }
    };

    if (visible) {
      setPage(1);
      setHasNextPage(true);
      loadAssignedTools();
    }
  }, [visible, assignment?.data_order?.key]);



  const loadTools = async (pageToLoad: number) => {
    if (!hasNextPage && pageToLoad > 1) return; // Check if there are more pages to load
    pageToLoad === 1 ? setLoading(true) : setLoadingMore(true); // Set loading state based on the page

    try {
      const toolsData = await getToolsList(pageToLoad); // Fetch tools data
      if (Array.isArray(toolsData)) {
        // If we are on page 1, replace the entire array
        if (pageToLoad === 1) {
          setAllTools(toolsData);
        } else {
          // For additional pages, ensure we do not duplicate tools
          setAllTools(prev => {
            const newTools = toolsData.filter(
              newTool => !prev.some(existingTool => existingTool.id === newTool.id) // Filter out existing tools
            );
            return [...prev, ...newTools]; // Combine previous tools with new tools
          });
        }
        setHasNextPage(toolsData.length > 0); // Check if there are more tools to load
      }
    } catch (e) {
      console.error("Error loading tools:", e); // Log any errors
    } finally {
      setLoading(false); // Reset loading state
      setLoadingMore(false); // Reset loading more state
    }
  };

  // useEffect(() => {
  //   if (visible) {
  //     setPage(1);
  //     setHasNextPage(true);
  //     loadTools(1);
  //   }
  // }, [visible]);

  useEffect(() => {
    if (page > 1) {
      loadTools(page);
    }
  }, [page]);

  const handleToolSelection = (tool: Tool) => {
    setSelectedTools(prev => {
      //verify if the tool is already selected
      if (prev.some(selectedTool => selectedTool.id === tool.id)) {
        return prev; //if the tool is already selected, return the previous state
      }
      return [...prev, tool]; 
    });
  };

  const handleRemoveTool = (toolId: number) => {
    setSelectedTools(prev => prev.filter(tool => tool.id !== toolId));
  };

  const handleSave = async () => {
    const newlySelectedTools = selectedTools.filter(
      selectedTool => !initialAssignedTools.some(initialTool => initialTool.id === selectedTool.id)
    );

    const unselectedTools = initialAssignedTools.filter(
      initialTool => !selectedTools.some(selectedTool => selectedTool.id === initialTool.id)
    );

    if (newlySelectedTools.length > 0 || unselectedTools.length > 0) {
      try {
        const token = await AsyncStorage.getItem("userToken");

        const payload = newlySelectedTools.map(tool => ({
          id_tool: tool.id,
          key: assignment.data_order?.key,
          date: new Date().toISOString().split('T')[0]
        }));

        if (payload.length > 0) {
          const response = await apiClient.post('/assignTools/', payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.status !== "success") {
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title: "Error",
              textBody: response.data.messDev || "Failed to assign tools",
              autoClose: 3000,
            });
            return;
          }
        }

        if (unselectedTools.length > 0) {
          const unassignPayload = unselectedTools.map(tool => ({
            id_tool: tool.id,
            key: assignment.data_order?.key
          }));

          const unassignResponse = await apiClient.post('/unassignTools/', unassignPayload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (unassignResponse.data.status !== "success") {
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title: "Error",
              textBody: unassignResponse.data.messDev || "Failed to unassign tools",
              autoClose: 3000,
            });
            return;
          }
        }

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: "Tools updated successfully",
          autoClose: 3000,
        });

        onClose();
      } catch (error) {
        console.error('Error updating tools:', error);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "Error updating tools",
          autoClose: 3000,
        });
      }
    } else {
      Toast.show({
        type: ALERT_TYPE.INFO,
        title: "Info",
        textBody: "No changes were made to tool assignments",
        autoClose: 3000,
      });
      onClose();
    }
  };

  const renderToolItem = ({ item }: { item: Tool }) => {
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
                <Text style={styles.checkText}>Select</Text>
              </View>
            )}
            onSwipeableOpen={() => handleToolSelection(item)}
          >
            <View style={[
              styles.toolItem,
              {
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF',
                borderColor: isDarkMode ? '#333' : '#E0E0E0'
              }
            ]}>
              <View style={styles.toolInfo}>
                <Text style={[
                  styles.toolName,
                  { color: isDarkMode ? '#FFF' : '#333' }
                ]}>
                  {item.name}
                </Text>
                <Text style={[styles.toolJob, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                  Job {item.job}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleToolSelection(item)}>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={isDarkMode ? "#FFF" : "#0458AB"}
                />
              </TouchableOpacity>
            </View>
          </Swipeable>
        </TouchableHighlight>
      </GestureHandlerRootView>
    );
  };

  const renderSelectedToolItem = ({ item }: { item: Tool }) => {
    return (
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
        <TouchableOpacity onPress={() => handleRemoveTool(item.id)}>
          <Ionicons
            name="close-circle-outline"
            size={24}
            color={isDarkMode ? "#FFF" : "#ff4444"}
          />
        </TouchableOpacity>
      </View>
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
            <Text style={styles.toolsModalTitle}>Available Tools</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Counter and ID */}
          <View style={styles.toolsModalInfo}>
            <Text style={[styles.toolsModalSubtitle, { color: isDarkMode ? '#FFF' : '#333' }]}>
              Order #{assignment.id}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSelectedModal(true)}
              style={styles.selectedToolsButton}
            >
              <Ionicons name="checkmark-circle" size={16} color={isDarkMode ? "#CCC" : "#0458AB"} />
              <Text style={[styles.toolsModalSelection, { color: isDarkMode ? '#CCC' : '#0458AB' }]}>
                Selected Tools ({selectedTools.length})
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
              data={filteredTools}
              keyExtractor={item => item.id.toString()}
              renderItem={renderToolItem}
              contentContainerStyle={styles.listContainer}
              onEndReached={() => {
                if (!loadingMore && hasNextPage) {
                  setPage(prev => prev + 1);
                }
              }}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={{ color: isDarkMode ? '#FFF' : '#333', textAlign: 'center', marginTop: 20 }}>
                    No available tools found or all tools are selected
                  </Text>
                </View>
              }
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
              renderItem={renderSelectedToolItem}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={{ color: isDarkMode ? '#FFF' : '#333', textAlign: 'center', marginTop: 20 }}>
                    No tools selected
                  </Text>
                </View>
              }
            />

            <View style={styles.toolsModalFooter}>
              <TouchableOpacity
                style={[styles.toolsModalButton, styles.saveButton, { flex: 1 }]}
                onPress={() => setShowSelectedModal(false)}
              >
                <Text style={{ color: '#FFF' }}>Done</Text>
              </TouchableOpacity>
            </View>
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

  selectedToolsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

});


export default ToolsManager;