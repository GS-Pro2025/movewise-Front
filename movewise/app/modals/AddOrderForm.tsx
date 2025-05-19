import { ActivityIndicator, Modal, SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
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
import { ListStates } from '@/hooks/api/StatesClient';
import OperatorModal from './OperatorModal';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { ImageUpload } from './CreateOperator/HelperComponents';
import { ImageInfo } from 'expo-image-picker'
import * as FileSystem from 'expo-file-system';
import { DeleteOrder } from '@/hooks/api/DeleteOrder';
import { CustomerFactory } from '@/hooks/api/CustomerFactoryClient';
interface AddOrderModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddOrderModal({ visible, onClose }: AddOrderModalProps) {
  if (!visible) return;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [openJob, setOpenJob] = useState(false);
  const [job, setJob] = useState<string | null>(null);
  const [openCompany, setOpenCompany] = useState(false);
  const [company, setCompany] = useState<number | null>(null);
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
  const [dispatchTicket, setDispatchTicket] = useState<ImageInfo | null>(null); // State for dispatch_Ticket
  const { saveOrder, isLoading, error } = AddOrderformApi();

  const handleSaveOperators = () => {
    console.log("Operators saved successfully! Closing both modals.");
    setOperatorModalVisible(false); // close OperatorModal
    if (onClose) {
      onClose(); // close AddOrderForm
    }
  };

  // Handler for deleting an order
  const handleDeleteOrder = (key: string) => {
    Alert.alert(
      t("confirm_delete"),
      t("delete_order_confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              console.log(t("deleting_order"), key);
              await DeleteOrder(key);
              Toast.show({
                type: "success",
                text1: t("order_deleted"),
                text2: t("order_deleted_successfully"),
              });
              // Close the modal after successful deletion
              onClose();
            } catch (error) {
              console.error(t("error_deleting_order"), error);
              Toast.show({
                type: "error",
                text1: t("order_not_deleted"),
                text2: t("order_could_not_be_deleted"),
              });
            }
          }
        }
      ]
    );
  };

  // Handler for cancel button click
  const handleCancel = () => {
    // If we have created an order but not assigned operators, offer to delete it
    if (savedOrderKey) {
      handleDeleteOrder(savedOrderKey);
    } else {
      // No order was created, just close the modal
      onClose();
    }
  };

  // Update the model to ensure that customer_factory is of type number
  interface AddOrderFormModel extends Omit<AddOrderForm, 'customer_factory'> {
    customer_factory: number;
  }

  const handleSave = async () => {
    if (isLoading) return;
    if (!validateFields()) return;

    //validate fields
    if (
      !customerName?.trim() ||
      !customerLastName?.trim() ||
      !address?.trim() ||
      // !email?.trim() ||
      !cellPhone?.trim() ||
      !date ||
      !state ||
      !weight ||
      !keyReference ||
      !company
    ) {
      Toast.show({
        text1: t('error'),
        text2: t('please_fill_all_required_fields'), // Asegúrate de tener esta traducción
        type: 'error',
      });
      return;
    }

    let base64Image = null;
    if (dispatchTicket) {
      base64Image = await FileSystem.readAsStringAsync(dispatchTicket.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      base64Image = `data:image/jpeg;base64,${base64Image}`;
    }

    const customerFactoryValue = typeof company === 'number' ? company :
      company ? parseInt(company) : 0;

    const orderData: AddOrderFormModel = {
      status: "Pending",
      date,
      key_ref: keyReference,
      state_usa: state,
      person: {
        first_name: customerName,
        last_name: customerLastName,
        address: address,
        email: email,
        phone: cellPhone,
      },
      weight,
      job: job || "",
      customer_factory: customerFactoryValue,
      dispatch_ticket: base64Image,
    };

    console.log("Order data to be sent:", JSON.stringify(orderData));

    try {
      const savedOrder = await saveOrder(orderData);
      console.log(t('order_saved_successfully'), savedOrder);
      if (savedOrder) {
        Toast.show({
          text1: t('success'),
          text2: t('order_saved_successfully'),
          type: 'success',
        });
        await new Promise(resolve => setTimeout(resolve, 900));
        setSavedOrderKey(savedOrder.key);
        setOperatorModalVisible(true);
      }
    } catch (error) {
      console.error(t('error_saving_order'), error);
      Toast.show({
        text1: t('error'),
        text2: t('error_saving_order'),
        type: 'error',
      });
    }
  };


  const fetchStates = async () => {
    try {
      const states = await ListStates();
      // Asegurar que siempre sea un array
      setStateList(Array.isArray(states) ? states : []);
    } catch (error) {
      console.error(t('error_fetching_states'), error);
      setStateList([]); // Resetear a array vacío en errores
    }
  };

  const fetchJobs = async () => {
    try {
      const jobs = await ListJobs();
      // console.log(`recibiendo jobs ${JSON.stringify(jobs)}`);

      setJobList(Array.isArray(jobs) ? jobs : []);


    } catch (error) {
      console.error(t('error_fetching_jobs'), error);
      setJobList([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companies = await CustomerFactory();
      console.log("Companies raw response:", companies);

      const companyArray = Array.isArray(companies) ? companies : [];
      setCompanyList(companyArray);

      console.log("Companies fetched:", companyArray);
      console.log("First company value:", companyArray[0]?.id_factory);
      console.log("First company type:", typeof companyArray[0]?.id_factory);
    } catch (error) {
      console.error(t('error_fetching_companies'), error);
      setCompanyList([]);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchStates();
  }, []);

  // Registrar cambios en el valor de company
  useEffect(() => {
    console.log("Company value changed:", company);
  }, [company]);

  const handleChange = (field: string, value: any): void => {
    console.log(`AddOrderForm - Changing ${field} to:`, value);

    // Actualizar el estado dinámicamente
    if (field === "dispatch_ticket") {
      setDispatchTicket(value);
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!state) newErrors.state = t('state_required');
    if (!date) newErrors.date = t('date_required');
    if (!keyReference) newErrors.keyReference = t('key_reference_required');
    if (!customerName) newErrors.customerName = t('customer_name_required');
    if (!customerLastName) newErrors.customerLastName = t('customer_last_name_required');
    if (!email) { newErrors.email = t('email_required'); } else if (!emailRegex.test(email)) { newErrors.email = t('invalid_email_format'); }
    if (!weight) newErrors.weight = t('weight_required');
    if (!job) newErrors.job = t('job_required');
    if (!company) newErrors.company = t('company_required');
    if (!dispatchTicket) newErrors.dispatchTicket = t('dispatch_ticket_required');
    //validamos el tamaño del dispatch ticket 5mb
    if (!dispatchTicket) {
      newErrors.dispatchTicket = t('dispatch_ticket_required');
    } else {
      const fileInfo = await FileSystem.getInfoAsync(dispatchTicket.uri);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 5 * 1024 * 1024) { // Verificar si el archivo existe y tiene tamaño
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
    }

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
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent={true}
      hardwareAccelerated={true}>
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
                  <Text style={{ color: date ? (colorScheme === 'dark' ? "#ffffff" : "#000") : "#9ca3af" }}>{date ? date : t('select_date')}</Text>
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
                  value={company}
                  items={companyList.map((companyItem) => ({
                    label: companyItem.name,
                    value: companyItem.id_factory,
                    key: companyItem.id_factory.toString()
                  }))}
                  setOpen={setOpenCompany}
                  setValue={(val) => {
                    console.log("Company selected:", val);
                    console.log("Company type:", typeof val);
                    // Asegurar que sea numérico
                    if (val !== null) {
                      const numericVal = typeof val === 'string' ? parseInt(val, 10) : val;
                      setCompany(numericVal);
                      console.log("Company set to:", numericVal, "type:", typeof numericVal);
                    } else {
                      setCompany(null);
                    }
                  }}
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
                keyboardType: "default",
                errorKey: "keyReference"
              }, {
                label: t('customer_name'),
                state: customerName,
                setState: setCustomerName,
                keyboardType: "default",
                errorKey: "customerName"
              }, {
                label: t('customer_last_name'),
                state: customerLastName,
                setState: setCustomerLastName,
                keyboardType: "default",
                errorKey: "customerLastName"
              }].map((input, index) => (
                <View key={index}>
                  <Text style={styles.text}>{input.label} <Text style={styles.required}>(*)</Text></Text>
                  <TextInput
                    style={[styles.input, { borderColor: errors[input.errorKey] ? "red" : (colorScheme === 'dark' ? '#64748b' : '#0458AB') }]}
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

              // En la sección del campo email, modificar el código a:
              <Text style={styles.text}>{t('email')} <Text style={styles.required}>(*)</Text>
              </Text>
              {errors.email && (
                <Text style={{ color: 'red', marginTop: 4, marginBottom: 8 }}>
                  {errors.email}
                </Text>
              )}
              <TextInput
                style={[styles.input, { borderColor: errors.email ? "red" : (colorScheme === 'dark' ? '#64748b' : '#0458AB') }]}
                placeholder={t('email')}
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ zIndex: 1000 }}>
                <Text style={styles.text}>{t('job')} <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={openJob}
                  value={job}
                  items={jobList.map((jobItem) => ({
                    label: jobItem.name,
                    value: jobItem.id.toString(),
                    key: jobItem.id.toString()
                  }))}
                  setOpen={setOpenJob}
                  setValue={(val) => {
                    console.log("Job selected:", val);
                    setJob(val);
                  }}
                  placeholder={t('select_job')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.input, { borderColor: errors.job ? "red" : "#0458AB" }]}
                  listMode="SCROLLVIEW"
                  dropDownContainerStyle={{ maxHeight: 200 }}
                />
              </View>

              <Text style={styles.text}>{t('weight')} (kg) <Text style={styles.required}>(*)</Text></Text>
              <TextInput
                style={[styles.input, { borderColor: errors.weight ? "red" : (colorScheme === 'dark' ? '#64748b' : '#0458AB') }]}
                placeholder={t('weight')}
                placeholderTextColor="#9ca3af"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />

              <View style={{ zIndex: 50, marginTop: 16 }}>
                <Text style={styles.text}>{t('dispatch_ticket')} <Text style={styles.required}>(*)</Text></Text>
                <ImageUpload
                  label={t("upload_dispatch_ticket")}
                  image={dispatchTicket || null}
                  onImageSelected={(image) => handleChange("dispatch_ticket", image)} // Usar handleChange para actualizar el estado
                  error={errors.dispatchTicket}
                  required={true}
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonCancel} onPress={handleCancel}>
                  <Text style={styles.buttonTextCancel}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.buttonSave,
                    isLoading && { opacity: 0.7 }
                  ]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      color={colorScheme === 'dark' ? '#0458AB' : '#FFFFFF'}
                    />
                  ) : (
                    <Text style={styles.buttonTextSave}>{t('save')}</Text>
                  )}
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
      <Toast />
    </Modal>
  );
}