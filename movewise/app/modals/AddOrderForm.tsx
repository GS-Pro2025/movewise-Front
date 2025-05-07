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
import { useTranslation } from 'react-i18next';

interface AddOrderModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddOrderModal({ visible, onClose }: AddOrderModalProps) {
  const { t } = useTranslation();
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

  const handleSaveOperators = () => {
    console.log("Operators saved successfully! Closing both modals.");
    setOperatorModalVisible(false); // Cerrar OperatorModal
    if (onClose) {
      onClose(); // Cerrar AddOrderForm
    }
  };
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
      console.log(t('order_saved_successfully'), savedOrder);
      if (savedOrder) {
        alert(t('order_saved_successfully'));
        setSavedOrderKey(savedOrder.key); // Store the key from savedOrder
        setOperatorModalVisible(true); // Show OperatorModal instead of pushing to it
      }
    } catch (error) {
      console.error(t('error_saving_order'), error);
    }
  };

  const fetchStates = async () => {
    try {
      const states = await ListStates();
      setStateList(states);
    } catch (error) {
      console.error(t('error_fetching_states'), error);
    }
  };

  const fetchJobs = async () => {
    try {
      const jobs = await ListJobs();
      setJobList(jobs);
    } catch (error) {
      console.error(t('error_fetching_jobs'), error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companies = await ListCompanies();
      setCompanyList(companies);
    } catch (error) {
      console.error(t('error_fetching_companies'), error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchStates();
  }, []);

  const validateFields = () => {
    let newErrors: { [key: string]: string } = {};
    if (!state) newErrors.state = t('state_required');
    if (!date) newErrors.date = t('date_required');
    if (!keyReference) newErrors.keyReference = t('key_reference_required');
    if (!customerName) newErrors.customerName = t('customer_name_required');
    if (!customerLastName) newErrors.customerLastName = t('customer_last_name_required');
    if (!weight) newErrors.weight = t('weight_required');
    if (!job) newErrors.job = t('job_required');
    if (!company) newErrors.company = t('company_required');

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
              <Text style={styles.textLarge}>{t('add_order')}</Text>
            </View>

            <ThemedView style={styles.container}>
              <View style={{ zIndex: 3000 }}>
                <Text style={styles.text}>{t('state')} <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={open}
                  value={state || ""}
                  items={stateList.map((stateItem) => ({
                    label: `${stateItem.name} (${stateItem.code})`,
                    value: stateItem.code,
                    key: stateItem.code
                  }))}
                  setOpen={setOpen}
                  setValue={setState}
                  placeholder={t('select_state')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.input, { borderColor: errors.state ? "red" : "#0458AB" }]}
                  listMode="MODAL"
                  modalTitle={t('select_state')}
                  searchable={true}
                  searchPlaceholder={t('search')}
                  searchPlaceholderTextColor="#9ca3af"
                  scrollViewProps={{ nestedScrollEnabled: true }}
                  dropDownContainerStyle={{ maxHeight: 500 }}
                />
              </View>

              <View style={{ zIndex: 2000, marginTop: 16 }}>
                <Text style={styles.text}>{t('date')} <Text style={styles.required}>(*)</Text></Text>
                <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={[styles.input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
                  <Text style={{ color: date ? "#000" : "#9ca3af" }}>{date ? date : t('select_date')}</Text>
                  <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={(selectedDate) => {
                    setDatePickerVisibility(false);
                    setDate(selectedDate.toISOString().split('T')[0]);
                  }}
                  onCancel={() => setDatePickerVisibility(false)}
                />
              </View>

              <View style={{ zIndex: 2000, marginTop: 16 }}>
                <Text style={styles.text}>{t('company_customer')} <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={openCompany}
                  value={company || ""}
                  items={Array.isArray(companyList) ? companyList.map((companyItem) => ({ label: companyItem.name, value: companyItem.id })) : []}
                  setOpen={setOpenCompany}
                  setValue={setCompany}
                  placeholder={t('select_company')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.input, { borderColor: errors.company ? "red" : "#0458AB" }]}
                  listMode="SCROLLVIEW"
                  dropDownContainerStyle={{ maxHeight: 200 }}
                />
              </View>

              <Text style={styles.textLarge}>{t('general_data')}</Text>

              {[{
                label: t('key_reference'),
                state: keyReference,
                setState: setKeyReference,
                keyboardType: "default"
              }, {
                label: t('customer_name'),
                state: customerName,
                setState: setCustomerName,
                keyboardType: "default"
              }, {
                label: t('customer_last_name'),
                state: customerLastName,
                setState: setCustomerLastName,
                keyboardType: "default"
              }].map((input, index) => (
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

              <Text style={styles.text}>{t('cell_phone')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('cell_phone')}
                placeholderTextColor="#9ca3af"
                value={cellPhone}
                onChangeText={setCellPhone}
                keyboardType="numeric"
              />

              <Text style={styles.text}>{t('address')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('address')}
                placeholderTextColor="#9ca3af"
                value={address}
                onChangeText={setAddress}
              />

              <Text style={styles.text}>{t('email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('email')}
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.text}>{t('weight')} (kg) <Text style={styles.required}>(*)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder={t('weight')}
                placeholderTextColor="#9ca3af"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />

              <View style={{ zIndex: 1000 }}>
                <Text style={styles.text}>{t('job')} <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={openJob}
                  value={job || ""}
                  items={jobList.map((jobItem) => ({ label: jobItem.name, value: jobItem.id.toString() }))}
                  setOpen={setOpenJob}
                  setValue={setJob}
                  placeholder={t('select_job')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.input, { borderColor: errors.job ? "red" : "#0458AB" }]}
                  listMode="SCROLLVIEW"
                  dropDownContainerStyle={{ maxHeight: 200 }}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                  <Text style={styles.buttonTextCancel}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
                  <Text style={styles.buttonTextSave}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </ThemedView>

            {/* Operator Modal */}
            <OperatorModal visible={operatorModalVisible} 
              onClose={() => setOperatorModalVisible(false)} 
              orderKey={savedOrderKey || 'There is no key'}
              onSave={handleSaveOperators} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}