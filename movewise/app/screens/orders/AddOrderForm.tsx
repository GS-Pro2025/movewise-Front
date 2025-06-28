import { ActivityIndicator, Modal, SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import _PhoneInput from 'react-native-phone-number-input';
import CountryFlag from 'react-native-country-flag';
import type { CountryCode } from 'react-native-country-picker-modal';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'react-native';
import AddOrderformApi from '@/hooks/api/AddOrderFormApi';
import { AddOrderForm } from '@/models/ModelAddOrderForm';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { job } from '@/models/ModelJob';
import { ListJobs } from '@/hooks/api/JobClient';
import { ListStates } from '@/hooks/api/StatesClient';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import { DeleteOrder } from '@/hooks/api/DeleteOrder';
import { CustomerFactory } from '@/hooks/api/CustomerFactoryClient';
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';
import { ImageInfo } from '@/components/CrossPlatformImageUpload';
import { useRouter } from 'expo-router';
import OperatorModal from '../operators/OperatorModal';
import { getTodayDate, formatDateForAPI } from '@/utils/handleDate';
import { url } from '@/hooks/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AddOrderFormProps {
    visible?: boolean;
    onClose?: () => void;
    orderData?: any;
}

const PhoneInput = _PhoneInput as any;

export default function AddOrderModal({ visible, onClose, orderData }: AddOrderFormProps) {
  if (!visible) return null;
  const router = useRouter();
  const { t } = useTranslation();

  // Formatear la fecha como YYYY-MM-DD - ACTUALIZADO para usar la nueva utilidad
  const formatDate = (date: Date): string => {
    return formatDateForAPI(date);
  };

  const [state, setState] = useState<string | null>(null);
  // new useStates for state field
  const [open, setOpen] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openStateRegion, setOpenStateRegion] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [country, setCountry] = useState<string | null>(null);
  const [stateRegion, setStateRegion] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  // end new useStates for state field

  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [openJob, setOpenJob] = useState(false);
  const [job, setJob] = useState<string | null>(orderData?.job?.toString() || null);
  const [openCompany, setOpenCompany] = useState(false);
  const [company, setCompany] = useState<number | null>(orderData?.customer_factory || null);
  // CAMBIO PRINCIPAL: Usar getTodayDate() y formatear correctamente
  const [date, setDate] = useState<string>(formatDateForAPI(getTodayDate()));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [keyReference, setKeyReference] = useState(orderData?.key_ref || '');
  const [customerName, setCustomerName] = useState(orderData?.person?.first_name || '');
  const [customerLastName, setCustomerLastName] = useState(orderData?.person?.last_name || '');

  // Extract just the phone number without country code (everything after the last '-')
  const getPhoneNumberWithoutCountryCode = (phone: string) => {
    if (!phone) return '';
    const parts = phone.split('-');
    return parts.length > 1 ? parts[parts.length - 1] : phone;
  };

  const [cellPhone, setCellPhone] = useState(
    orderData?.person?.phone ? getPhoneNumberWithoutCountryCode(orderData.person.phone) : ''
  );
  const [formattedPhone, setFormattedPhone] = useState(orderData?.person?.phone || '');
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>('US');
  const phoneInput = useRef<any>(null);
  const [address, setAddress] = useState(orderData?.person?.address || '');
  const [email, setEmail] = useState(orderData?.person?.email || '');
  const [weight, setWeight] = useState(orderData?.weight?.toString() || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [jobList, setJobList] = useState<job[]>([]);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [operatorModalVisible, setOperatorModalVisible] = useState(false); // State for OperatorModal visibility
  const [savedOrderKey, setSavedOrderKey] = useState<string | null>(null); // State to store saved order key
  const [dispatchTicket, setDispatchTicket] = useState<ImageInfo | null>(
    orderData?.dispatch_ticket ? 
    { uri: orderData.dispatch_ticket, name: 'dispatch_ticket.jpg', type: 'image/jpeg' } : 
    null
  ); // State for dispatch_Ticket
  const [isAdmin, setIsAdmin] = useState(false);
  const { saveOrder, isLoading, error } = AddOrderformApi();

  // Fix the fetchCountries function
  const fetchCountries = useCallback(async () => {
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
  }, []); // No dependencies needed here

  // Fetch states
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
        setStateList(states); // Poblar stateList
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setStateList([]); // Asegurar reset en error
    } finally {
      setLoadingStates(false);
    }
  };


  // Fetch cities
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

  // Reset states and cities when country changes
  useEffect(() => {
    if (country) {
      setStateRegion(null);
      setCity(null);
      fetchStates(country);
    } else {
      setStateList([]); // Corregido: usar setStateList
      setCitiesList([]);
    }
  }, [country]);

  // Reset cities when state changes
  useEffect(() => {
    if (country && stateRegion) {
      setCity(null);
      fetchCities(country, stateRegion);
    } else {
      setCitiesList([]);
    }
  }, [stateRegion]);


  const handleSaveOperators = () => {
    // Close the operator modal first
    setOperatorModalVisible(false);
    
    // If it's an admin, close the parent modal after a short delay
    if (isAdmin) {
      setTimeout(() => {
        onClose?.();
      }, 300); // Small delay to allow the operator modal to close smoothly
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const admin = await AsyncStorage.getItem('isAdmin');
        setIsAdmin(admin === 'true');
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdmin();
  }, []);

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
              // console.log(t("deleting_order"), key);
              await DeleteOrder(key);
              Toast.show({
                type: "success",
                text1: t("order_deleted"),
                text2: t("order_deleted_successfully"),
              });
              // Close the modal after successful deletion
              onClose?.();
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
      // No order was created, just back
      onClose?.();
    }
  };

  // Update the model to ensure that customer_factory is of type number
  interface AddOrderFormModel extends Omit<AddOrderForm, 'customer_factory'> {
    customer_factory: number;
  }

  const resetForm = () => {
    setState(null);
    setSearchTerm('');
    setJob(null);
    setCompany(null);
    setDate(formatDateForAPI(getTodayDate()));
    setKeyReference('');
    setCustomerName('');
    setCustomerLastName('');
    setCellPhone('');
    setAddress('');
    setEmail('');
    setWeight('');
    setErrors({});
    setDispatchTicket(null);
  };

  const handleSave = async () => {
    if (isLoading) return;
    if (!validateFields()) return;

    //validate fields
    // Validar campos obligatorios
    if (!customerName?.trim()) {
      Toast.show({
        text1: t('error'),
        text2: t('customer_name_required'),
        type: 'error',
      });
      return false;
    }
    
    if (!customerLastName?.trim()) {
      Toast.show({
        text1: t('error'),
        text2: t('customer_last_name_required'),
        type: 'error',
      });
      return false;
    }
    
    if (!date) {
      Toast.show({
        text1: t('error'),
        text2: t('date_required'),
        type: 'error',
      });
      return false;
    }
    
    if (!keyReference) {
      Toast.show({
        text1: t('error'),
        text2: t('key_reference_required'),
        type: 'error',
      });
      return false;
    }
    
    if (!weight) {
      Toast.show({
        text1: t('error'),
        text2: t('weight_required'),
        type: 'error',
      });
      return false;
    }
    
    if (!company) {
      Toast.show({
        text1: t('error'),
        text2: t('company_required'),
        type: 'error',
      });
      return false;
    }
    
    if (!email?.trim()) {
      Toast.show({
        text1: t('error'),
        text2: t('email_required'),
        type: 'error',
      });
      return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors: Record<string, string> = {};
    
    if (!emailRegex.test(email)) {
      Toast.show({
        text1: t('error'),
        text2: t('invalid_email_format'),
        type: 'error',
      });
      return false;
    }
    
    // Add other validation checks here and populate newErrors if needed
    // Example: if (!someField) newErrors.someField = 'This field is required';
    
    // Validar si hay errores y mostrarlos
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Hacer scroll al primer error
      if (newErrors.country || newErrors.stateRegion || newErrors.city) {
        // Los errores de ubicación ya están en la parte superior
      }
      return false;
    }


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
    let base64Image = null;
    if (dispatchTicket) {
      base64Image = await FileSystem.readAsStringAsync(dispatchTicket.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      base64Image = `data:image/jpeg;base64,${base64Image}`;
    }

    const customerFactoryValue = typeof company === 'number' ? company :
      company ? parseInt(company) : 0;

    // Aseguramos que el número de teléfono tenga el formato correcto (+prefijo-número)
    let formattedPhoneNumber = cellPhone;
    if (formattedPhoneNumber && !formattedPhoneNumber.startsWith('+')) {
      const callingCode = phoneInput.current?.getCallingCode() || '';
      formattedPhoneNumber = `+${callingCode}-${formattedPhoneNumber}`;
    } else if (formattedPhoneNumber && !formattedPhoneNumber.includes('-')) {
      const callingCode = phoneInput.current?.getCallingCode() || '';
      formattedPhoneNumber = formattedPhoneNumber.replace(`+${callingCode}`, `+${callingCode}-`);
    }

    const orderData: AddOrderFormModel = {
      status: "Pending",
      date: formatDateForAPI(getTodayDate()),
      key_ref: keyReference,
      state_usa: location,
      person: {
        first_name: customerName,
        last_name: customerLastName,
        address: address,
        email: email,
        phone: formattedPhoneNumber, // Usamos el número formateado
      },
      weight,
      job: job || "",
      customer_factory: customerFactoryValue,
      dispatch_ticket: base64Image,
    };

    // console.log("Order data to be sent:", JSON.stringify(orderData));

    try {
      const savedOrder = await saveOrder(orderData);
      // console.log(t('order_saved_successfully'), savedOrder);
      if (savedOrder) {
        Toast.show({
          text1: t('success'),
          text2: t('order_saved_successfully'),
          type: 'success',
        });
        await new Promise(resolve => setTimeout(resolve, 900));
        setSavedOrderKey(savedOrder.key);
        resetForm(); // Clear the form
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

  const fetchJobs = async () => {
    try {
      const jobs = await ListJobs();
      // // console.log(`recibiendo jobs ${JSON.stringify(jobs)}`);

      setJobList(Array.isArray(jobs) ? jobs : []);


    } catch (error) {
      console.error(t('error_fetching_jobs'), error);
      setJobList([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companies = await CustomerFactory();
      // console.log("Companies raw response:", companies);

      const companyArray = Array.isArray(companies) ? companies : [];
      setCompanyList(companyArray);

      // console.log("Companies fetched:", companyArray);
      // console.log("First company value:", companyArray[0]?.id_factory);
      // console.log("First company type:", typeof companyArray[0]?.id_factory);
    } catch (error) {
      console.error(t('error_fetching_companies'), error);
      setCompanyList([]);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchCountries();
  }, [fetchCountries]); // Add fetchCountries to dependencies

  // Registrar cambios en el valor de company
  useEffect(() => {
    // console.log("Company value changed:", company);
  }, [company]);

  const handleChange = (field: string, value: any): void => {
    // console.log(`AddOrderForm - Changing ${field} to:`, value);

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
    
    // Validar campos de ubicación
    if (!country) newErrors.country = t('country_required');
    if (!stateRegion) newErrors.stateRegion = t('state_region_required');
    if (!city) newErrors.city = t('city_required');
    
    // Validar otros campos obligatorios
    if (!date) newErrors.date = t('date_required');
    if (!keyReference) newErrors.keyReference = t('key_reference_required');
    if (!customerName) newErrors.customerName = t('customer_name_required');
    if (!customerLastName) newErrors.customerLastName = t('customer_last_name_required');
    if (!email) { 
      newErrors.email = t('email_required'); 
    } else if (!emailRegex.test(email)) { 
      newErrors.email = t('invalid_email_format'); 
    }
    if (!weight) newErrors.weight = t('weight_required');
    if (!job) newErrors.job = t('job_required');
    if (!company) newErrors.company = t('company_required');
    if (!dispatchTicket) newErrors.dispatchTicket = t('dispatch_ticket_required');
    
    // Validar el tamaño del dispatch ticket 5mb
    if (dispatchTicket) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const colorScheme = useColorScheme();
  const imageSource = colorScheme === "dark"
    ? require("@/assets/images/PNG_blanco.png")
    : require("@/assets/images/PNG_negativo.png");

  const styles = StyleSheet.create({
    disabledInput: {
      backgroundColor: '#E5E7EB',
      borderColor: '#9ca3af',
    },
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
    phoneContainer: {
      width: '100%',
      borderRadius: 8,
      borderWidth: 2,
      overflow: 'hidden',
    },
    phoneTextContainer: {
      backgroundColor: 'transparent',
      borderRadius: 0,
    },
    phoneTextInput: {
      height: 48,
      fontSize: 16,
      padding: 0,
      margin: 0,
    },
    phoneCodeText: {
      fontSize: 16,
      padding: 0,
      margin: 0,
    },
    phoneFlagButton: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: '#e2e8f0',
    },
    phoneCountryPicker: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownArrow: {
      marginLeft: 4,
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
            {/* Selector de País */}
            <View style={{ zIndex: 4000, marginTop: 16 }}>
              <Text style={styles.text}>{t('country')} <Text style={styles.required}>(*)</Text></Text>
              <DropDownPicker
                open={openCountry}
                value={country}
                items={countriesList}
                setOpen={setOpenCountry}
                setValue={(value) => {
                  setCountry(value);
                  // Limpiar error al seleccionar un país
                  if (errors.country) {
                    setErrors(prev => ({ ...prev, country: '' }));
                  }
                }}
                placeholder={t('select_country')}
                placeholderStyle={{ color: '#9ca3af' }}
                style={[
                  styles.input, 
                  { 
                    borderColor: errors.country ? "red" : (colorScheme === 'dark' ? '#64748b' : '#0458AB')
                  }
                ]}
                listMode="MODAL"
                modalTitle={t('select_country')}
                searchable={true}
                searchPlaceholder={t('search')}
                loading={loadingCountries}
                dropDownContainerStyle={{ maxHeight: 500 }}
              />
              {errors.country && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                  {errors.country}
                </Text>
              )}
            </View>

            {/* Selector de Estado/Región */}
            <View style={{ zIndex: 3000, marginTop: 16 }}>
              <Text style={styles.text}>{t('state_region')} <Text style={styles.required}>(*)</Text></Text>
              <DropDownPicker
                open={openStateRegion}
                value={stateRegion}
                items={stateList}
                setOpen={setOpenStateRegion}
                setValue={(value) => {
                  setStateRegion(value);
                  // Limpiar error al seleccionar un estado/región
                  if (errors.stateRegion) {
                    setErrors(prev => ({ ...prev, stateRegion: '' }));
                  }
                }}
                placeholder={t('select_state_region')}
                placeholderStyle={{ color: '#9ca3af' }}
                style={[
                  styles.input,
                  {
                    borderColor: errors.stateRegion 
                      ? "red" 
                      : (!country || colorScheme === 'dark' ? '#64748b' : '#0458AB'),
                    ...(!country ? styles.disabledInput : {})
                  }
                ]}
                listMode="MODAL"
                modalTitle={t('select_state_region')}
                searchable={true}
                searchPlaceholder={t('search')}
                loading={loadingStates}
                disabled={!country}
                dropDownContainerStyle={{ maxHeight: 500 }}
              />
              {errors.stateRegion && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                  {errors.stateRegion}
                </Text>
              )}
            </View>

            {/* Selector de Ciudad */}
            <View style={{ zIndex: 2000, marginTop: 16 }}>
              <Text style={styles.text}>{t('city')} <Text style={styles.required}>(*)</Text></Text>
              <DropDownPicker
                open={openCity}
                value={city}
                items={citiesList}
                setOpen={setOpenCity}
                setValue={(value) => {
                  setCity(value);
                  // Limpiar error al seleccionar una ciudad
                  if (errors.city) {
                    setErrors(prev => ({ ...prev, city: '' }));
                  }
                }}
                placeholder={t('select_city')}
                placeholderStyle={{ color: '#9ca3af' }}
                style={[
                  styles.input,
                  {
                    borderColor: errors.city 
                      ? "red" 
                      : (!stateRegion || colorScheme === 'dark' ? '#64748b' : '#0458AB'),
                    ...(!stateRegion ? styles.disabledInput : {})
                  }
                ]}
                listMode="MODAL"
                modalTitle={t('select_city')}
                searchable={true}
                searchPlaceholder={t('search')}
                loading={loadingCities}
                disabled={!stateRegion}
                dropDownContainerStyle={{ maxHeight: 500 }}
              />
              {errors.city && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                  {errors.city}
                </Text>
              )}
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
                date={date ? new Date(date) : getTodayDate()} // CAMBIO: usar getTodayDate() como fallback
                onConfirm={(selectedDate) => {
                  setDatePickerVisibility(false);
                  setDate(formatDateForAPI(selectedDate)); // CAMBIO: usar formatDateForAPI()
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
            <View style={{ marginBottom: 16 }}>
              <PhoneInput
                ref={phoneInput}
                value={cellPhone}
                defaultCode={phoneCountryCode}
                layout="first"
                flagButton={(props: any) => (
                  <TouchableOpacity
                    style={[styles.phoneFlagButton, { width: 70 }]}
                    onPress={props.onPress}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CountryFlag
                        isoCode={props.isoCode}
                        size={20}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.phoneCodeText, { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }]}>
                        {props.callingCode}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                onChangeText={setCellPhone}
                onChangeFormattedText={(text: string) => {
                  const callingCode = phoneInput.current?.getCallingCode() || '';
                  // Aseguramos que el número siempre tenga el formato +prefijo-número
                  let formattedNumber = text;
                  if (text.startsWith(`+${callingCode}`) && !text.includes('-')) {
                    formattedNumber = `${text.slice(0, callingCode.length + 1)}-${text.slice(callingCode.length + 1)}`;
                  }
                  setFormattedPhone(formattedNumber);
                }}
                onChangeCountry={(country: any) => {
                  setPhoneCountryCode(country.cca2);
                  setCellPhone('');
                  const newPrefix = `+${country.callingCode}`;
                  const newFormatted = `${newPrefix}-`;
                  setFormattedPhone(newFormatted);
                }}
                withDarkTheme={colorScheme === 'dark'}
                withShadow={false}
                autoFocus={false}
                containerStyle={[
                  styles.phoneContainer,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#FFFFFF36' : '#ffffff',
                    borderColor: colorScheme === 'dark' ? '#64748b' : '#0458AB',
                    height: 50,
                    minHeight: 50,
                  }
                ]}
                textContainerStyle={[
                  styles.phoneTextContainer,
                  {
                    backgroundColor: 'transparent',
                    height: 48,
                    paddingVertical: 0,
                    paddingLeft: 0,
                  }
                ]}
                textInputStyle={[
                  styles.phoneTextInput,
                  {
                    color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
                    height: 48,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                    backgroundColor: 'transparent',
                  }
                ]}
                codeTextStyle={[
                  styles.phoneCodeText,
                  {
                    color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
                    height: 48,
                    paddingVertical: 0,
                    textAlignVertical: 'center',
                    lineHeight: 20,
                    backgroundColor: 'transparent',
                  }
                ]}
                flagButtonStyle={[
                  styles.phoneFlagButton,
                  {
                    width: 60,
                    height: 48,
                    paddingHorizontal: 8,
                    backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f1f5f9',
                  }
                ]}
                countryPickerButtonStyle={[
                  styles.phoneCountryPicker,
                  {
                    height: 48,
                    paddingHorizontal: 8,
                  }
                ]}
                renderDropdownImage={
                  <View style={styles.dropdownArrow}>
                    <Text style={{
                      color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
                      fontSize: 12
                    }}>▼</Text>
                  </View>
                }
              />
            </View>

            <Text style={styles.text}>{t('address')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('address')}
              placeholderTextColor="#9ca3af"
              value={address}
              onChangeText={setAddress}
            />

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
                  // console.log("Job selected:", val);
                  setJob(val);
                }}
                placeholder={t('select_job')}
                placeholderStyle={{ color: '#9ca3af' }}
                style={[styles.input, { borderColor: errors.job ? "red" : "#0458AB" }]}
                listMode="SCROLLVIEW"
                dropDownContainerStyle={{ maxHeight: 200 }}
              />
            </View>

            <Text style={styles.text}>{t('weight')} (Lb) <Text style={styles.required}>(*)</Text></Text>
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
              <CrossPlatformImageUpload
                label={t("upload_dispatch_ticket")}
                image={dispatchTicket || null}
                onImageSelected={(image) => handleChange("dispatch_ticket", image)}
                error={errors.dispatchTicket}
                required={true}
              />
            </View>
            <View style={styles.buttonContainer}>
              {
                isAdmin && (
                  <TouchableOpacity style={styles.buttonCancel} onPress={handleCancel}>
                    <Text style={styles.buttonTextCancel}>{t('cancel')}</Text>
                  </TouchableOpacity>
                )
              }
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

          {/* Operator Modal - rendered at the same level as other root components */}
          <OperatorModal
            visible={operatorModalVisible}
            onClose={() => setOperatorModalVisible(false)}
            orderKey={savedOrderKey || ''}
            onSave={handleSaveOperators}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>

  );
}