import { View, Text, TouchableOpacity, Modal, StyleSheet, useColorScheme, FlatList, TextInput, ActivityIndicator, RefreshControl, Alert, SafeAreaView,Image } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { TouchableHighlight } from "react-native";
import { ListJobs, deleteJob, createJob, Job } from "../../../../hooks/api/JobClient"; // Debes crear estos métodos en tu API
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import CreateJobModal, { CreateJobProvider } from "./CreateJobModal";
import ListToolsInJobModal from "./Tools/ListToolsInJobModal";


interface ListJobModalProps {
  visible: boolean;
  onClose: () => void;
}

const ListJobsModal: React.FC<ListJobModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [createJobVisible, setCreateJobVisible] = useState(false);
  const [toolsModalVisible, setToolsModalVisible] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJobName, setSelectedJobName] = useState<String | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await ListJobs();
      //Set the jobs taking in count its structure
      //  id: number;
      // name: string;
      setJobs(response.map((job: any) => ({
        id: job.id,
        name: job.name,
      })));
    } catch (error) {
      console.error(t("error_loading_jobs"), error);
      Alert.alert(t("error"), t("could_not_load_jobs"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    if (visible) {
      loadJobs();
    }
  }, [visible, loadJobs]);

  const onRefresh = useCallback(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = jobs.filter(job => {
    const title = job.name || '';
    return (
      title.toLowerCase().includes(searchText.toLowerCase()) 
    );
  });

  const handleDeleteJob = async (id_job: number) => {
    Alert.alert(
      t("confirm_delete"),
      t("delete_job_confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              await deleteJob(id_job);
              setJobs(prev => prev.filter(job => job.id !== id_job));
              Toast.show({
                type: "success",
                text1: t("job_deleted"),
                text2: t("job_deleted_successfully")
              });
              loadJobs();
            } catch (error) {
              console.error(t("error_deleting_job"), error);
              Alert.alert(t("error"), t("could_not_delete_job"));
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Job }) => {
    const renderRightActions = () => (
      <View style={styles.rightSwipeActions}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: '#e74c3c' }]}
          onPress={() => handleDeleteJob(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>{t("delete")}</Text>
        </TouchableOpacity>
      </View>
    );



    return (
      <GestureHandlerRootView>
        <Swipeable renderRightActions={renderRightActions}>
          <TouchableHighlight
            underlayColor={isDarkMode ? '#f0f0f0' : '#e0e0e0'}
            onPress={() => {
              setSelectedJobId(item.id);
              setSelectedJobName(item.name)
              setToolsModalVisible(true);
            }}
          >
            <View style={[styles.jobItem, { backgroundColor: isDarkMode ? '#1E3A5F' : '#f5f5f5' }]}>
              <Image
                source={require('../../../../assets/images/hammer.png')}
                style={[styles.hammerImage, { backgroundColor: isDarkMode ? '#FFFFFF' : '#f5f5f5' }]}
              />
              <View style={styles.jobDetails}>
                <Text style={[styles.jobTitle, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {item.name}
                </Text>
              </View>
            </View>
          </TouchableHighlight>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? '#112A4A' : '#ffffff' }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.backButton, { borderColor: isDarkMode ? '#FFF' : '#0458AB' }]}
          >
            <Text style={[styles.backIcon, { color: isDarkMode ? '#FFF' : '#0458AB' }]}>
              ←
            </Text>
            </TouchableOpacity>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#0458AB', flex: 1, textAlign: 'center' }]}>
            {t('jobs')}
          </Text>
          {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: isDarkMode ? '#FFF' : '#0458AB' }
              ]}
              onPress={() => setCreateJobVisible(true)}
            >
              <Text
                style={[
                  styles.plus,
                  { color: isDarkMode ? '#0458AB' : '#FFF' }
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>
        <View style={[styles.filtersContainer, { backgroundColor: isDarkMode ? "#112A4A" : "#ffffff" }]}>
          <Ionicons name="search" size={20} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}
            placeholder={t("search_placeholder_job")}
            placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999999'}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
            </TouchableOpacity>
          )}
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0458AB" />
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#000000"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDarkMode ? '#0458AB' : '#666666' }]}>
                  {t("no_jobs_available")}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
      {/**Create job Modal */}
      <CreateJobProvider 
        visible={createJobVisible} 
        onClose={() => setCreateJobVisible(false)} 
        onSuccess={loadJobs}>
        <CreateJobModal />
      </CreateJobProvider>
      {/**Tools modal */}
      <ListToolsInJobModal
        visible={toolsModalVisible}
        onClose={() => setToolsModalVisible(false)}
        jobId={selectedJobId}
        jobName={selectedJobName}
      />
      <Toast />
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
  title: { fontSize: 20, 
      fontWeight: "bold",
      alignItems: 'center',
      marginLeft: 20
    },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  jobItem: {
    flexDirection: 'row',  // Cambiado a row para alinear imagen y texto
    alignItems: 'center', // Alinea verticalmente los elementos
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  jobDetails: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10, // Añade margen izquierdo para separar la imagen del texto
  },
  hammerImage: { // Estilos para la imagen
        width: 30,  // Define el tamaño de la imagen
        height: 30,
        resizeMode: 'contain', // Asegura que la imagen se ajuste al tamaño sin distorsión
        borderRadius: 20,
    },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobCategory: {
    fontSize: 14,
    marginTop: 4,
  },
  jobStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  jobDescription: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
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
});

export default ListJobsModal;