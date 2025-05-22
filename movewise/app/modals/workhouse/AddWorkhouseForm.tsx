import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { createWorkhouseOrder } from '@/hooks/api/CreateWorkHouse';
import * as FileSystem from 'expo-file-system';
import CrossPlatformImageUpload from '../CrossPlatformImageUpload';
import { CustomerFactory } from '@/hooks/api/CustomerFactoryClient';
interface AddWorkhouseFormProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}
export interface WorkhouseOrderData {
    date: string;
    status: string;
    person_id: number;
    job: number;
    customer_factory: number;
    dispatch_ticket?: string | null; // Campo opcional
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
            let base64Image = null;
            if (dispatchTicket) {
                const base64 = await FileSystem.readAsStringAsync(dispatchTicket.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                base64Image = `data:${dispatchTicket.type || 'image/jpeg'};base64,${base64}`;
            }

            await createWorkhouseOrder({
                date: date.toISOString().split('T')[0],
                status: "Pending",
                person_id: 7,
                job: 5,
                customer_factory: selectedCustomer!,
                dispatch_ticket: base64Image
            });

            onSuccess();
            Alert.alert(t("success"), t("workhouse_created"));
            resetForm();
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
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: colors.lightBackground }]}>
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

                    <CrossPlatformImageUpload
                        label={t("dispatch_ticket")}
                        image={dispatchTicket}
                        onImageSelected={setDispatchTicket}
                        maxWidth={1024}
                        maxHeight={1024}
                        aspect={[4, 3]}
                    />

                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownLabel}>{t("customer_factory")}</Text>
                        {customerFactories.map(customer => (
                            <TouchableOpacity
                                key={customer.id_factory}  
                                style={[
                                    styles.customerItem,
                                    selectedCustomer === customer.id_factory && styles.selectedCustomer  
                                ]}
                                onPress={() => setSelectedCustomer(customer.id_factory)}
                            >
                                <Text style={styles.customerName}>{customer.name}</Text>
                                {selectedCustomer === customer.id_factory && (  // ← Y aquí
                                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
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
                </View>
            </View>
        </Modal>
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
    dropdownLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    customerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginBottom: 8,
    },
    selectedCustomer: {
        backgroundColor: '#e3f2fd',
    },
    customerName: {
        fontSize: 16,
        color: '#333',
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
    },
    errorText: {
        color: colors.warning,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default AddWorkhouseForm;