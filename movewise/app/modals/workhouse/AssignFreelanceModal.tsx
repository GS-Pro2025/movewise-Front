// src/app/modals/AssignFreelanceModal.tsx
import { useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { GetFreelanceByCode, CreateFreelance, FreelanceData } from '@/hooks/api/FreelanceClient';
import { CreateAssignment } from '@/hooks/api/AssignClient';
import CrossPlatformImageUpload from '../CrossPlatformImageUpload';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import AddWorkhouseForm from './AddWorkhouseForm';
interface AssignFreelanceModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    workhouseKey: string;
}

const AssignFreelanceModal: React.FC<AssignFreelanceModalProps> = ({ visible, onClose, workhouseKey, onSuccess }) => {
    const { t } = useTranslation();
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

    const handleSearchFreelance = async () => {
        if (!freelanceCode.trim()) {
            setSearchError(t("enter_freelance_code"));
            return;
        }

        setSearchLoading(true);
        setSearchError(null);
        setFreelanceData(null);

        try {
            const response = await GetFreelanceByCode(freelanceCode);
            if (response?.data) {
                setFreelanceData(response)
                setTimeout(() => scrollViewRef.current?.scrollToEnd(), 100);
            } else {
                setSearchError(t("freelance_not_found"));
            }
        } catch (error: any) {
            setSearchError(error?.response?.data?.error || t("freelance_not_found"));
        } finally {
            setSearchLoading(false);
        }
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
            setFreelanceData(response)
            setFreelanceCode(response.data.code);
            setTimeout(() => scrollViewRef.current?.scrollToEnd(), 100);
            setShowFreelanceForm(false);
            Alert.alert(t("success"), t("freelance_created"));

        } catch (error: any) {
            Alert.alert(t("error"), error.message || t("create_freelance_error"));
        }
    };

    const handleAssignFreelance = async () => {
        if (!freelanceData || !workhouseKey) return;

        setAssignmentLoading(true);
        try {
            await CreateAssignment({
                operator: freelanceData.data.id_operator,
                order: workhouseKey,
                assigned_at: new Date().toISOString(),
                rol: 'freelance',
                additional_costs: additionalCosts
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert(t("error"), error.message || t("assignment_error"));
        } finally {
            setAssignmentLoading(false);
        }
    };

    const OperatorImage = ({ photo }: { photo: string | null }) => {
        const [imageError, setImageError] = useState(false);

        return (
            <View style={styles.imageContainer}>
                {photo && !imageError ? (
                    <Image
                        source={{ uri: photo }}
                        style={styles.operatorPhoto}
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <Ionicons
                        name="person-circle-outline"
                        size={80}
                        color={colors.primary}
                        style={styles.placeholderIcon}
                    />
                )}
            </View>
        );
    };

    return (
        <>
            <Modal visible={visible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.lightBackground }]}>
                        <ScrollView ref={scrollViewRef} contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]} showsVerticalScrollIndicator={false}>
                            <View style={styles.header}>
                                <Text style={styles.modalTitle}>{t("assign_freelance")}</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={colors.primary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.orderInfoCard}>
                                <Ionicons name="document-text" size={20} color={colors.primary} />
                                <Text style={styles.orderInfoText}>
                                    {t("order")}: {workhouseKey?.substring(0, 8)}...
                                </Text>
                            </View>

                            <Text style={styles.sectionTitle}>{t("search_freelance")}</Text>

                            <View style={styles.searchContainer}>
                                <View style={styles.searchInputContainer}>
                                    <TextInput
                                        style={styles.searchInput}
                                        value={freelanceCode}
                                        onChangeText={(text) => {
                                            setFreelanceCode(text);
                                            setSearchError(null);
                                            setFreelanceData(null);
                                        }}
                                        placeholder={t("enter_freelance_code")}
                                        placeholderTextColor={colors.placeholderLight}
                                    />
                                    <TouchableOpacity
                                        style={styles.searchButton}
                                        onPress={handleSearchFreelance}
                                        disabled={searchLoading || !freelanceCode.trim()}
                                    >
                                        {searchLoading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Ionicons name="search" size={20} color="#fff" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {searchError && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color={colors.warning} />
                                    <Text style={styles.errorText}>{searchError}</Text>
                                </View>
                            )}

                            {freelanceData && (
                                <View style={styles.freelanceCard}>
                                    <OperatorImage photo={freelanceData.data?.photo} />
                                    <View style={styles.operatorInfoContainer}>
                                        <View style={styles.infoRow}>
                                            <Ionicons name="person-outline" size={20} color={colors.primary} />
                                            <Text style={styles.infoText}>
                                                {freelanceData.data.first_name} {freelanceData.data.last_name}
                                            </Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Ionicons name="id-card-outline" size={20} color={colors.primary} />
                                            <Text style={styles.infoText}>
                                                {t("id")}: {freelanceData.data.id_number}
                                            </Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Ionicons name="alert-circle-outline" size={20} color={colors.primary} />
                                            <View style={[
                                                styles.statusBadge,
                                                freelanceData.data.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                                            ]}>
                                                <Text style={styles.statusText}>
                                                    {freelanceData.data.status}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.additionalInfo}>
                                            <View style={styles.infoColumn}>
                                                <Text style={styles.infoLabel}>{t("operator_code")}</Text>
                                                <Text style={styles.infoValue}>{freelanceData.data.code}</Text>
                                            </View>
                                            <View style={styles.infoColumn}>
                                                <Text style={styles.infoLabel}>{t("salary")}</Text>
                                                <Text style={styles.infoValue}>${freelanceData.data.salary}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.createNewButton}
                                onPress={() => {
                                    setNewFreelance(prev => ({ ...prev, code: freelanceCode }));
                                    setShowFreelanceForm(true);
                                }}
                            >
                                <Ionicons name="add-circle" size={20} color={colors.secondary} />
                                <Text style={styles.createNewButtonText}>{t("create_new_freelance")}</Text>
                            </TouchableOpacity>

                            {freelanceData && (
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="cash" size={16} color={colors.primary} /> {t("additional_costs")}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={additionalCosts}
                                        onChangeText={setAdditionalCosts}
                                        placeholder={t("enter_additional_costs")}
                                        placeholderTextColor={colors.placeholderLight}
                                        multiline
                                    />
                                </View>
                            )}

                            {/* Botón de asignación */}
                            {freelanceData && (
                                <TouchableOpacity
                                    style={[styles.assignButton, { marginTop: 0 }]}
                                    onPress={handleAssignFreelance}
                                    disabled={assignmentLoading}
                                >
                                    {assignmentLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                            <Text style={styles.buttonText}>{t("assign_freelance")}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>
                </View>

            </Modal>

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
                                style={[styles.submitButton, { marginTop: 20, flexDirection:'row', justifyContent:'center' }]}
                                onPress={handleCreateFreelance}
                            >
                                <Ionicons name="save-outline" size={20} color="#fff" />
                                <Text style={styles.buttonText}>{t("create_freelance")}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        color: colors.textLight,
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
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20
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
    // freelance / OP styles
    freelanceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    operatorPhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    operatorInfoContainer: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 4,
    },
    infoText: {
        fontSize: 16,
        color: colors.textLight,
        flex: 1,
    },
    additionalInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 16,
    },
    infoColumn: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.darkText,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: 'bold',
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: colors.cardLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        opacity: 0.7,
    },

});
export default AssignFreelanceModal;