import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    TextInput,
    Image,
    SafeAreaView,
    Modal,
    useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import {
    GetFreelanceByCode,
    CreateFreelance,
    FreelanceData
} from '@/hooks/api/FreelanceClient';
import { CreateAssignment } from '@/hooks/api/AssignClient';
import { GetAssignedOperators } from '@/hooks/api/GetAssignedOperators';
import { deleteAssign } from '@/hooks/api/DeleteAssign';
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';

interface FreelanceAssignmentScreenProps {
    workhouseKey?: string;
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const FreelanceAssignmentScreen: React.FC<FreelanceAssignmentScreenProps> = ({
    workhouseKey,
    visible,
    onClose,
    onSuccess
}) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [creatingFreelance, setCreatingFreelance] = useState(false);
    const [freelanceCode, setFreelanceCode] = useState('');
    const [freelanceData, setFreelanceData] = useState<any>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [additionalCosts, setAdditionalCosts] = useState('');
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Estados para la creación de freelancers
    const [newFreelance, setNewFreelance] = useState<Partial<FreelanceData>>({
        status: 'freelance',
        type_id: 'CC',
        salary: 0,
        email: '',
        first_name: '',
        last_name: '',
        id_number: ''
    });

    const [freelanceImages, setFreelanceImages] = useState<{
        photo?: any,
    }>({});

    // Estados para la lista de asignados
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Nuevo estado para controlar la vista
    const [currentView, setCurrentView] = useState<'main' | 'assignment'>('main');

    // Procesar workhouseKey
    const processedWorkhouseKey = workhouseKey?.split('|')[0] || workhouseKey || "";

    // Cargar asignaciones
    const loadAssignments = async () => {
        if (!processedWorkhouseKey) return;

        try {
            setLoadingAssignments(true);
            const data = await GetAssignedOperators(processedWorkhouseKey);
            setAssignments(data || []);
            setAssignmentsError(null);
        } catch (err) {
            setAssignmentsError(t("error_fetching_assignments"));
        } finally {
            setLoadingAssignments(false);
        }
    };

    useEffect(() => {
        if (visible && processedWorkhouseKey) {
            loadAssignments();
        }
    }, [visible, processedWorkhouseKey]);

    // Reset states when modal opens/closes
    useEffect(() => {
        if (!visible) {
            // Reset states when modal closes
            setFreelanceCode('');
            setFreelanceData(null);
            setShowCreateForm(false);
            setAdditionalCosts('');
            setSearchError(null);
            setNewFreelance({
                status: 'freelance',
                type_id: 'CC',
                salary: 0,
                email: '',
                first_name: '',
                last_name: '',
                id_number: ''
            });
            setFreelanceImages({});
            setCurrentView('main'); // Reset to main view
        }
    }, [visible]);

    // Handle close with proper cleanup
    const handleClose = () => {
        onClose();
    };

    // Go back to main view
    const goBackToMain = () => {
        setCurrentView('main');
        // Reset assignment form
        setFreelanceCode('');
        setFreelanceData(null);
        setShowCreateForm(false);
        setAdditionalCosts('');
        setSearchError(null);
    };

    // Show assignment view
    const showAssignmentView = () => {
        setCurrentView('assignment');
    };

    // Buscar freelancer por código
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
                setFreelanceData(response);
                setSearchError(null);
            } else {
                setSearchError(t("freelance_not_found"));
            }
        } catch (error: any) {
            setSearchError(error?.response?.data?.error || t("freelance_not_found"));
        } finally {
            setSearchLoading(false);
        }
    };

    // Asignar freelancer
    const handleAssignFreelance = async () => {
        if (!freelanceData || !processedWorkhouseKey) return;

        setAssignmentLoading(true);
        try {
            await CreateAssignment({
                operator: freelanceData.data.id_operator,
                order: processedWorkhouseKey,
                rol: 'freelance',
                additional_costs: additionalCosts
            });

            // Limpiar y recargar
            setFreelanceCode('');
            setFreelanceData(null);
            setAdditionalCosts('');
            setSearchError(null);
            await loadAssignments();

            // Go back to main view after successful assignment
            setCurrentView('main');

            Alert.alert(t("success"), t("assignment_created"));
        } catch (error: any) {
            Alert.alert(t("error"), error.message || t("assignment_error"));
        } finally {
            setAssignmentLoading(false);
        }
    };

    // Crear nuevo freelancer
    const handleCreateFreelance = async () => {
        setCreatingFreelance(true);
        try {
            const formData = new FormData();

            // Campos obligatorios
            formData.append('salary', newFreelance.salary!.toString());
            formData.append('first_name', newFreelance.first_name!);
            formData.append('last_name', newFreelance.last_name!);
            formData.append('type_id', newFreelance.type_id!);
            formData.append('id_number', newFreelance.id_number!);
            formData.append('status', 'freelance');

            // Campos opcionales
            if (newFreelance.address) formData.append('address', newFreelance.address);
            if (newFreelance.phone) formData.append('phone', newFreelance.phone);

            // CORRECCIÓN: Enviar la imagen como archivo en lugar de base64
            if (freelanceImages.photo) {
                // Extraer el nombre de archivo de la URI
                const filename = freelanceImages.photo.uri.split('/').pop();
                // Extraer tipo MIME (asumir jpeg por defecto)
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('photo', {
                    uri: freelanceImages.photo.uri,
                    name: filename || `photo-${Date.now()}.jpg`,
                    type: type
                } as any);
            }

            const response = await CreateFreelance(formData);
            setFreelanceData(response);
            setFreelanceCode(response.data.code);
            setShowCreateForm(false);
            Alert.alert(t("success"), t("freelance_created"));
        } catch (error: any) {
            console.error("Error creating freelance:", error);
            Alert.alert(t("error"), error.message || t("create_freelance_error"));
        }
    };

    // Eliminar asignación
    const handleDeleteAssignment = async (assignmentId: number) => {
        Alert.alert(
            t("confirm_delete"),
            t("confirm_delete_assignment"),
            [
                { text: t("cancel") },
                {
                    text: t("delete"),
                    onPress: async () => {
                        try {
                            await deleteAssign(assignmentId);
                            await loadAssignments();
                            Alert.alert(t("success"), t("assignment_deleted"));
                        } catch (error) {
                            Alert.alert(t("error"), t("delete_error"));
                        }
                    }
                }
            ]
        );
    };

    // Componente de imagen
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

    // Early return if workhouseKey is missing
    if (!workhouseKey) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            presentationStyle="pageSheet" // iOS specific - better modal presentation
            onRequestClose={handleClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
                    {currentView === 'main' ? (
                        <>
                            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                                <Ionicons name="close" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("assign_freelance")}</Text>
                            <View style={styles.headerSpacer} />
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={goBackToMain} style={styles.headerButton}>
                                <Ionicons name="arrow-back" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("assign_new_operator")}</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                                <Ionicons name="close" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    style={{ backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }}
                >
                    {currentView === 'main' ? (
                        <>
                            {/* Vista principal - Lista de asignados */}
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("assigned_freelancers")}</Text>

                            {loadingAssignments ? (
                                <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                </View>
                            ) : assignmentsError ? (
                                <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                    <Ionicons name="alert-circle" size={16} color={colors.warning} />
                                    <Text style={styles.errorText}>{assignmentsError}</Text>
                                </View>
                            ) : assignments.length === 0 ? (
                                <View style={[styles.emptyContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                    <Ionicons name="people-outline" size={40} color={isDarkMode ? colors.darkText : colors.primary} />
                                    <Text style={[styles.emptyText, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("no_assignments")}</Text>
                                </View>
                            ) : (
                                assignments.map((assignment) => (
                                    <View key={assignment.id_assign} style={[styles.assignmentCard, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                        <View style={[styles.assignmentHeader, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                            <Ionicons name="person-circle" size={24} color={colors.primary} />
                                            <Text style={[styles.assignmentName, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                                {assignment.first_name} {assignment.last_name}
                                            </Text>
                                        </View>
                                        <View style={[styles.assignmentDetails, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                            <Text style={[styles.detailText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                                ID: {assignment.id}
                                            </Text>
                                            <Text style={[styles.detailText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                                {t("assigned_at")}: {new Date(assignment.assigned_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.deleteButton, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                                            onPress={() => handleDeleteAssignment(assignment.id_assign)}
                                        >
                                            <Ionicons name="trash" size={20} color={colors.warning} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}

                            {/* Botón para ir a la vista de asignación */}
                            <TouchableOpacity
                                style={styles.assignNewButton}
                                onPress={showAssignmentView}
                            >
                                <Ionicons name="person-add" size={20} color="#fff" />
                                <Text style={styles.assignNewButtonText}>{t("assign_new_operator")}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* Vista de asignación - Búsqueda y creación */}
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("search_freelance")}</Text>

                            <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <View style={[styles.searchInputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
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
                                        returnKeyType="search"
                                        onSubmitEditing={handleSearchFreelance}
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
                                <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                    <Ionicons name="alert-circle" size={16} color={colors.warning} />
                                    <Text style={[styles.errorText, { color: isDarkMode ? colors.darkText : colors.primary }]}>{searchError}</Text>
                                </View>
                            )}

                            {freelanceData && (
                                <View style={[styles.freelanceCard, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                    <OperatorImage photo={freelanceData.data?.photo} />
                                    <View style={[styles.operatorInfoContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                        <View style={[styles.infoRow, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                            <Ionicons name="person-outline" size={20} color={colors.primary} />
                                            <Text style={[styles.infoText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                                {freelanceData.data.first_name} {freelanceData.data.last_name}
                                            </Text>
                                        </View>

                                        <View style={[styles.infoRow, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                            <Ionicons name="id-card-outline" size={20} color={colors.primary} />
                                            <Text style={[styles.infoText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                                {t("id")}: {freelanceData.data.id_number}
                                            </Text>
                                        </View>

                                        <View style={[styles.infoRow, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
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

                                        <View style={[styles.additionalInfo, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                            <View style={[styles.infoColumn, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                                <Text style={[styles.infoLabel, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("operator_code")}</Text>
                                                <Text style={[styles.infoValue, { color: isDarkMode ? colors.darkText : colors.primary }]}>{freelanceData.data.code}</Text>
                                            </View>
                                            <View style={[styles.infoColumn, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                                <Text style={styles.infoLabel}>{t("salary")}</Text>
                                                <Text style={styles.infoValue}>${freelanceData.data.salary}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}

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
                                        placeholderTextColor={isDarkMode ? colors.darkText : colors.placeholderLight}
                                        multiline
                                    />
                                </View>
                            )}

                            {/* Botón de asignación */}
                            {freelanceData && (
                                <TouchableOpacity
                                    style={styles.assignButton}
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

                            {/* Botón para crear nuevo */}
                            <TouchableOpacity
                                style={[styles.createNewButton, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}
                                onPress={() => {
                                    setNewFreelance(prev => ({ ...prev, code: freelanceCode }));
                                    setShowCreateForm(true);
                                }}
                            >
                                <Ionicons name="add-circle" size={20} color={isDarkMode ? colors.darkText : colors.primary} />
                                <Text style={[styles.createNewButtonText, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("create_new_freelance")}</Text>
                            </TouchableOpacity>

                            {/* Formulario de creación */}
                            {showCreateForm && (
                                <View style={[styles.createFormContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                    <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("new_freelance")}</Text>

                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                        <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                            <Ionicons name="cash-outline" size={16} color={colors.primary} /> {t("salary")}
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                                            placeholder="$0.00"
                                            value={newFreelance.salary?.toString()}
                                            onChangeText={text => setNewFreelance(prev => ({ ...prev, salary: parseFloat(text) || 0 }))}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                        <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                            <Ionicons name="person-outline" size={16} color={colors.primary} /> {t("first_name")}
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                                            placeholder={t("first_name")}
                                            value={newFreelance.first_name}
                                            onChangeText={text => setNewFreelance(prev => ({ ...prev, first_name: text }))}
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                        <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                            <Ionicons name="people-outline" size={16} color={colors.primary} /> {t("last_name")}
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                                            placeholder={t("last_name")}
                                            value={newFreelance.last_name}
                                            onChangeText={text => setNewFreelance(prev => ({ ...prev, last_name: text }))}
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                        <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                            <Ionicons name="person-outline" size={16} color={colors.primary} /> {t("address")}
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                                            placeholder={t("address")}
                                            value={newFreelance.address}
                                            onChangeText={text => setNewFreelance(prev => ({ ...prev, address: text }))}
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                        <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                            <Ionicons name="person-outline" size={16} color={colors.primary} /> {t("phone")}
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                                            placeholder={t("phone")}
                                            value={newFreelance.phone}
                                            onChangeText={text => setNewFreelance(prev => ({ ...prev, phone: text }))}
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                        <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                            <Ionicons name="id-card-outline" size={16} color={colors.primary} /> {t("id_type")}
                                        </Text>
                                        <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                            <Picker
                                                selectedValue={newFreelance.type_id}
                                                onValueChange={value => setNewFreelance(prev => ({ ...prev, type_id: value }))}
                                            >
                                                <Picker.Item label="social" value="social" />
                                                <Picker.Item label="passport" value="passport" />
                                                <Picker.Item label="driver license" value="driver license" />
                                            </Picker>
                                        </View>
                                    </View>

                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                        <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                            <Ionicons name="card-outline" size={16} color={colors.primary} /> {t("id_number")}
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                                            placeholder="123456789"
                                            value={newFreelance.id_number}
                                            onChangeText={text => setNewFreelance(prev => ({ ...prev, id_number: text }))}
                                        />
                                    </View>

                                    {/* Sección de imágenes */}
                                    <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                        <Ionicons name="images-outline" size={18} /> {t("documents")}
                                    </Text>

                                    <CrossPlatformImageUpload
                                        label={t("photo")}
                                        image={freelanceImages.photo}
                                        onImageSelected={image => setFreelanceImages(prev => ({ ...prev, photo: image }))}
                                    />

                                    <TouchableOpacity
                                        style={[
                                            styles.submitButton,
                                            creatingFreelance && styles.disabledButton
                                        ]}
                                        onPress={handleCreateFreelance}
                                        disabled={creatingFreelance}
                                    >
                                        {creatingFreelance ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Ionicons name="save-outline" size={20} color="#fff" />
                                                <Text style={styles.buttonText}>{t("create_freelance")}</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightBackground,
    }, disabledButton: {
        backgroundColor: colors.neutralGray,
        opacity: 0.7,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        paddingTop: 16,
    },
    headerButton: {
        padding: 4,
        width: 32,
        alignItems: 'center',
    },
    headerSpacer: {
        width: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginVertical: 16,
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
    errorText: {
        color: colors.warning,
        fontSize: 14,
        marginLeft: 8,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
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
    operatorPhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderIcon: {
        opacity: 0.7,
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
    inputContainer: {
        marginBottom: 16,
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
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    createFormContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textLight,
        marginTop: 10,
        textAlign: 'center',
    },
    assignmentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    assignmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    assignmentName: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        color: colors.lightText,
    },
    assignmentDetails: {
        marginLeft: 32,
    },
    detailText: {
        fontSize: 14,
        color: colors.darkText,
        marginBottom: 4,
    },
    deleteButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 8,
    },
    assignNewButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    assignNewButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default FreelanceAssignmentScreen;