import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Image,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { listToolsByJob, deleteTool } from "../../../../../hooks/api/ToolClient";
import CreateToolModal, { CreateToolProvider } from "./CreateToolModal";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import Toast from "react-native-toast-message";

interface ListToolsInJobModalProps {
  visible: boolean;
  onClose: () => void;
  jobId: number | null;
  jobName: String | null;
}

const PAGE_SIZE = 20;

const ListToolsInJobModal: React.FC<ListToolsInJobModalProps> = ({
  visible,
  onClose,
  jobId,
  jobName
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [createToolVisible, setCreateToolVisible] = useState(false);

  const handleDeleteTool = async (id_tool: number) => {
    Alert.alert(
      t("confirm_delete"),
      t("delete_tool_confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              await deleteTool(id_tool);
              setTools(prev => prev.filter(tool => tool.id !== id_tool));
              loadTools(true);
                Toast.show({
                    type: "success",
                    text1: t("tool_deleted"),
                    text2: t("tool_deleted_successfully")
                });
            } catch (error) {
              console.error(t("error_deleting_tool"), error);
                Toast.show({
                    type: "error",
                    text1: t("tool_could_not_be_deleted"),
                    text2: t("Error_deleting_tool")
                });
              Alert.alert(t("error"), t("could_not_delete_tool"));
            }
          }
        }
      ]
    );
  };

  const loadTools = useCallback(
    async (reset = false) => {
      if (!jobId) return;
      if (!reset && !hasMore) return;
      if (loading) return;

      if (reset) {
        setPage(1);
        setHasMore(true);
      }

      setLoading(true);
      try {
        const response = await listToolsByJob(
          jobId,
          reset ? 1 : page,
          PAGE_SIZE
        );
        const newTools = Array.isArray(response)
          ? response
          : response?.results || [];
        setTools((prev) => (reset ? newTools : [...prev, ...newTools]));
        setHasMore(newTools.length === PAGE_SIZE);
        if (reset) setPage(2);
        else setPage((prev) => prev + 1);
      } catch (error) {
        console.error(t("error_loading_tools"), error);
        Alert.alert(t("error"), t("could_not_load_tools"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId, page, t, hasMore, loading]
  );
  
  useEffect(() => {
    if (visible && jobId) {
      setTools([]);
      setPage(1);
      setHasMore(true);
      loadTools(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, jobId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTools(true);
  };

  const handleEndReached = () => {
    if (!loading && hasMore) {
      loadTools();
    }
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: isDarkMode ? '#0458AB' : '#666666' }]}>
        {t("no_tools_in_job")}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const renderRightActions = () => (
      <View style={styles.rightSwipeActions}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: '#e74c3c' }]}
          onPress={() => handleDeleteTool(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>{t("delete")}</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <GestureHandlerRootView>
        <Swipeable renderRightActions={renderRightActions}>
          <View style={[
            styles.toolItem,
            { backgroundColor: isDarkMode ? '#1E3A5F' : '#f5f5f5' }
          ]}>
            <Image
              source={require('../../../../../assets/images/hammer.png')}
              style={[
                styles.hammerImage,
                { backgroundColor: isDarkMode ? '#FFFFFF' : '#f5f5f5' }
              ]}
            />
            <View style={styles.toolDetails}>
              <Text style={[
                styles.toolName,
                { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
              ]}>
                {item.name}
              </Text>
            </View>
          </View>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[
          styles.header,
          { backgroundColor: isDarkMode ? '#112A4A' : '#ffffff' }
        ]}>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.backButton,
              { borderColor: isDarkMode ? '#FFF' : '#0458AB' }
            ]}
          >
            <Text style={[
              styles.backIcon,
              { color: isDarkMode ? '#FFF' : '#0458AB' }
            ]}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={[
            styles.title,
            { color: isDarkMode ? '#FFFFFF' : '#0458AB', flex: 1, textAlign: 'center' }
          ]}>
            {t("tools_in_job")} {jobName}
          </Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: isDarkMode ? '#FFF' : '#0458AB' }
            ]}
            onPress={() => setCreateToolVisible(true)}
          >
            <Text style={[
              styles.plus,
              { color: isDarkMode ? '#0458AB' : '#FFF' }
            ]}>
              +
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={tools}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          renderItem={renderItem}
          ListEmptyComponent={!loading ? EmptyComponent : null}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="large" style={{ margin: 20 }} />
            ) : null
          }
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
      {/* Create Tool Modal */}
      <CreateToolProvider
        visible={createToolVisible}
        onClose={() => setCreateToolVisible(false)}
        jobId={jobId}
        onSuccess={() => {
          setCreateToolVisible(false);
          loadTools(true);
        }}
      >
        <CreateToolModal />
      </CreateToolProvider>
      <Toast/>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingTop: 30,
    borderBottomWidth: 2,
    width: '100%',
    paddingHorizontal: 20,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: { fontSize: 20, fontWeight: "bold", alignItems: 'center', marginLeft: 20 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    },
    plus: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    rightSwipeActions: {
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: '100%',
        width: 100,
    },
    deleteAction: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toolDetails: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
  },
  hammerImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    borderRadius: 20,
  },
  toolName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListToolsInJobModal;