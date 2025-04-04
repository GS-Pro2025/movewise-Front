import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import apiClient, { ApiError } from '../../hooks/api/apiClient';
import { ListJobs } from '../../hooks/api/JobClient';

interface Job {
  id: number;
  name: string;
  // Add more fields as needed
  // Añadir más campos según se necesiten
}

interface JobsListModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthError?: () => void; // Callback to handle authentication errors
                           // Callback para manejar errores de autenticación
}

const JobsListModal: React.FC<JobsListModalProps> = ({ visible, onClose, onAuthError }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isFirstLoadJobs, setIsFirstLoadJobs] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await ListJobs();
      setJobs(jobsData);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.isAuthError) {
        setError('Authentication Error: ' + apiError.message);
        onAuthError?.(); // Notify parent component about auth error
                        // Notificar al componente padre sobre el error de autenticación
      } else if (apiError.status === 404) {
        setError('No jobs available');
      } else {
        setError(apiError.message || 'Error loading jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstLoadJobs && visible) {
      fetchJobs();
      setIsFirstLoadJobs(false);
    }
  }, [isFirstLoadJobs, visible]);

  const renderJob = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.jobItem}
      onPress={() => {
        // Add logic to select a job here
        // Aquí puedes agregar la lógica para seleccionar un trabajo
        console.log('Selected job:', item);
      }}
    >
      <Text style={styles.jobTitle}>{item.name}</Text>
      <Text style={styles.jobDescription}>{item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Jobs List</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchJobs} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No jobs available</Text>
            </View>
          ) : (
            <FlatList
              data={jobs}
              renderItem={renderJob}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  listContainer: {
    flexGrow: 1,
  },
  jobItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  jobDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  jobStatus: {
    fontSize: 12,
    color: '#888',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});

export default JobsListModal;