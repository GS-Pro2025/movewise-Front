import { Modal, View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect, useRef } from 'react';
import _PhoneInput from 'react-native-phone-number-input';
import CountryFlag from 'react-native-country-flag';
import type { CountryCode } from 'react-native-country-picker-modal';

const PhoneInput = _PhoneInput as any;
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareView } from '@/components/KeyboardAwareView';
import { ListJobs } from '@/hooks/api/JobClient';
import UpdateOrderFormApi from '@/hooks/api/UpdateOrderFormApi';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import OperatorModal from '../operators/OperatorModal';
import { useTranslation } from 'react-i18next';
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';
import { ImageInfo } from '@/components/CrossPlatformImageUpload';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { CustomerFactory } from '@/hooks/api/CustomerFactoryClient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '@/components/ThemedView';
import { url } from '@/hooks/api/apiClient';
interface Job {
  id: number;
  name: string;
}

interface UpdateOrderModalProps {
  visible?: boolean;
  onClose?: () => void;
  orderData: {
    key: string;
    key_ref: string;
    date: string | null;
    distance: number | null;
    expense: string | null;
    income: string | null;
    weight: string;
    status: string;
    payStatus: number | null;
    state_usa: string;
    person: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      phone: number | null;
      address: string | null;
    };
    job: number;
    job_name: string | null;
    evidence: string | null;
    dispatch_ticket: string | null;
    customer_factory: number | 0;
  };
}

export default function UpdateOrderModal({ visible = true, onClose, orderData }: UpdateOrderModalProps) {
  // Use orderData from props instead of URL params
  const { t } = useTranslation();
  const router = useRouter();

  // Estados para ubicación
  const [openCountry, setOpenCountry] = useState(false);
  const [openStateRegion, setOpenStateRegion] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [country, setCountry] = useState<string | null>(null);
  const [stateRegion, setStateRegion] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [statesList, setStatesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Resto de estados
  const [addOperatorVisible, setAddOperatorVisible] = useState(false);
  const { updateOrder, isLoading } = UpdateOrderFormApi();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [openCompany, setOpenCompany] = useState(false);
  const [company, setCompany] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [keyReference, setKeyReference] = useState('');
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  // Estados para el campo de teléfono
  const phoneInput = useRef<any>(null);
  const [cellPhone, setCellPhone] = useState<string>('');

  const [formattedPhone, setFormattedPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>(() => {
    if (orderData?.person?.phone) {
      const phoneStr = orderData.person.phone.toString();
      return phoneStr.startsWith('+57') ? 'CO' : 'US';
    }
    return 'US';
  });

  const renderFlagButton = (props: any) => (
    <TouchableOpacity
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 48,
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
        width: 90,
      }}
      onPress={props.onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CountryFlag
          isoCode={props.isoCode}
          size={20}
          style={{ marginRight: 8 }}
        />
        <Text style={{
          color: isDarkMode ? '#FFFFFF' : '#333333',
          fontSize: 16,
          fontWeight: '500',
          marginLeft: 6,
          marginRight: 4,
        }}>
          {props.callingCode}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Format phone number as +prefijo-numero
  const formatPhoneNumber = (phone: string, countryCode: string) => {
    if (!phone) return '';
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Get the calling code for the country
    const callingCode = phoneInput.current?.getCallingCode() || '';
    // Format as +callingCode-number (only if we have a calling code and phone number)
    if (callingCode && cleaned) {
      return `+${callingCode}-${cleaned}`;
    }
    return phone;
  };
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [weight, setWeight] = useState('');
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobList, setJobList] = useState<Job[]>([]);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dispatchTicket, setDispatchTicket] = useState<ImageInfo | null>(null);
  const [hasExistingDispatchTicket, setHasExistingDispatchTicket] = useState(false);

  // Función para cargar países
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch(`${url}/orders-locations/?type=countries`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        const countries = data.data.map((c: any) => ({
          label: c.name,
          value: c.name
        }));
        setCountriesList(countries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountriesList([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Función para cargar estados
  const fetchStates = async (countryName: string) => {
    if (!countryName) return;
    setLoadingStates(true);
    try {
      const response = await fetch(
        `${url}/orders-locations/?type=states&country=${encodeURIComponent(countryName)}`
      );
      const data = await response.json();
      if (data.status === 'success') {
        const states = data.data.map((s: any) => ({
          label: s.name,
          value: s.name
        }));
        setStatesList(states);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  // Función para cargar ciudades
  const fetchCities = async (countryName: string, stateName: string) => {
    if (!countryName || !stateName) return;
    setLoadingCities(true);
    try {
      const response = await fetch(
        `${url}/orders-locations/?type=cities&country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}`
      );
      const data = await response.json();
      if (data.status === 'success') {
        const cities = data.data.map((c: any) => ({
          label: c.name,
          value: c.name
        }));
        setCitiesList(cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  // Cargar estados cuando cambia el país
  useEffect(() => {
    if (country) {
      // No resetear el estado si ya está establecido (durante la carga inicial)
      if (!stateRegion) {
        setStateRegion(null);
        setCity(null);
      }
      fetchStates(country);
    } else {
      setStatesList([]);
      setCitiesList([]);
    }
  }, [country]);

  // Cargar ciudades cuando cambia el estado
  useEffect(() => {
    if (country && stateRegion) {
      // No resetear la ciudad si ya está establecida (durante la carga inicial)
      if (!city) {
        setCity(null);
      }
      fetchCities(country, stateRegion);
    } else {
      setCitiesList([]);
    }
  }, [stateRegion]);

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchCountries(); // Cargar países al iniciar

    if (orderData) {
      // Convertir customer_factory a número si existe
      const customerFactoryValue = orderData.customer_factory
        ? typeof orderData.customer_factory === 'string'
          ? parseInt(orderData.customer_factory, 10)
          : orderData.customer_factory
        : null;

      setCompany(customerFactoryValue);

      // Descomponer la ubicación existente
      if (orderData.state_usa) {
        const locationParts = orderData.state_usa.split(' - ');
        if (locationParts.length >= 1) setCountry(locationParts[0]);
        if (locationParts.length >= 2) setStateRegion(locationParts[1]);
        if (locationParts.length >= 3) setCity(locationParts[2]);
      }

      setDate(orderData.date || '');
      setKeyReference(orderData.key_ref || '');
      setCustomerFirstName(orderData.person?.first_name || '');
      setCustomerLastName(orderData.person?.last_name || '');

      // Inicializar el teléfono
      if (orderData.person?.phone) {
        const phoneStr = orderData.person.phone.toString();
        if (phoneStr.includes('-')) {
          const [_, number] = phoneStr.split('-');
          setCellPhone(number);
          setFormattedPhone(phoneStr);
        } else {
          setCellPhone(phoneStr);
          setFormattedPhone(phoneStr);
        }
      } else {
        setCellPhone('');
        setFormattedPhone('');
      }

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
  }, []);

  const fetchJobs = async () => {
    try {
      const jobs = await ListJobs();
      setJobList(Array.isArray(jobs) ? jobs : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobList([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companies = await CustomerFactory();
      const companyArray = Array.isArray(companies) ? companies : [];
      setCompanyList(companyArray);
    } catch (error) {
      console.error(t('error_fetching_companies'), error);
      setCompanyList([]);
    }
  };

  const handleChange = (field: string, value: any): void => {
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
    if (!country) newErrors.country = t("country_required");
    if (!stateRegion) newErrors.stateRegion = t("state_region_required");
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
      phone: string;
      address: string;
    };
    job: number;
    dispatch_ticket?: string;
  }

  const handleUpdate = async () => {
    if (!(await validateFields())) return;

    try {
      let base64Image = undefined;

      // Construir ubicación
      const location = country && stateRegion && city
        ? `${country} - ${stateRegion} - ${city}`
        : null;

      if (!location) {
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: t('location_required'),
        });
        return;
      }

      if (dispatchTicket) {
        if (hasExistingDispatchTicket && dispatchTicket.uri === orderData.dispatch_ticket) {
          // Usar imagen existente sin cambios
        } else if (dispatchTicket.uri && dispatchTicket.uri.startsWith('data:')) {
          base64Image = dispatchTicket.uri;
        } else if (dispatchTicket.uri) {
          try {
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

      const customerFactoryValue = typeof company === 'number' ? company :
        company ? parseInt(company, 10) : 0;

      const updateData = {
        key_ref: keyReference,
        date: date || '',
        distance: orderData.distance || 0,
        expense: orderData.expense || "0",
        income: orderData.income || "0",
        weight: weight,
        status: orderData.status || t("in_progress"),
        payStatus: orderData.payStatus || 0,
        state_usa: location,
        customer_factory: customerFactoryValue,
        person: {
          email: email || '',
          first_name: customerFirstName,
          last_name: customerLastName,
          phone: formattedPhone || formatPhoneNumber(cellPhone, phoneCountryCode),
          address: address,
        },
        job: jobId || 0,
      } as UpdateOrderData;

      if (base64Image !== undefined) {
        updateData.dispatch_ticket = base64Image;
      }

      const result = await updateOrder(orderData.key || '', updateData);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: t("success"),
          text2: t("order_updated_successfully")
        });
        router.back();
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
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
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
              {/* Ubicación: País */}
              <View style={[styles.inputContainer, { zIndex: 3000 }]}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("country")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <DropDownPicker
                  open={openCountry}
                  value={country}
                  items={countriesList}
                  setOpen={setOpenCountry}
                  setValue={setCountry}
                  placeholder={t("select_country")}
                  loading={loadingCountries}
                  searchable={true}
                  style={[styles.dropdown, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: errors.country ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                  dropDownContainerStyle={{
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }}
                  listMode="MODAL"
                  modalTitle={t("select_country")}
                  searchPlaceholder={t("search")}
                  listItemLabelStyle={{
                    color: isDarkMode ? '#FFFFFF' : '#333333'
                  }}
                  textStyle={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}
                  placeholderStyle={{ color: isDarkMode ? '#AAAAAA' : '#666666' }}
                />
                {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
              </View>

              {/* Ubicación: Estado/Región */}
              <View style={[styles.inputContainer, { zIndex: 2900 }]}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("state_region")} <Text style={{ color: '#FF0000' }}>(*)</Text>
                </Text>
                <DropDownPicker
                  open={openStateRegion}
                  value={stateRegion}
                  items={statesList}
                  setOpen={setOpenStateRegion}
                  setValue={setStateRegion}
                  placeholder={t("select_state_region")}
                  loading={loadingStates}
                  searchable={true}
                  disabled={!country}
                  style={[styles.dropdown, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: errors.stateRegion ? "red" : isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                  dropDownContainerStyle={{
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }}
                  listMode="MODAL"
                  modalTitle={t("select_state_region")}
                  searchPlaceholder={t("search")}
                  listItemLabelStyle={{
                    color: isDarkMode ? '#FFFFFF' : '#333333'
                  }}
                  textStyle={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}
                  placeholderStyle={{ color: isDarkMode ? '#AAAAAA' : '#666666' }}
                />
                {errors.stateRegion && <Text style={styles.errorText}>{errors.stateRegion}</Text>}
              </View>

              {/* Ubicación: Ciudad */}
              <View style={[styles.inputContainer, { zIndex: 2800 }]}>
                <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#0458AB' }]}>
                  {t("city")}
                </Text>
                <DropDownPicker
                  open={openCity}
                  value={city}
                  items={citiesList}
                  setOpen={setOpenCity}
                  setValue={setCity}
                  placeholder={t("select_city")}
                  loading={loadingCities}
                  searchable={true}
                  disabled={!stateRegion}
                  style={[styles.dropdown, {
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }]}
                  dropDownContainerStyle={{
                    backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                    borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                  }}
                  listMode="MODAL"
                  modalTitle={t("select_city")}
                  searchPlaceholder={t("search")}
                  listItemLabelStyle={{
                    color: isDarkMode ? '#FFFFFF' : '#333333'
                  }}
                  textStyle={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}
                  placeholderStyle={{ color: isDarkMode ? '#AAAAAA' : '#666666' }}
                />
              </View>

              {/* Fecha */}
              <View style={[styles.inputContainer, { zIndex: 2700, marginTop: 16 }]}>
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

              {/* Empresa */}
              <View style={[styles.inputContainer, { zIndex: 2600, marginTop: 16 }]}>
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
                    if (val !== null) {
                      const numericVal = typeof val === 'string' ? parseInt(val, 10) : val;
                      setCompany(numericVal);
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

              {/* Campos de texto */}
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
                <View style={{
                  borderWidth: 1,
                  borderRadius: 8,
                  marginBottom: 4,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                  minHeight: 50,
                  overflow: 'hidden',
                }}>
                  <PhoneInput
                    ref={phoneInput}
                    value={cellPhone}
                    defaultCode={phoneCountryCode}
                    layout="first"
                    flagButton={renderFlagButton}
                    onChangeText={(text: string) => {
                      setCellPhone(text);
                      // Format the phone number with the current country code
                      const formatted = formatPhoneNumber(text, phoneCountryCode);
                      setFormattedPhone(formatted);
                    }}
                    onChangeFormattedText={(text: string) => {
                      // This will be called after the country changes
                      // We don't use this for setting the formatted phone as it includes the country code
                      // but doesn't match our desired format with the hyphen
                    }}
                    onChangeCountry={(country: any) => {
                      setPhoneCountryCode(country.cca2);
                      setCellPhone('');
                      // Update formatted phone when country changes
                      // Just update the country code, don't include the phone number yet
                      setFormattedPhone(`+${phoneInput.current?.getCallingCode()}`);
                    }}
                    withDarkTheme={isDarkMode}
                    withShadow={false}
                    autoFocus={false}
                    containerStyle={{
                      backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                      borderColor: isDarkMode ? '#A1C6EA' : '#0458AB',
                      height: 50,
                      minHeight: 50,
                    }}
                    textContainerStyle={{
                      backgroundColor: 'transparent',
                      height: 48,
                      paddingVertical: 0,
                      paddingLeft: 0,
                    }}
                    textInputStyle={{
                      color: isDarkMode ? '#FFFFFF' : '#333333',
                      height: 48,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      includeFontPadding: false,
                      textAlignVertical: 'center',
                      backgroundColor: 'transparent',
                    }}
                    codeTextStyle={{
                      color: isDarkMode ? '#FFFFFF' : '#333333',
                      height: 48,
                      paddingVertical: 0,
                      textAlignVertical: 'center',
                      lineHeight: 20,
                      backgroundColor: 'transparent',
                    }}
                    flagButtonStyle={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      minHeight: 48,
                      borderRightWidth: 1,
                      borderRightColor: '#e0e0e0',
                      width: 90,
                    }}
                    countryPickerButtonStyle={{
                      backgroundColor: 'transparent',
                      flexDirection: 'row',
                      alignItems: 'center',
                      height: 48,
                      paddingHorizontal: 4,
                    }}
                    renderDropdownImage={
                      <View style={{
                        marginLeft: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 20,
                        height: 20,
                      }}>
                        <Text style={{
                          color: isDarkMode ? '#FFFFFF' : '#333333',
                          fontSize: 12
                        }}>▼</Text>
                      </View>
                    }
                  />
                </View>
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

              <View style={[styles.inputContainer, { zIndex: 2500 }]}>
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

              <View style={{ zIndex: 2400, marginTop: 16 }}>
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

              <TouchableOpacity
                style={[
                  styles.operatorsButton,
                  { backgroundColor: isDarkMode ? '#1F2937' : '#E0F2FE' }
                ]}
                onPress={() => setAddOperatorVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="people-circle-outline"
                  size={20}
                  color={isDarkMode ? '#A1C6EA' : '#0458AB'}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.operatorsButtonText,
                    { color: isDarkMode ? '#A1C6EA' : '#0458AB' }
                  ]}
                >
                  {t("edit_operators")}
                </Text>
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  operatorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginVertical: 10,
  },
  operatorsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
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
    marginBottom: 16,
  },
  phoneContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 50,
    overflow: 'hidden',
  },
  phoneTextContainer: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    flex: 1,
    height: 48,
    paddingVertical: 0,
    paddingLeft: 0,
    justifyContent: 'center',
  },
  phoneTextInput: {
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 12,
    includeFontPadding: false,
    textAlignVertical: 'center',
    height: 48,
    margin: 0,
  },
  phoneCodeText: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
    textAlignVertical: 'center',
    lineHeight: 20,
    marginLeft: 6,
    marginRight: 4,
  },
  phoneFlagButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    width: 90,
  },
  phoneCountryPicker: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 4,
  },
  dropdownArrow: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
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