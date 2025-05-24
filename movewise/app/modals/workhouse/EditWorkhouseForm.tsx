//formulario de edicion de workhouse
import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import CrossPlatformImageUpload from '../CrossPlatformImageUpload';
import { CustomerFactory } from '@/hooks/api/CustomerFactoryClient';
import { Order } from './ListWorkHouse';
import { UpdateWorkhouseOrder } from '@/hooks/api/UpdateWorkhouseOrder';
import EditAssignmentsModal from './EditAssignmentsModal'; //modal to show assigned operators to work house 

interface EditWorkhouseFormProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    order: Order | null;
}

interface InitialState {
    customer: number | null;
    date: Date;
    dispatchTicket: any | null; // Usar any temporalmente o definir tipo específico
}

const EditWorkhouseForm: React.FC<EditWorkhouseFormProps> = ({ visible, onClose, onSuccess, order }) => {
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date());
    const [customerFactories, setCustomerFactories] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [dispatchTicket, setDispatchTicket] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
    const [keyForChild, setKeyForChild] = useState('');
    const [initialState, setInitialState] = useState<InitialState>({
        customer: null,
        date: new Date(),
        dispatchTicket: null
    });

    const handleOpenAssignmentModal = () => {
        const currentKey = order?.key || '';
        onClose();
        setTimeout(() => {
            setShowAssignmentsModal(true)
            setKeyForChild(currentKey);
        }, 100);
    }


    const handleCloseAssignmentModal = () => {
        onClose();
        setTimeout(() => {
            setShowAssignmentsModal(false)
        }, 100);
    }

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
                        dispatchTicket: ticket // { uri: string } | null
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
        <>
            <Modal visible={visible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.lightBackground }]}>

                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >

                            <View style={styles.header}>
                                <Text style={styles.modalTitle}>{t("edit_workhouse_order")}</Text>
                                <TouchableOpacity style={{ padding: 15 }} onPress={() => onClose()}>
                                    <Ionicons name="close" size={24} color={colors.primary} />
                                </TouchableOpacity>
                            </View>

                            {/* Selector de Customer Factory */}
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.dropdownLabel}>{t("customer_factory")}</Text>
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

                            {/* Selector de Fecha */}
                            <TouchableOpacity
                                style={styles.datePicker}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar" size={20} color={colors.primary} />
                                <Text style={styles.dateText}>
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
                                <Text style={styles.errorText}>{validationError}</Text>
                            )}
                            <TouchableOpacity
                                style={styles.editFreelancersButton}
                                onPress={() => handleOpenAssignmentModal()}
                            >
                                <Ionicons name="people-outline" size={16} color={colors.primary} />
                                <Text style={styles.editFreelancersText}>{t("edit_freelancers")}</Text>
                            </TouchableOpacity>
                            {hasChanges && (
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>{t("save_changes")}</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <EditAssignmentsModal
                visible={showAssignmentsModal}
                onClose={() => {
                    setShowAssignmentsModal(false);
                    setKeyForChild(''); 
                }}
                workhouseKey={keyForChild}
                onRefresh={onSuccess}
            />
        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
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
        textDecorationLine: 'underline',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
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