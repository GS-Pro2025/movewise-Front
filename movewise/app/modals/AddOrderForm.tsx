import { Modal, SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { Image } from 'react-native';
import AddOrderformApi from '@/hooks/api/AddOrderFormApi';
import { AddOrderForm } from '@/models/ModelAddOrderForm';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { job } from '@/models/ModelJob';
import { ListJobs } from '@/hooks/api/JobClient';
import { ListCompanies } from '@/hooks/api/CompanyClient';
import { ListStates } from '@/hooks/api/StatesClient';
import OperatorModal from './OperatorModal';

interface AddOrderModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddOrderModal({ visible, onClose }: AddOrderModalProps) {
  const [open, setOpen] = useState(false);
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [jobList, setJobList] = useState<job[]>([]);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [operatorModalVisible, setOperatorModalVisible] = useState(false); // State for OperatorModal visibility
  const [savedOrderKey, setSavedOrderKey] = useState<string | null>(null); // State to store saved order key

  const { saveOrder, isLoading, error } = AddOrderformApi();

 
  const handleSave = async () => {
    if (!validateFields()) return;
    const orderData: AddOrderForm = {
      status: "Pending",
      date: date || "",
      key_ref: keyReference,
      address: address,
      state_usa: state || "",
      phone: cellPhone,
      person: {
        first_name: customerName,
        last_name: customerLastName,
        address: address,
        email: email
      },
      weight: weight,
      job: job || "",
      company: company || ""
    };

    try {
      const savedOrder = await saveOrder(orderData);
      console.log('info', savedOrder);
      if (savedOrder) {
        console.log('Order saved successfully!', savedOrder);
        alert("Order saved successfully!");
        setSavedOrderKey(savedOrder.key); // Store the key from savedOrder
        setOperatorModalVisible(true); // Show OperatorModal instead of pushing to it
      }
      console.log("Saving order...", orderData);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const fetchStates = async () => {
    try {
      const states = await ListStates();
      console.log('States list:', states); // Log the response data for debugging
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

  const colorScheme = useColorScheme();
  const imageSource = colorScheme === "dark"
    ? require("../../assets/images/PNG_blanco.png")
    : require("../../assets/images/PNG_negativo.png");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 19,
      paddingTop: 1,
      borderRadius: 10,
      backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff',
    },
    header: {
      backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff',
      paddingVertical: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    image: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
      position: 'absolute',
      left: 10,
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#0458AB',
      marginTop: 8,
    },
    textLarge: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#0458AB',
      marginTop: 16,
      marginBottom: 8,
    },
    input: {
      borderWidth: 2,
      borderColor: colorScheme === 'dark' ? '#64748b' : '#0458AB',
      backgroundColor: colorScheme === 'dark' ? '#FFFFFF36' : '#ffffff',
      padding: 8,
      borderRadius: 8,
      color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    buttonCancel: {
      backgroundColor: colorScheme === 'dark' ? '#0458AB' : '#545257',
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
      marginRight: 8,
    },
    buttonSave: {
      backgroundColor: colorScheme === 'dark' ? '#FFFFFF' : '#0458AB',
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
    },
    buttonTextCancel: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    buttonTextSave: {
      color: colorScheme === 'dark' ? '#0458AB' : '#FFFFFF',
      fontWeight: 'bold',
    },
    required: {
      color: '#FF0000',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#FFFFFF' }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={styles.header}>
              <Image source={imageSource} style={styles.image} />
              <Text style={styles.textLarge}>Add Order</Text>
            </View>

            <ThemedView style={styles.container}>
              <View style={{ zIndex: 3000 }}>
                <Text style={styles.text}>State <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={open}
                  value={state || ""}
                  items={stateList.map((stateItem) => ({
                    label: `${stateItem.name} (${stateItem.code})`,
                    value: stateItem.code,
                    key: stateItem.code // Aseguramos que cada item tiene una key única
                  }))}
                  setOpen={setOpen}
                  // Cambiamos la función setValue a una más simple
                  setValue={(callback) => {
                    // Si es una función, ejecutarla para obtener el valor
                    if (typeof callback === 'function') {
                      const newValue = callback(state);
                      setState(newValue);
                      console.log("Estado seleccionado para enviar:", newValue);
                    } else {
                      // Si es un valor directo, usarlo
                      setState(callback);
                      console.log("Estado seleccionado para enviar:", callback);
                    }
                  }}
                  setItems={() => { }}
                  placeholder="Select State"
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.input, { borderColor: errors.state ? "red" : "#0458AB" }]}
                  listMode="MODAL"
                  modalTitle="Select a State"
                  modalProps={{
                    animationType: "slide"
                  }}
                  searchable={true}
                  searchablePlaceholder="Search..."
                  searchablePlaceholderTextColor="#9ca3af"
                  onSearchTextChange={text => setSearchTerm(text)}
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                  dropDownContainerStyle={{ maxHeight: 500 }}
                />
              </View>

              <View style={{ zIndex: 2000, marginTop: 16 }}>
                <Text style={styles.text}>Date <Text style={styles.required}>(*)</Text></Text>
                <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={[styles.input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
                  <Text style={{ color: date ? "#000" : "#9ca3af" }}>{date ? date : "Select a date"}</Text>
                  <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={isDatePickerVisible} mode="date"
                  onConfirm={(selectedDate) => {
                    setDatePickerVisibility(false);
                    setDate(selectedDate.toISOString().split('T')[0]);
                  }}
                  onCancel={() => setDatePickerVisibility(false)}
                />
              </View>

              <View style={{ zIndex: 2000, marginTop: 16 }}>
                <Text style={styles.text}>Company customer <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={openCompany} value={company || ""}
                  items={Array.isArray(companyList) ? companyList.map((companyItem) => ({ label: companyItem.name, value: companyItem.id })) : []}
                  setOpen={setOpenCompany} setValue={setCompany} setItems={() => []}
                  placeholder="Select Company"
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.input, { borderColor: errors.company ? "red" : "#0458AB" }]}
                  listMode="SCROLLVIEW"
                  dropDownContainerStyle={{ maxHeight: 200 }} // Set max height for dropdown
                />
              </View>

              <Text style={styles.textLarge}>General Data</Text>

              {[
                { label: "Key/Reference", state: keyReference, setState: setKeyReference, keyboardType: "default" },
                { label: "Customer Name", state: customerName, setState: setCustomerName, keyboardType: "default" },
                { label: "Customer Last Name", state: customerLastName, setState: setCustomerLastName, keyboardType: "default" },
              ].map((input, index) => (
                <View key={index}>
                  <Text style={styles.text}>{input.label} <Text style={styles.required}>(*)</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder={input.label}
                    placeholderTextColor="#9ca3af"
                    value={input.state}
                    onChangeText={input.setState}
                    keyboardType={input.keyboardType as "default" | "numeric"}
                  />
                </View>
              ))}

              <Text style={styles.text}>Cell Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Cell Phone Number"
                placeholderTextColor="#9ca3af"
                value={cellPhone}
                onChangeText={setCellPhone}
                keyboardType="numeric"
              />

              <Text style={styles.text}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#9ca3af"
                value={address}
                onChangeText={setAddress}
              />

              <Text style={styles.text}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.text}>Weight (kg) <Text style={styles.required}>(*)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                placeholderTextColor="#9ca3af"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />

              <View style={{ zIndex: 1000 }}>
                <Text style={styles.text}>Job <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={openJob} value={job || ""}
                  items={jobList.map((jobItem) => ({ label: jobItem.name, value: jobItem.id }))}
                  setOpen={setOpenJob} setValue={setJob} setItems={() => { }}
                  placeholder="Select Job"
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.input, { borderColor: errors.job ? "red" : "#0458AB" }]}
                  listMode="SCROLLVIEW"
                  dropDownContainerStyle={{ maxHeight: 200 }} // Set max height for dropdown
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                  <Text style={styles.buttonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
                  <Text style={styles.buttonTextSave}>Save</Text>
                </TouchableOpacity>
              </View>
            </ThemedView>

            {/* Operator Modal */}
            <OperatorModal visible={operatorModalVisible} onClose={() => setOperatorModalVisible(false)} orderKey={savedOrderKey} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
