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
  const [selectedToolIds, setSelectedToolIds] = useState<number[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  // Initialize selected tools
  useEffect(() => {
    const initialTools = assignment.data_order.tool?.map((t: { id_tool: number }) => t.id_tool) || [];
    setSelectedToolIds(initialTools);
  }, [assignment]);

  // Fetch tools list
  useEffect(() => {
    const loadTools = async () => {
      setLoading(true);
      try {
        const toolsData = await getToolsList(1);
        setTools(Array.isArray(toolsData) ? toolsData : []);
      } catch (e) {
        console.error("Error loading tools:", e);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (visible) loadTools();
  }, [visible]);

  const handleToolSelection = (toolId: number) => {
    setSelectedToolIds(prev => 
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleSave = () => {
    const payload = selectedToolIds.map(id_tool => ({
      id_tool,
      id_order: assignment.data_order.key,
      date: new Date().toISOString().split('T')[0]
    }));

    // Simulate API submission
    console.log('Payload ready:', payload);
    
    Alert.alert(
      `${selectedToolIds.length} Tools selected`,
      "Do you want to save the changes?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: () => onClose() }
      ]
    );
  };

  const renderToolItem = ({ item }: { item: Tool }) => {
    const isSelected = selectedToolIds.includes(item.id);
    
    return (
      <GestureHandlerRootView>
        <TouchableHighlight
          underlayColor={isDarkMode ? '#333' : '#eee'}
          onPress={() => handleToolSelection(item.id)}
        >
          <Swipeable
            ref={(ref) => ref && swipeableRefs.current.set(item.id, ref)}
            renderLeftActions={() => (
              <View style={[styles.rightSwipeActions, { backgroundColor: '#28a745' }]}>
                <Text style={styles.checkText}>{isSelected ? 'Remove' : 'Select'}</Text>
              </View>
            )}
            onSwipeableOpen={() => handleToolSelection(item.id)}
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
            <Text style={[styles.toolsModalSelection, { color: isDarkMode ? '#CCC' : '#666' }]}>
              {selectedToolIds.length} selected
            </Text>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default ToolsManager;