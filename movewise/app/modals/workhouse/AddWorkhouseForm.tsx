// este modal se creo para el registro de un nuevo workhouse
import { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { createWorkhouseOrder } from '@/hooks/api/CreateWorkHouse';
import * as FileSystem from 'expo-file-system';
import CrossPlatformImageUpload from '../CrossPlatformImageUpload';
import { CustomerFactory } from '@/hooks/api/CustomerFactoryClient';
import { Order } from './ListWorkHouse';
import { Picker } from '@react-native-picker/picker';
import { CreateFreelance, FreelanceData } from '@/hooks/api/FreelanceClient';
import { CreateAssignment, AssignmentData } from '@/hooks/api/AssignClient';
import AssignFreelanceModal from './AssignFreelanceModal';

interface AddWorkhouseFormProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editOrder?: Order | null;
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
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date());
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

    const validateForm = () => {
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
            const payload: WorkhouseOrderData = {
                date: date.toISOString().split('T')[0],
                status: "Pending",
                person_id: 7,
                job: 5,
                customer_factory: selectedCustomer!,
            };

            if (dispatchTicket) {
                const base64 = await FileSystem.readAsStringAsync(dispatchTicket.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                payload.dispatch_ticket = `data:${dispatchTicket.type || 'image/jpeg'};base64,${base64}`;
            }

            const response = await createWorkhouseOrder(payload);

            // Capturar la key de la respuesta y mostrar modal de freelance
            setWorkhouseKey(response.key || response.id); // Ajusta según la estructura de respuesta
            Alert.alert(t("success"), t("workhouse_created"), [
                {
                    text: t("ok"),
                    onPress: () => setShowFreelanceModal(true)
                }
            ]);
        } catch (error: any) {
            Alert.alert(t("error"), error.message || t("create_workhouse_error"));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setDate(new Date());
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

    const handleCreateFreelance = async () => {
        try {
            const formData = new FormData();

            // Campos obligatorios
            formData.append('code', newFreelance.code!);
            formData.append('salary', newFreelance.salary!.toString());
            formData.append('first_name', newFreelance.first_name!);
            formData.append('last_name', newFreelance.last_name!);
            formData.append('type_id', newFreelance.type_id!);
            formData.append('id_number', newFreelance.id_number!);
            formData.append('status', 'freelance');

            // Campos opcionales
            if (newFreelance.address) formData.append('address', newFreelance.address);
            if (newFreelance.phone) formData.append('phone', newFreelance.phone);

            // Manejo de imágenes
            const processImage = async (image: any, fieldName: string) => {
                if (image) {
                    const base64 = await FileSystem.readAsStringAsync(image.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    formData.append(fieldName, `data:${image.type || 'image/jpeg'};base64,${base64}`);
                }
            };

            await processImage(freelanceImages.photo, 'photo');
            await processImage(freelanceImages.license_front, 'license_front');
            await processImage(freelanceImages.license_back, 'license_back');

            const response = await CreateFreelance(formData);


            // Actualizar freelanceData con el nuevo freelance creado
            setShowFreelanceForm(false);
            setFreelanceData(response.data); // Asegurarse de usar response.data
            setFreelanceCode(response.data.code);
            setTimeout(() => scrollViewRef.current?.scrollToEnd(), 100);
            setShowFreelanceForm(false);
            Alert.alert(t("success"), t("freelance_created"));

        } catch (error: any) {
            Alert.alert(t("error"), error.message || t("create_freelance_error"));
        }
    };

    const renderFreelanceForm = () => (
        <Modal visible={showFreelanceForm} transparent animationType="slide">
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: colors.lightBackground }]}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.header}>
                            <Text style={styles.modalTitle}>{t("new_freelance")}</Text>
                            <TouchableOpacity onPress={() => setShowFreelanceForm(false)}>
                                <Ionicons name="close" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Campos del formulario con iconos */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="barcode-outline" size={16} color={colors.primary} /> {t("code")}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="FRL-001"
                                value={newFreelance.code}
                                onChangeText={text => setNewFreelance(prev => ({ ...prev, code: text }))}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="cash-outline" size={16} color={colors.primary} /> {t("salary")}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="$0.00"
                                value={newFreelance.salary?.toString()}
                                onChangeText={text => setNewFreelance(prev => ({ ...prev, salary: parseFloat(text) || 0 }))}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="person-outline" size={16} color={colors.primary} /> {t("first_name")}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t("first_name")}
                                value={newFreelance.first_name}
                                onChangeText={text => setNewFreelance(prev => ({ ...prev, first_name: text }))}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="people-outline" size={16} color={colors.primary} /> {t("last_name")}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t("last_name")}
                                value={newFreelance.last_name}
                                onChangeText={text => setNewFreelance(prev => ({ ...prev, last_name: text }))}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="person-outline" size={16} color={colors.primary} /> {t("address")}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t("address")}
                                value={newFreelance.address}
                                onChangeText={text => setNewFreelance(prev => ({ ...prev, address: text }))}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="person-outline" size={16} color={colors.primary} /> {t("phone")}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t("phone")}
                                value={newFreelance.phone}
                                onChangeText={text => setNewFreelance(prev => ({ ...prev, phone: text }))}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="id-card-outline" size={16} color={colors.primary} /> {t("id_type")}
                            </Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={newFreelance.type_id}
                                    onValueChange={value => setNewFreelance(prev => ({ ...prev, type_id: value }))}
                                >
                                    <Picker.Item label="Cédula" value="CC" />
                                    <Picker.Item label="Pasaporte" value="PA" />
                                    <Picker.Item label="Otro" value="OT" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="images-outline" size={18} /> {t("documents")}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="123456789"
                                value={newFreelance.id_number}
                                onChangeText={text => setNewFreelance(prev => ({ ...prev, id_number: text }))}
                            />
                        </View>

                        {/* Sección de imágenes */}
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="images-outline" size={18} /> {t("documents")}
                        </Text>

                        <CrossPlatformImageUpload
                            label={t("photo")}
                            image={freelanceImages.photo}
                            onImageSelected={image => setFreelanceImages(prev => ({ ...prev, photo: image }))}
                        />

                        <CrossPlatformImageUpload
                            label={t("license_front")}
                            image={freelanceImages.license_front}
                            onImageSelected={image => setFreelanceImages(prev => ({ ...prev, license_front: image }))}
                        />

                        <CrossPlatformImageUpload
                            label={t("license_back")}
                            image={freelanceImages.license_back}
                            onImageSelected={image => setFreelanceImages(prev => ({ ...prev, license_back: image }))}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, { marginTop: 20 }]}
                            onPress={handleCreateFreelance}
                        >
                            <Ionicons name="save-outline" size={20} color="#fff" />
                            <Text style={styles.buttonText}>{t("create_freelance")}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <>
            <Modal visible={visible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.lightBackground }]}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.header}>
                                <Text style={styles.modalTitle}>{t("new_workhouse_order")}</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={colors.primary} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.datePicker}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar" size={20} color={colors.primary} />
                                <Text style={styles.dateText}>
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
                                    style={styles.picker}
                                    dropdownIconColor={colors.primary}
                                >
                                    <Picker.Item label={t("select_customer")} value={null} />
                                    {customerFactories.map(customer => (
                                        <Picker.Item
                                            key={customer.id_factory}
                                            label={customer.name}
                                            value={customer.id_factory}
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
                <AssignFreelanceModal
                    visible={showFreelanceModal}
                    onClose={() => setShowFreelanceModal(false)}
                    onSuccess={() => {
                        onSuccess();
                        resetForm();
                    }}
                    workhouseKey={workhouseKey || ''}
                />
            </Modal>
            {renderFreelanceForm()}
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