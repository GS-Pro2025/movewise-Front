import { Modal, View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { useRouter } from "expo-router";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareView } from '../../components/KeyboardAwareView';
import { ListJobs } from '@/hooks/api/JobClient';
import { ListStates } from '@/hooks/api/StatesClient';
import UpdateOrderFormApi from '@/hooks/api/UpdateOrderFormApi';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import OperatorModal from './OperatorModal';
import { useTranslation } from 'react-i18next';
import CrossPlatformImageUpload from './CrossPlatformImageUpload';
import { ImageInfo } from './CrossPlatformImageUpload';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import OrderModal from './OrderModal';
import { CustomerFactory } from '@/hooks/api/CustomerFactoryClient';

interface Job {
  id: number;
  name: string;
}

interface UpdateOrderModalProps {
  visible?: boolean;
  onClose?: () => void;
  orderData: {
    key: string;
    state_usa: string;
    date: string | null;
    key_ref: string;
    person: {
      first_name: string;
      last_name: string;
      email: string;
      phone: number;
      address: string;
    };
    job?: number;
    weight: string;
    distance?: number;
    expense?: string;
    income?: string;
    status?: string;
    payStatus?: number;
    customer_factory?: number;
    dispatch_ticket?: string;
  };
}
export default function UpdateOrderModal() {
  const params = useLocalSearchParams();
  const orderData = params.order ? JSON.parse(params.order as string) : null;

  const { t } = useTranslation();
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const router = useRouter();
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [addOperatorVisible, setAddOperatorVisible] = useState(false);
  const { updateOrder, isLoading } = UpdateOrderFormApi();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [openCompany, setOpenCompany] = useState(false);
  const [company, setCompany] = useState<number | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [keyReference, setKeyReference] = useState('');
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [cellPhone, setCellPhone] = useState(0);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [weight, setWeight] = useState('');
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobList, setJobList] = useState<Job[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dispatchTicket, setDispatchTicket] = useState<ImageInfo | null>(null);
  const [hasExistingDispatchTicket, setHasExistingDispatchTicket] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchStates();

    if (orderData) {
      // Convertir customer_factory a número si existe
      const customerFactoryValue = orderData.customer_factory
        ? typeof orderData.customer_factory === 'string'
          ? parseInt(orderData.customer_factory, 10)
          : orderData.customer_factory
        : null;

      setCompany(customerFactoryValue);
      setState(orderData.state_usa || null);

      setDate(orderData.date || '');
      setKeyReference(orderData.key_ref || '');
      setCustomerFirstName(orderData.person?.first_name || '');
      setCustomerLastName(orderData.person?.last_name || '');
      setCellPhone(orderData.person?.phone || 0);
      setAddress(orderData.person?.address || '');
      setEmail(orderData.person?.email || '');
      setWeight(orderData.weight || '');
      setJobId(orderData.job || null);

      if (orderData.dispatch_ticket) {
        setHasExistingDispatchTicket(true);
        setDispatchTicket({
          uri: orderData.dispatch_ticket,
          width: 100,
          height: 100,
          base64: orderData.dispatch_ticket
        } as ImageInfo);
      }
    }
  }, [visible, orderData]);

  const fetchJobs = async () => {
    try {
      const jobs = await ListJobs();
      setJobList(Array.isArray(jobs) ? jobs : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobList([]);
    }
  };

  const fetchStates = async () => {
    try {
      const states = await ListStates();
      setStateList(Array.isArray(states) ? states : []);
    } catch (error) {
      console.error('Error fetching states:', error);
      setStateList([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companies = await CustomerFactory();
      const companyArray = Array.isArray(companies) ? companies : [];
      setCompanyList(companyArray);
      // console.log("Companies fetched:", companyArray);
    } catch (error) {
      console.error(t('error_fetching_companies'), error);
      setCompanyList([]);
    }
  };

  const handleChange = (field: string, value: any): void => {
    // console.log(`UpdateOrderForm - Changing ${field} to:`, value);

    // Actualizar el estado dinámicamente
    if (field === "dispatch_ticket") {
      setDispatchTicket(value);
      setHasExistingDispatchTicket(false); // Si se carga una nueva imagen, ya no estamos usando la existente
    } else {
      console.warn(`Unhandled field: ${field}`);
    }

    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prevErrors => ({ ...prevErrors, [field]: '' }));
    }
  };

  const validateFields = async () => {
    let newErrors: { [key: string]: string } = {};
    if (!state) newErrors.state = t("state_required");
    if (!date) newErrors.date = t("date_required");
    if (!keyReference) newErrors.keyReference = t("key_reference_required");
    if (!customerFirstName) newErrors.customerFirstName = t("customer_first_name_required");
    if (!customerLastName) newErrors.customerLastName = t("customer_last_name_required");
    if (!weight) newErrors.weight = t("weight_required");
    if (!jobId) newErrors.job = t("job_required");
    if (!company) newErrors.company = t("company_required");

    // Validar dispatch ticket
    if (!dispatchTicket && !hasExistingDispatchTicket) {
      newErrors.dispatchTicket = t('dispatch_ticket_required');
    } else if (dispatchTicket && !hasExistingDispatchTicket) {
      // Solo verificar tamaño si es una nueva imagen
      try {
        const fileInfo = await FileSystem.getInfoAsync(dispatchTicket.uri);
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
          newErrors.dispatchTicket = t('dispatch_ticket_size_exceeded');
          Toast.show({
            type: 'error',
            text1: t('error'),
            text2: t('dispatch_ticket_size_exceeded'),
          });
        } else if (!fileInfo.exists) {
          newErrors.dispatchTicket = t('dispatch_ticket_not_found');
          Toast.show({
            type: 'error',
            text1: t('error'),
            text2: t('dispatch_ticket_not_found'),
          });
        }
      } catch (error) {
        console.error("Error validating file:", error);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveOperators = () => {
    setAddOperatorVisible(false);
    router.back();
  };

  // Dentro de la función handleUpdate modifica esta parte

  // Definamos primero un tipo para el objeto updateData
  type UpdateOrderData = {
    key_ref: string;
    date: string;
    distance: number;
    expense: string;
    income: string;
    weight: string;
    status: string;
    payStatus: number;
    state_usa: string;
    customer_factory: number;
    person: {
      email: string;
      first_name: string;
      last_name: string;
      phone: number;
      address: string;
    };
    job: number;
    dispatch_ticket?: string; // optional property
  }

  const handleUpdate = async () => {
    if (!(await validateFields())) return;

    try {
      let base64Image = undefined;

      if (dispatchTicket) {

        if (hasExistingDispatchTicket && dispatchTicket.uri === orderData.dispatch_ticket) {
          console.log("Using existing image - will not send");
        } else {
          if (dispatchTicket.uri && dispatchTicket.uri.startsWith('data:')) {
            base64Image = dispatchTicket.uri;
            console.log("Using existing URI in base64 format");
          } else if (dispatchTicket.uri) {
            // Convert to base64
            try {
              console.log("Converting image to base64:", dispatchTicket.uri);
              base64Image = await FileSystem.readAsStringAsync(dispatchTicket.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              base64Image = `data:image/jpeg;base64,${base64Image}`;
            } catch (error) {
              console.error("Error converting image to base64:", error);
              Toast.show({
                type: 'error',
                text1: t('error'),
                text2: t('error_processing_image'),
              });
              return;
            }
          } else {
            console.error("dispatchTicket does not have a valid URI");
            Toast.show({
              type: 'error',
              text1: t('error'),
              text2: t('invalid_image_format'),
            });
            return;
          }
        }
      }

      const customerFactoryValue = typeof company === 'number' ? company :
        company ? parseInt(company, 10) : 0;

      // Create the updateData object without including dispatch_ticket initially
      const updateData = {
        key_ref: keyReference,
        date: date || '',
        distance: orderData.distance || 0,
        expense: orderData.expense || "0",
        income: orderData.income || "0",
        weight: weight,
        status: orderData.status || t("in_progress"),
        payStatus: orderData.payStatus || 0,
        state_usa: state || '',
        customer_factory: customerFactoryValue,
        person: {
          email: email || '',
          first_name: customerFirstName,
          last_name: customerLastName,
          phone: cellPhone,
          address: address,
        },
        job: jobId || 0,
      } as UpdateOrderData;

      // Only add the dispatch_ticket field if the image has been modified and is a valid string
      if (base64Image !== undefined) {
        console.log("Including dispatch_ticket in the request");
        updateData.dispatch_ticket = base64Image;
      } else {
        console.log("No se incluirá dispatch_ticket en la solicitud");
      }

      const result = await updateOrder(orderData.key || '', updateData);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: t("success"),
          text2: t("order_updated_successfully")
        });
        if (onClose) onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: t("error"),
          text2: `${t("unexpected_error_occurred")}}`
        });
      }
    } catch (err: any) {
      console.error(t("error_in_handle_update"), err);
      Toast.show({
        type: 'error',
        text1: t("error"),
        text2: `${t("unexpected_error_occurred")}: ${err.message}`
      });
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
      <View style={{ flex: 1, backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF' }}>
        <KeyboardAwareView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E3A5F' : '#0458AB' }]}>
              <Text style={[styles.headerText, { color: '#FFFFFF' }]}>{t("edit_order")}</Text>
              <Text style={{ color: '#FFFFFF' }}>{t("current_order")}: {orderData.key}</Text>
            </View>

            <ThemedView style={{ padding: 16, flex: 1, backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF' }}>
              <View style={[styles.inputContainer, { zIndex: 3000 }]}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("state")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <DropDownPicker
                  open={stateDropdownOpen}
                  value={state}
                  items={stateList.map((stateItem) => ({
                    label: `${stateItem.name} (${stateItem.code})`,
                    value: stateItem.code,
                    key: stateItem.code
                  }))}
                  setOpen={setStateDropdownOpen}
                  setValue={setState}
                  placeholder={t("select_state")}
                  style={[styles.dropdown, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: errors.state ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                  dropDownContainerStyle={{
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }}
                  listMode="MODAL"
                  modalTitle={t("select_state")}
                  searchable={true}
                  searchPlaceholder={t("search")}
                  listItemLabelStyle={{
                    color: isDarkMode ? '#FFFFFF' : '#333333'
                  }}
                  textStyle={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}
                  placeholderStyle={{ color: isDarkMode ? '#AAAAAA' : '#666666' }}
                />
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
              </View>

              <View style={[styles.inputContainer, { zIndex: 2000, marginTop: 16 }]}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("date")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setDatePickerVisibility(true)}
                  style={[styles.dateButton, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: errors.date ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                >
                  <Text style={{ color: date ? (isDarkMode ? "#ffffff" : "#000") : "#9ca3af" }}>
                    {date ? date : t('select_date')}
                  </Text>
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
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              </View>

              <View style={[styles.inputContainer, { zIndex: 2000, marginTop: 16 }]}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("company_customer")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <DropDownPicker
                  open={openCompany}
                  value={company}
                  items={companyList.map((companyItem) => ({
                    label: companyItem.name,
                    value: companyItem.id_factory,
                    key: companyItem.id_factory.toString()
                  }))}
                  setOpen={setOpenCompany}
                  setValue={(val) => {
                    // console.log("Company selected:", val);
                    // console.log("Company type:", typeof val);
                    // Asegurar que sea numérico
                    if (val !== null) {
                      const numericVal = typeof val === 'string' ? parseInt(val, 10) : val;
                      setCompany(numericVal);
                      // console.log("Company set to:", numericVal, "type:", typeof numericVal);
                    } else {
                      setCompany(null);
                    }
                  }}
                  placeholder={t('select_company')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.dropdown, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: errors.company ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                  dropDownContainerStyle={{
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }}
                  listMode="SCROLLVIEW"
                  zIndex={3000}
                  zIndexInverse={1000}
                  listItemLabelStyle={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}
                  textStyle={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}
                />
                {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
              </View>

              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#A1C6EA' : '#0458AB' }]}>{t("general_data")}</Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("key_reference")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <TextInput
                  value={keyReference}
                  onChangeText={setKeyReference}
                  placeholder={t("key_reference_placeholder")}
                  placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#333333',
                    borderColor: errors.keyReference ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                />
                {errors.keyReference && <Text style={styles.errorText}>{errors.keyReference}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("customer_first_name")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <TextInput
                  value={customerFirstName}
                  onChangeText={setCustomerFirstName}
                  placeholder={t("customer_first_name_placeholder")}
                  placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#333333',
                    borderColor: errors.customerFirstName ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                />
                {errors.customerFirstName && <Text style={styles.errorText}>{errors.customerFirstName}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("customer_last_name")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <TextInput
                  value={customerLastName}
                  onChangeText={setCustomerLastName}
                  placeholder={t("customer_last_name_placeholder")}
                  placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#333333',
                    borderColor: errors.customerLastName ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                />
                {errors.customerLastName && <Text style={styles.errorText}>{errors.customerLastName}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("cell_phone")}
                </Text>
                <TextInput
                  value={cellPhone.toString()}
                  onChangeText={(text) => {
                    const numericValue = parseInt(text.replace(/\D/g, ''), 10); // solo dígitos
                    setCellPhone(isNaN(numericValue) ? 0 : numericValue);
                  }}
                  placeholder={t("cell_phone_placeholder")}
                  placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                  keyboardType="numeric"
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#333333',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                />

              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("address")}
                </Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder={t("address_placeholder")}
                  placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#333333',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("email")}
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t("email_placeholder")}
                  placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                  keyboardType="email-address"
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#333333',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("weight")} (kg) <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0.0"
                  placeholderTextColor={isDarkMode ? '#AAAAAA' : '#666666'}
                  keyboardType="numeric"
                  style={[styles.input, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#333333',
                    borderColor: errors.weight ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                />
                {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
              </View>

              <View style={[styles.inputContainer, { zIndex: 1000 }]}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("job")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <DropDownPicker
                  open={jobDropdownOpen}
                  value={jobId}
                  items={jobList.map(jobItem => ({
                    label: jobItem.name,
                    value: jobItem.id,
                    key: jobItem.id.toString()
                  }))}
                  setOpen={setJobDropdownOpen}
                  setValue={setJobId}
                  placeholder={t("job_placeholder")}
                  style={[styles.dropdown, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: errors.job ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                  dropDownContainerStyle={{
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }}
                  listMode="SCROLLVIEW"
                  textStyle={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}
                  placeholderStyle={{ color: isDarkMode ? '#AAAAAA' : '#666666' }}
                />
                {errors.job && <Text style={styles.errorText}>{errors.job}</Text>}
              </View>

              <View style={{ zIndex: 50, marginTop: 16 }}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("dispatch_ticket")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <CrossPlatformImageUpload
                  label={t("upload_dispatch_ticket")}
                  image={dispatchTicket}
                  onImageSelected={(image) => handleChange("dispatch_ticket", image)}
                  error={errors.dispatchTicket}
                  required={true}
                  aspect={[16, 9]}
                  allowsEditing={true}
                  maxWidth={1024}
                  maxHeight={768}
                  quality={0.9}
                />
                {hasExistingDispatchTicket && dispatchTicket?.uri === orderData.dispatch_ticket && (
                  <Text style={{ color: isDarkMode ? '#A1C6EA' : '#0458AB', marginTop: 5 }}>
                    {t("using_existing_dispatch_ticket")}
                  </Text>
                )}
              </View>

              <TouchableOpacity style={styles.operatorsButton} onPress={() => setAddOperatorVisible(true)}>
                <Text style={[styles.operatorsButtonText, { color: isDarkMode ? '#A1C6EA' : '#0458AB' }]}>{t("edit_operators")}</Text>
              </TouchableOpacity>

              <OperatorModal
                visible={addOperatorVisible}
                onClose={() => setAddOperatorVisible(false)}
                orderKey={orderData.key}
                onSave={handleSaveOperators}
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: isDarkMode ? '#545257' : '#777' }]}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: isDarkMode ? '#A1C6EA' : '#0458AB' }]}
                  onPress={handleUpdate}
                  disabled={isLoading}
                >
                  <Text style={[styles.saveButtonText, { color: isDarkMode ? '#0458AB' : '#FFFFFF' }]}>
                    {isLoading ? t("saving") : t("save")}
                  </Text>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </ScrollView>
        </KeyboardAwareView>
        <Toast />
      </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 30
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
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
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
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
