import { Modal, SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { useRouter } from "expo-router";
import AddOrderformApi from '@/hooks/api/AddOrderFormApi';
import { AddOrderForm } from '@/models/ModelAddOrderForm';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { job } from '@/models/ModelJob';
import { ListJobs } from '@/hooks/api/JobClient';
import { ListCompanies } from '@/hooks/api/CompanyClient';
import { ListStates } from '@/hooks/api/StatesClient';
import { useTranslation } from 'react-i18next';
import { compareAsc } from 'date-fns';
import { ThemedView } from '@/components/ThemedView';
import { url } from '@/hooks/api/apiClient';

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
  const [openCountry, setOpenCountry] = useState(false);
  const [openStateRegion, setOpenStateRegion] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [country, setCountry] = useState<string | null>(null);
  const [stateRegion, setStateRegion] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const router = useRouter();
  const { saveOrder, isLoading, error } = AddOrderformApi();
  
  const handleSave = async () => {
    if (!validateFields()) return;
    const location = country && stateRegion && city
      ? `${country}, ${stateRegion}, ${city}`
      : "";

    const orderData: AddOrderForm = {
      status: t("pending"),
      date: date || "",
      key_ref: keyReference,
      state_usa: location,
      person: {
        first_name: customerName,
        last_name: customerLastName,
        address: address,
        email: email,
        phone:cellPhone,
      },
      weight: weight,
      job: job || "",
      customer_factory: parseInt(company || '0'),
    };
  
    try {
      const savedOrder = await saveOrder(orderData);
      // console.log("info", savedOrder);
      if (savedOrder) {
        // console.log(t("order_saved_successfully"), saveOrder);
        alert(t("order_saved_successfully"));
        setTimeout(() => {
          onClose();
          router.push("/modals/OperatorModal");
        }, 3000);
      }
      // console.log(t("saving_order"), orderData);
    } catch (error) {
      console.error(t("error_saving_order"), error);
    }
  };
  
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch(`${url}/orders-locations/?type=countries`);
      const data = await response.json();
      if (data.status === 'success') {
        const countries = data.data.map((c: any) => ({
          label: c.name,
          value: c.name
        }));
        setCountriesList(countries);
      }
    } catch (error) {
      setCountriesList([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryName: string) => {
    if (!countryName) return;
    setLoadingStates(true);
    try {
      const response = await fetch(`${url}/orders-locations/?type=states&country=${encodeURIComponent(countryName)}`);
      const data = await response.json();
      if (data.status === 'success') {
        const states = data.data.map((s: any) => ({
          label: s.name,
          value: s.name
        }));
        setStateList(states);
      }
    } catch (error) {
      setStateList([]);
    } finally {
      setLoadingStates(false);
    }
  };
  
  const fetchCities = async (countryName: string, stateName: string) => {
    if (!countryName || !stateName) return;
    setLoadingCities(true);
    try {
      const response = await fetch(`${url}/orders-locations/?type=cities&country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}`);
      const data = await response.json();
      if (data.status === 'success') {
        const cities = data.data.map((c: any) => ({
          label: c.name,
          value: c.name
        }));
        setCitiesList(cities);
      }
    } catch (error) {
      setCitiesList([]);
    } finally {
      setLoadingCities(false);
    }
  };
  
  const fetchJobs = async () => {
    try {
      const jobs = await ListJobs();
      setJobList(jobs);
    } catch (error) {
      console.error(t("error_fetching_jobs"), error);
    }
  };
  
  const fetchCompanies = async () => {
    try {
      const companies = await ListCompanies();
      setCompanyList(companies);
    } catch (error) {
      console.error(t("error_fetching_companies"), error);
    }
  };
  
  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (country) {
      setStateRegion(null);
      setCity(null);
      fetchStates(country);
    } else {
      setStateList([]);
      setCitiesList([]);
    }
  }, [country]);

  useEffect(() => {
    if (country && stateRegion) {
      setCity(null);
      fetchCities(country, stateRegion);
    } else {
      setCitiesList([]);
    }
  }, [stateRegion]);
  
  const validateFields = () => {
    let newErrors: { [key: string]: string } = {};
    if (!state) newErrors.state = t("state_required");
    if (!date) newErrors.date = t("date_required");
    if (!keyReference) newErrors.keyReference = t("key_reference_required");
    if (!customerName) newErrors.customerName = t("customer_name_required");
    if (!customerLastName) newErrors.customerLastName = t("customer_last_name_required");
    if (!weight) newErrors.weight = t("weight_required");
    if (!job) newErrors.job = t("job_required");
    if (!company) newErrors.company = t("company_required");
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const colorScheme = useColorScheme();
  const imageSource = colorScheme === "dark"
    ? require("@/assets/images/PNG_blanco.png")
    : require("@/assets/images/PNG_negativo.png");

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
              <View style={{ zIndex: 4000, marginTop: 16 }}>
                <Text style={styles.text}>{t('country')} <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={openCountry}
                  value={country}
                  items={countriesList}
                  setOpen={setOpenCountry}
                  setValue={setCountry}
                  placeholder={t('select_country')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={styles.input}
                  listMode="MODAL"
                  modalTitle={t('select_country')}
                  searchable={true}
                  searchPlaceholder={t('search')}
                  loading={loadingCountries}
                  dropDownContainerStyle={{ maxHeight: 500 }}
                />
              </View>
  
              <View style={{ zIndex: 3000, marginTop: 16 }}>
                <Text style={styles.text}>{t('state_region')} <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={openStateRegion}
                  value={stateRegion}
                  items={stateList}
                  setOpen={setOpenStateRegion}
                  setValue={setStateRegion}
                  placeholder={t('select_state_region')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={styles.input}
                  listMode="MODAL"
                  modalTitle={t('select_state_region')}
                  searchable={true}
                  searchPlaceholder={t('search')}
                  loading={loadingStates}
                  disabled={!country}
                  dropDownContainerStyle={{ maxHeight: 500 }}
                />
              </View>
  
              <View style={{ zIndex: 2000, marginTop: 16 }}>
                <Text style={styles.text}>{t('city')} <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={openCity}
                  value={city}
                  items={citiesList}
                  setOpen={setOpenCity}
                  setValue={setCity}
                  placeholder={t('select_city')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={styles.input}
                  listMode="MODAL"
                  modalTitle={t('select_city')}
                  searchable={true}
                  searchPlaceholder={t('search')}
                  loading={loadingCities}
                  disabled={!stateRegion}
                  dropDownContainerStyle={{ maxHeight: 500 }}
                />
              </View>
  
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
                  setValue={(callback) => {
                    if (typeof callback === 'function') {
                      const newValue = callback(state);
                      setState(newValue);
                    } else {
                      setState(callback);
                    }
                  }}
                  setItems={() => { }}
                  placeholder={t('select_state')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.input, { borderColor: errors.state ? "red" : "#0458AB" }]}
                  listMode="MODAL"
                  modalTitle={t('select_state')}
                  modalProps={{
                    animationType: "slide"
                  }}
                  searchable={true}
                  searchPlaceholder={t('search')}
                  searchPlaceholderTextColor="#9ca3af"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                  dropDownContainerStyle={{ maxHeight: 500 }}
                />
              </View>
  
              <View style={{ zIndex: 2000, marginTop: 16 }}>
                <Text style={styles.text}>{t('company_customer')} <Text style={styles.required}>(*)</Text></Text>
                <DropDownPicker
                  open={openCompany}
                  value={company || ""}
                  items={
                    Array.isArray(companyList)
                      ? companyList.map((companyItem) => ({
                          label: companyItem.name,
                          value: String(companyItem.id), // <-- aquí el cambio
                        }))
                      : []
                  }
                  setOpen={setOpenCompany}
                  setValue={setCompany}
                  setItems={() => []}
                  placeholder={t('select_company')}
                  placeholderStyle={{ color: '#9ca3af' }}
                  style={[styles.input, { borderColor: errors.company ? "red" : "#0458AB" }]}
                  listMode="SCROLLVIEW"
                  dropDownContainerStyle={{ maxHeight: 200 }}
                />
              </View>
  
              <Text style={styles.textLarge}>{t('general_data')}</Text>
  
              {[
                { label: t('key_reference'), state: keyReference, setState: setKeyReference, keyboardType: "default" },
                { label: t('customer_name'), state: customerName, setState: setCustomerName, keyboardType: "default" },
                { label: t('customer_last_name'), state: customerLastName, setState: setCustomerLastName, keyboardType: "default" },
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
                  items={jobList.map((jobItem) => ({
                    label: jobItem.name,
                    value: String(jobItem.id), // <-- aquí el cambio
                  }))}
                  setOpen={setOpenJob}
                  setValue={setJob}
                  setItems={() => { }}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
