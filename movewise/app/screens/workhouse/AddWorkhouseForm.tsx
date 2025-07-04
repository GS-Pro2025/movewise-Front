// este modal se creo para el registro de un nuevo workhouse
import { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, TextInput, useColorScheme } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { createWorkhouseOrder } from '@/hooks/api/CreateWorkHouse';
import * as FileSystem from 'expo-file-system';
interface FreelanceImages {
    photo?: string;
    license_front?: string;
    license_back?: string;
}
import { CustomerFactory } from '@/hooks/api/CustomerFactoryClient';
import { Order } from './ListWorkHouse';
import { Picker } from '@react-native-picker/picker';
import { FreelanceData } from '@/hooks/api/FreelanceClient';
import FreelanceAssignmentScreen from './freelance-assignment';
import CreateFreelanceModal from './CreateFreelanceModal';
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';
import { formatDateForAPI, getTodayDate } from '@/utils/handleDate';
import DropDownPicker from "react-native-dropdown-picker";
import { url } from '@/hooks/api/apiClient';

interface AddWorkhouseFormProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (createdKey?: string) => void; // <-- permite un argumento opcional
    editOrder?: Order | null;
    data?: Partial<FreelanceData>;
    images?: FreelanceImages;
    onImageChange?: (images: FreelanceImages) => void;
    onSubmit?: () => Promise<void>;
}

export interface WorkhouseOrderData {
    date: string;
    status: string;
    person_id: number;
    job: number;
    customer_factory: number;
    dispatch_ticket?: string | null;
}

const AddWorkhouseForm: React.FC<AddWorkhouseFormProps> = ({ visible, onClose, onSuccess }) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const { t } = useTranslation();
    // Usar getTodayDate() en lugar de new Date()
    const [date, setDate] = useState(getTodayDate());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customerFactories, setCustomerFactories] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [dispatchTicket, setDispatchTicket] = useState<any>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Estados para el flujo de freelance
    const [workhouseKey, setWorkhouseKey] = useState<string | null>(null);
    const [showFreelanceModal, setShowFreelanceModal] = useState(false);
    const [freelanceCode, setFreelanceCode] = useState('');
    const [freelanceData, setFreelanceData] = useState<any>(null);
    const [showFreelanceForm, setShowFreelanceForm] = useState(false);
    const [additionalCosts, setAdditionalCosts] = useState('');
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>('');
    const scrollViewRef = useRef<ScrollView>(null);

    const [newFreelance, setNewFreelance] = useState<Partial<FreelanceData>>({
        status: 'freelance',
        type_id: 'CC'
    });

    const [freelanceImages, setFreelanceImages] = useState<{
        photo?: any,
        license_front?: any,
        license_back?: any
    }>({});

    // Estados para location
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

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const companies = await CustomerFactory();
                const companyArray = Array.isArray(companies) ? companies : [];
                setCustomerFactories(companyArray);
            } catch (error) {
                console.error(t('error_fetching_companies'), error);
                setCustomerFactories([]);
            }
        };
        fetchCompanies()
    }, []);

    // Fetch countries
    useEffect(() => {
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
        fetchCountries();
    }, []);

    // Fetch states
    useEffect(() => {
        if (country) {
            setStateRegion(null);
            setCity(null);
            setLoadingStates(true);
            fetch(`${url}/orders-locations/?type=states&country=${encodeURIComponent(country)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setStateList(data.data.map((s: any) => ({
                            label: s.name,
                            value: s.name
                        })));
                    }
                })
                .catch(() => setStateList([]))
                .finally(() => setLoadingStates(false));
        } else {
            setStateList([]);
            setCitiesList([]);
        }
    }, [country]);

    // Fetch cities
    useEffect(() => {
        if (country && stateRegion) {
            setCity(null);
            setLoadingCities(true);
            fetch(`${url}/orders-locations/?type=cities&country=${encodeURIComponent(country)}&state=${encodeURIComponent(stateRegion)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setCitiesList(data.data.map((c: any) => ({
                            label: c.name,
                            value: c.name
                        })));
                    }
                })
                .catch(() => setCitiesList([]))
                .finally(() => setLoadingCities(false));
        } else {
            setCitiesList([]);
        }
    }, [stateRegion]);

    const validateForm = () => {
        if (!country) {
            setValidationError(t("country_required"));
            return false;
        }
        if (!stateRegion) {
            setValidationError(t("state_region_required"));
            return false;
        }
        if (!city) {
            setValidationError(t("city_required"));
            return false;
        }
        if (!selectedCustomer) {
            setValidationError(t("select_customer_factory"));
            return false;
        }
        if (dispatchTicket?.fileSize && dispatchTicket.fileSize > 5 * 1024 * 1024) {
            setValidationError(t("image_too_large"));
            return false;
        }
        setValidationError(null);
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload: WorkhouseOrderData & { state_usa: string } = {
                date: formatDateForAPI(date),
                status: "Pending",
                person_id: 7,
                job: 1,
                customer_factory: selectedCustomer!,
                state_usa: `${country}, ${stateRegion}, ${city}`,
            };

            if (dispatchTicket) {
                const base64 = await FileSystem.readAsStringAsync(dispatchTicket.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                payload.dispatch_ticket = `data:${dispatchTicket.type || 'image/jpeg'};base64,${base64}`;
            }

            const response = await createWorkhouseOrder(payload);

            setWorkhouseKey(response.key || response.id);
            Alert.alert(t("success"), t("workhouse_created"), [
                {
                    text: t("ok"),
                    onPress: () => {
                        onSuccess(response.key || response.id);
                    }
                }
            ]);
        } catch (error: any) {
            Alert.alert(t("error"), error.message || t("create_workhouse_error"));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        // Usar getTodayDate() en lugar de new Date()
        setDate(getTodayDate());
        setSelectedCustomer(null);
        setDispatchTicket(null);
        setValidationError(null);
        setWorkhouseKey(null);
        setFreelanceCode('');
        setFreelanceData(null);
        setAdditionalCosts('');
        setSearchError(null);
        setNewFreelance({
            status: 'freelance',
            type_id: 'CC'
        });
        setFreelanceImages({});
    };

    return (
        <>
            <Modal visible={visible} transparent animationType="slide" style={{ backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.header}>
                                <Text style={[styles.modalTitle, { color: isDarkMode ? colors.textDark : colors.primary }]}>{t("new_workhouse_order")}</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={isDarkMode ? colors.textDark : colors.primary} />
                                </TouchableOpacity>
                            </View>

                            {/* Location selectors */}
                            <View style={{ zIndex: 4000, marginTop: 8 }}>
                                <Text style={styles.label}>{t('country')} <Text style={{ color: 'red' }}>*</Text></Text>
                                <DropDownPicker
                                    open={openCountry}
                                    value={country}
                                    items={countriesList}
                                    setOpen={setOpenCountry}
                                    setValue={setCountry}
                                    placeholder={t('select_country')}
                                    loading={loadingCountries}
                                    listMode="MODAL"
                                    modalTitle={t('select_country')}
                                    searchable={true}
                                    searchPlaceholder={t('search')}
                                    dropDownContainerStyle={{ maxHeight: 400 }}
                                />
                            </View>
                            <View style={{ zIndex: 3000, marginTop: 8 }}>
                                <Text style={styles.label}>{t('state_region')} <Text style={{ color: 'red' }}>*</Text></Text>
                                <DropDownPicker
                                    open={openStateRegion}
                                    value={stateRegion}
                                    items={stateList}
                                    setOpen={setOpenStateRegion}
                                    setValue={setStateRegion}
                                    placeholder={t('select_state_region')}
                                    loading={loadingStates}
                                    disabled={!country}
                                    listMode="MODAL"
                                    modalTitle={t('select_state_region')}
                                    searchable={true}
                                    searchPlaceholder={t('search')}
                                    dropDownContainerStyle={{ maxHeight: 400 }}
                                />
                            </View>
                            <View style={{ zIndex: 2000, marginTop: 8 }}>
                                <Text style={styles.label}>{t('city')} <Text style={{ color: 'red' }}>*</Text></Text>
                                <DropDownPicker
                                    open={openCity}
                                    value={city}
                                    items={citiesList}
                                    setOpen={setOpenCity}
                                    setValue={setCity}
                                    placeholder={t('select_city')}
                                    loading={loadingCities}
                                    disabled={!stateRegion}
                                    listMode="MODAL"
                                    modalTitle={t('select_city')}
                                    searchable={true}
                                    searchPlaceholder={t('search')}
                                    dropDownContainerStyle={{ maxHeight: 400 }}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.datePicker,
                                    {
                                        backgroundColor: isDarkMode ? colors.cardDark : '#f5f5f5',
                                        borderColor: isDarkMode ? colors.borderDark : colors.borderLight,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 16, // separa un poco la fecha del selector anterior
                                    }
                                ]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons
                                    name="calendar"
                                    size={20}
                                    color={isDarkMode ? colors.textDark : colors.primary}
                                />
                                <Text
                                    style={[
                                        styles.label,
                                        {
                                            color: isDarkMode ? colors.textDark : colors.primary,
                                            marginLeft: 12,
                                            marginRight: 12,
                                            fontWeight: 'bold',
                                            fontSize: 15,
                                        }
                                    ]}
                                >
                                    {t('date')}
                                </Text>
                                <Text
                                    style={[
                                        styles.dateText,
                                        { color: isDarkMode ? colors.textDark : '#333', marginLeft: 0 }
                                    ]}
                                >
                                    {date.toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setDate(selectedDate);
                                    }}
                                />
                            )}

                            <CrossPlatformImageUpload
                                label={t("dispatch_ticket")}
                                image={dispatchTicket}
                                onImageSelected={setDispatchTicket}
                                maxWidth={1024}
                                maxHeight={1024}
                                aspect={[4, 3]}
                            />

                            <View style={styles.dropdownContainer}>
                                <Picker
                                    selectedValue={selectedCustomer}
                                    onValueChange={(itemValue) => setSelectedCustomer(itemValue)}
                                    style={[
                                        styles.picker,
                                        {
                                            color: isDarkMode ? colors.textDark : colors.textLight,
                                            backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight
                                        }
                                    ]}
                                    dropdownIconColor={isDarkMode ? colors.textDark : colors.primary}
                                >
                                    <Picker.Item
                                        style={{ color: isDarkMode ? colors.darkText : colors.darkText }}
                                        label={t("select_customer")}
                                        value={null}
                                        color={isDarkMode ? "#000" : "#222"}
                                    />
                                    {customerFactories.map(customer => (
                                        <Picker.Item
                                            key={customer.id_factory}
                                            label={customer.name}
                                            value={customer.id_factory}
                                            color={isDarkMode ? "#000" : "#222"}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            {validationError && (
                                <Text style={styles.errorText}>{validationError}</Text>
                            )}

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>{t("create_order")}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <CreateFreelanceModal
                visible={showFreelanceForm}
                onClose={() => setShowFreelanceForm(false)}
                isFromFreelance={true}
                onSuccess={() => {
                    if (workhouseKey) {
                        onSuccess(workhouseKey); // <-- Usa el estado local
                    } else {
                        onSuccess(); // fallback por si no hay key
                    }
                }}
                workHouseKey={workhouseKey}
            />
        </>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: colors.darkText,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '95%',
        padding: 24,
        maxHeight: '90%',
        backgroundColor: 'rgba(255,255,255,0.95)'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginBottom: 16,
    },
    dateText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    dropdownContainer: {
        marginTop: 16,
    },
    buttonContainer: {
        marginTop: 24,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    errorText: {
        color: colors.warning,
        fontSize: 14,
        marginLeft: 8,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    picker: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginVertical: 8,
    },
    // Nuevos estilos para el modal de freelance
    orderInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    orderInfoText: {
        marginLeft: 8,
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    searchContainer: {
        marginBottom: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 48,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    freelanceCard: {
        backgroundColor: '#f0f8ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.completedStatus,
    },
    freelanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    freelanceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.completedStatus,
        marginLeft: 8,
    },
    freelanceDetails: {
        gap: 8,
    },
    freelanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    freelanceLabel: {
        fontSize: 14,
        color: colors.darkText,
        fontWeight: '600',
    },
    freelanceValue: {
        fontSize: 14,
        color: colors.darkText,
        flex: 1,
        textAlign: 'right',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadge: {
        backgroundColor: '#e8f5e8',
    },
    inactiveBadge: {
        backgroundColor: '#ffebee',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    createNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: colors.secondary,
        borderStyle: 'dashed',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    createNewButtonText: {
        color: colors.secondary,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    assignButton: {
        backgroundColor: colors.completedStatus,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        left: 24,
        right: 24,
    },
    // Estilos para el formulario de creación
    freelanceInfo: {
        padding: 12,
        backgroundColor: colors.lightBackground,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    freelanceInfoText: {
        fontSize: 14,
        color: colors.darkText,
        marginBottom: 4,
    },
    createButton: {
        backgroundColor: colors.secondary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    createButtonText: {
        color: colors.lightBackground,
        fontWeight: 'bold',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginTop: 8,
    },

});

export default AddWorkhouseForm;