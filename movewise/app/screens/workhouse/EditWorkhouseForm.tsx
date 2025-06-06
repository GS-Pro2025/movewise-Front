// formulario de edicion de workhouse
import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, useColorScheme,StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';
import { CustomerFactory } from '@/hooks/api/CustomerFactoryClient';
import { Order } from './ListWorkHouse';
import { UpdateWorkhouseOrder } from '@/hooks/api/UpdateWorkhouseOrder';
import { useRouter } from 'expo-router'; // Importamos el router
import FreelanceAssignmentScreen from './freelance-assignment';

interface EditWorkhouseFormProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    order: Order | null;
    onOpenAssignment: (order: Order) => void;
}

interface InitialState {
    customer: number | null;
    date: Date;
    dispatchTicket: any | null;
}

const EditWorkhouseForm: React.FC<EditWorkhouseFormProps> = ({ visible, onClose, onSuccess, order, onOpenAssignment }) => {
    const router = useRouter(); // Añadimos el router
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [date, setDate] = useState(new Date());
    const [customerFactories, setCustomerFactories] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [dispatchTicket, setDispatchTicket] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
    const [initialState, setInitialState] = useState<InitialState>({
        customer: null,
        date: new Date(),
        dispatchTicket: null
    });

    const handleCloseModal = () => {
        visible = false;
        onClose();
    };

    const handleOpenAssignmentScreen = () => {
        if (order) {
            setAssignmentModalVisible(true);
        }
    };

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const companies = await CustomerFactory();
                setCustomerFactories(Array.isArray(companies) ? companies : []);

                if (order) {
                    const initialDate = order.date ? new Date(order.date) : new Date();
                    const ticket = order.dispatch_ticket ? { uri: order.dispatch_ticket } : null;

                    setInitialState({
                        customer: order.customer_factory,
                        date: initialDate,
                        dispatchTicket: ticket
                    });

                    setSelectedCustomer(order.customer_factory);
                    setDate(initialDate);
                    setDispatchTicket(ticket);
                }
            } catch (error) {
                console.error(t('error_fetching_companies'), error);
            }
        };
        fetchCompanies();
    }, [order]);

    useEffect(() => {
        const changesDetected =
            selectedCustomer !== initialState.customer ||
            date.getTime() !== initialState.date.getTime() ||
            (dispatchTicket?.uri !== initialState.dispatchTicket?.uri);

        setHasChanges(changesDetected);
    }, [selectedCustomer, date, dispatchTicket, initialState]);

    const validateForm = () => {
        if (!selectedCustomer) {
            setValidationError(t("select_customer_factory"));
            return false;
        }
        if (dispatchTicket?.fileSize > 5 * 1024 * 1024) {
            setValidationError(t("image_too_large"));
            return false;
        }
        setValidationError(null);
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !order) return;

        setLoading(true);
        try {
            let base64Image = null;
            if (dispatchTicket) {
                const base64 = await FileSystem.readAsStringAsync(dispatchTicket.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                base64Image = `data:${dispatchTicket.type || 'image/jpeg'};base64,${base64}`;
            }

            await UpdateWorkhouseOrder(order.key, {
                customer_factory: selectedCustomer,
                dispatch_ticket: base64Image,
                date: date.toISOString().split('T')[0]
            });

            onSuccess();
            Alert.alert(t("success"), t("workhouse_updated"));
            onClose();
        } catch (error: any) {
            Alert.alert(t("error"), error.message || t("update_error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
                <View style={[
                    styles.modalContent,
                    { 
                        backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground,
                        borderColor: isDarkMode ? colors.borderDark : colors.borderLight
                    }
                ]}>
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }
                        ]}
                    >
                        <View style={[
                            styles.header,
                            { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }
                        ]}>
                            <Text style={[
                                styles.modalTitle,
                                { color: isDarkMode ? colors.textDark : colors.primary }
                            ]}>
                                {t("edit_workhouse_order")}
                            </Text>
                            <TouchableOpacity style={{ padding: 15 }} onPress={() => onClose()}>
                                <Ionicons name="close" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Selector de Customer Factory */}
                        <View style={[styles.dropdownContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
                            <Text style={[styles.dropdownLabel, { color: isDarkMode ? colors.textDark : colors.primary }]}>{t("customer_factory")}</Text>
                            <Picker
                                selectedValue={selectedCustomer}
                                onValueChange={(itemValue) => setSelectedCustomer(itemValue)}
                                style={[styles.picker, { borderColor: isDarkMode ? colors.borderDark : colors.borderLight, backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}
                                dropdownIconColor={colors.primary}
                            >
                                <Picker.Item label={t("select_customer")} value={null} />
                                {customerFactories.map(customer => (
                                    <Picker.Item
                                        key={customer.id_factory}
                                        label={customer.name}
                                        value={customer.id_factory}
                                        color={isDarkMode ? colors.textDark : colors.textLight}
                                    />
                                ))}
                            </Picker>
                        </View>

                        {/* Selector de Fecha */}
                        <TouchableOpacity
                            style={[styles.datePicker, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar" size={20} color={colors.primary} />
                            <Text style={[styles.dateText, { color: isDarkMode ? colors.textDark : colors.primary }]}>
                                {date.toLocaleDateString()}
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

                        {/* Upload de Imagen */}
                        <CrossPlatformImageUpload
                            label={t("dispatch_ticket")}
                            image={dispatchTicket}
                            onImageSelected={setDispatchTicket}
                            maxWidth={1024}
                            maxHeight={1024}
                            aspect={[4, 3]}
                        />

                        {validationError && (
                            <Text style={[styles.errorText, { color: isDarkMode ? colors.textDark : colors.primary }]}>{validationError}</Text>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: isDarkMode ? colors.primary : colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',gap: 5 }]}
                            onPress={handleOpenAssignmentScreen}
                        >
                            <Ionicons name="people-outline" size={20} color={isDarkMode ? colors.textDark : colors.primary} />
                            <Text style={[styles.editFreelancersText, { color: isDarkMode ? colors.textDark : colors.primary }]}>{t("edit_freelancers")}</Text>
                        </TouchableOpacity>

                        {hasChanges && (
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: isDarkMode ? colors.completedStatus : colors.completedStatus }]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={[styles.buttonText]}>{t("save_changes")}</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                    <FreelanceAssignmentScreen
                        workhouseKey={order?.key}
                        visible={assignmentModalVisible}
                        onClose={() => setAssignmentModalVisible(false)}
                        onSuccess={() => {
                            setAssignmentModalVisible(false);
                            Alert.alert(t("success"), t("assignment_updated"));
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: '90%',
    },
    editFreelancersButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 16,
        padding: 8,
        alignSelf: 'flex-start',
    },
    editFreelancersText: {
        color: colors.primary,
        fontSize: 14,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    dropdownContainer: {
        marginVertical: 16,
    },
    dropdownLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    picker: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
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
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: colors.warning,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default EditWorkhouseForm;