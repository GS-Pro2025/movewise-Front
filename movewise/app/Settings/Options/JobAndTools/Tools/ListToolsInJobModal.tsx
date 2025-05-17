import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { listToolsByJob } from "../../../../../hooks/api/ToolClient";

interface ListToolsInJobModalProps {
  visible: boolean;
  onClose: () => void;
  jobId: number | null;
}

const PAGE_SIZE = 20;

const ListToolsInJobModal: React.FC<ListToolsInJobModalProps> = ({
  visible,
  onClose,
  jobId,
}) => {
  const { t } = useTranslation();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t("tools_in_job")}</Text>
        </View>
        <FlatList
          data={tools}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          renderItem={({ item }) => (
            <View style={styles.toolItem}>
              <Text style={styles.toolName}>{item.name}</Text>
            </View>
          )}
            ListEmptyComponent={
            !loading
                ? () => (
                    <Text style={{ textAlign: "center", marginTop: 30 }}>
                    {t("no_tools_in_job")}
                    </Text>
                )
                : null
            }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="large" style={{ margin: 20 }} />
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  closeText: { fontSize: 24, marginRight: 16 },
  title: { fontSize: 18, fontWeight: "bold" },
  toolItem: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  toolName: { fontSize: 16 },
});

export default ListToolsInJobModal;
