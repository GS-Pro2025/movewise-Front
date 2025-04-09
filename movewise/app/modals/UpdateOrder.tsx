import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert, Image } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { Image } from 'react-native';
import { useRouter } from "expo-router";
import AddOrderformApi from '@/hooks/api/AddOrderFormApi';
import { AddOrderForm } from '@/models/ModelAddOrderForm';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareView } from '../../components/KeyboardAwareView';
import { ListJobs } from '@/hooks/api/JobClient';
import UpdateOrderFormApi from '@/hooks/api/UpdateOrderFormApi';
import { AntDesign } from '@expo/vector-icons';

// Job interface definition
interface Job {
  id: number;
  name: string;
}

// Props for the modal, including visibility, close function, and order data
interface UpdateOrderModalProps {
  visible?: boolean; // Determines if the modal is visible
  onClose?: () => void; // Function to call when closing the modal
  orderData: { // Object containing order details
    key: string;
    state_usa: string; // State of the order
    date: string; // Date of the order
    key_ref: string; // Reference key for the order
    person: { // Customer information
      first_name: string; // Customer's first name
      last_name: string; // Customer's last name
      email: string; // Customer's email
    };
    phone: string; // Customer's phone number
    address: string; // Customer's address
    weight: string; // Weight of the order
    job?: number; // Job ID
    distance?: number;
    expense?: string;
    income?: string;
    status?: string;
    payStatus?: number;
  };
}

export default function UpdateOrderModal({ visible = true, onClose, orderData }: UpdateOrderModalProps) {
  const router = useRouter();
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const { updateOrder, isLoading, error } = UpdateOrderFormApi();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // State variables for form fields
  const [state, setState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [openJob, setOpenJob] = useState(false);
  const [job, setJob] = useState<string | null>(null);
  const [openCompany, setOpenCompany] = useState(false);
  const [company, setCompany] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [keyReference, setKeyReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [weight, setWeight] = useState('');
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobList, setJobList] = useState<Job[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobs = await ListJobs();
      setJobList(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Effect to populate form fields with order data when modal is visible
  useEffect(() => {
    if (visible && orderData) {
      setKey(orderData.key || '');
      setState(orderData.state_usa || null);
      setDate(orderData.date || null);
      setKeyReference(orderData.key_ref || '');
      setCustomerFirstName(orderData.person?.first_name || '');
      setCustomerLastName(orderData.person?.last_name || '');
      setCellPhone(orderData.phone || '');
      setAddress(orderData.address || '');
      setEmail(orderData.person?.email || '');
      setWeight(orderData.weight || '');
      setJobId(orderData.job || null);
      setErrors({});
    }
  };

  const fetchStates = async () => {
    try {
      const states = await ListStates();
      setStateList(states);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const jobs = await ListJobs();
      setJobList(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companies = await ListCompanies();
      setCompanyList(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchStates();
  }, []);

  const validateFields = () => {
    let newErrors: { [key: string]: string } = {};
    if (!state) newErrors.state = "State is required";
    if (!date) newErrors.date = "Date is required";
    if (!keyReference) newErrors.keyReference = "Key/Reference is required";
    if (!customerName) newErrors.customerName = "Customer Name is required";
    if (!customerLastName) newErrors.customerLastName = "Customer Last Name is required";
    if (!weight) newErrors.weight = "Weight is required";
    if (!job) newErrors.job = "Job is required";
    if (!company) newErrors.company = "Company is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleUpdate = async () => {
    if (!validateFields()) return; // Validate fields before updating
  
    try {
      console.log("Updating order with key:", key);
  
      const updateData = {
        key_ref: keyReference,
        date: date || '',
        distance: orderData.distance || 0,
        expense: orderData.expense || "0",
        income: orderData.income || "0",
        weight: weight,
        status: orderData.status || "In Progress",
        payStatus: orderData.payStatus || 0,
        state_usa: state || '',
        person: {
          email: email || '',
          first_name: customerFirstName,
          last_name: customerLastName
        },
        job: jobId || 0
      };
  
      console.log("Sending update data:", JSON.stringify(updateData));
  
      const result = await updateOrder(key || '', updateData);
  
      if (result.success) {
        Alert.alert("Success", "Order updated successfully");
        if (onClose) {
          onClose();
        } else {
          router.back();
        }
      } else {
        // Display the error message returned from the API call
        Alert.alert("Error", result.errorMessage);
      }
    } catch (err: any) {
      console.error("Error in handleUpdate:", err);
      Alert.alert("Error", `An unexpected error occurred: ${err.message}`);
    }
  };

  // Function to handle modal close
  const handleClose = () => {
    if (onClose) {
      onClose(); // Call onClose if provided
    } else {
      router.back(); // Navigate back if no onClose
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF' }}>
        <KeyboardAwareView style={{ flex: 1 }}>
          <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E3A5F' : '#0458AB' }]}>
            <Text style={[styles.headerText, { color: '#FFFFFF' }]}>Edit Order</Text>
          </View>

          <ThemedView style={{ padding: 16, flex: 1, backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF' }}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>State <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <DropDownPicker
                open={stateDropdownOpen}
                value={state}
                items={[
                  { label: 'Alabama', value: 'AL' },
                  { label: 'Wisconsin', value: 'WI' },
                  { label: 'New York', value: 'NY' },
                  { label: 'California', value: 'CA' },
                  { label: 'Texas', value: 'TX' },
                  { label: 'Florida', value: 'FL' },
                ]}
                setOpen={setStateDropdownOpen}
                setValue={setState}
                placeholder="Select State"
                style={[styles.dropdown, { backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF' }]}
                containerStyle={stateDropdownOpen ? { zIndex: 2000 } : undefined}
                textStyle={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}
                placeholderStyle={{ color: isDarkMode ? '#AAAAAA' : '#666666' }}
              />
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>Date <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF' }]}
                onPress={() => setDatePickerVisibility(true)}
              >
                <Text style={[styles.dateButtonText, { color: isDarkMode ? '#FFFFFF' : '#666666' }]}>
                  {date ? date : "MM/DD/YYYY"}
                </Text>
                <AntDesign name="calendar" size={24} color={isDarkMode ? "#A1C6EA" : "#0458AB"} />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(selectedDate) => {
                  setDatePickerVisibility(false);
                  setDate(selectedDate.toISOString().split('T')[0]); // Format date to YYYY-MM-DD
                }}
                onCancel={() => setDatePickerVisibility(false)}
              />
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>

            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#A1C6EA' : '#0458AB' }]}>General Data</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>Key/Reference <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <TextInput
                value={keyReference}
                onChangeText={setKeyReference}
                placeholder="Key/Reference"
                placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#333333'
                }]}
              />
              {errors.keyReference && <Text style={styles.errorText}>{errors.keyReference}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>Customer Name <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <TextInput
                value={`${customerFirstName} ${customerLastName}`}
                onChangeText={(text) => {
                  const names = text.split(' ');
                  setCustomerFirstName(names[0] || '');
                  setCustomerLastName(names.slice(1).join(' ') || '');
                }}
                placeholder="Customer Name"
                placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#333333'
                }]}
              />
              {(errors.customerFirstName || errors.customerLastName) && (
                <Text style={styles.errorText}>Customer name is required</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>Weight (kg) <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="0.0"
                placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                keyboardType="numeric"
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#333333'
                }]}
              />

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>Job <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <DropDownPicker
                open={jobDropdownOpen}
                value={jobId}
                items={jobList.map(job => ({ label: job.name, value: job.id }))}
                setOpen={setJobDropdownOpen}
                setValue={setJobId}
                placeholder="Job"
                style={[styles.dropdown, { backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF' }]}
                containerStyle={jobDropdownOpen ? { zIndex: 1000 } : undefined}
                textStyle={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}
                placeholderStyle={{ color: isDarkMode ? '#AAAAAA' : '#666666' }}
              />
              {errors.jobId && <Text style={styles.errorText}>{errors.jobId}</Text>}
            </View>

            <TouchableOpacity style={styles.operatorsButton}>
              <Text style={[styles.operatorsButtonText, { color: isDarkMode ? '#A1C6EA' : '#0458AB' }]}>Edit Operators</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: isDarkMode ? '#545257' : '#777' }]} 
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: isDarkMode ? '#A1C6EA' : '#0458AB' }]}
                onPress={handleUpdate}
                disabled={isLoading}
              >
                <Text style={[styles.saveButtonText, { color: isDarkMode ? '#0458AB' : '#FFFFFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </KeyboardAwareView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  dropdown: {
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  operatorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  operatorsButtonText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: 'bold',
  },
});
