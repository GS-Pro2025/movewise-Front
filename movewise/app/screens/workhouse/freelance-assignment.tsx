import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TextInput,
    Image,
    SafeAreaView,
    Modal,
    useColorScheme,
    FlatList,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import _PhoneInput from 'react-native-phone-number-input';
import CountryFlag from 'react-native-country-flag';
import { CountryCode } from 'react-native-country-picker-modal';
import { GetFreelanceByCode, CreateFreelance, FreelanceData } from '@/hooks/api/FreelanceClient';
import { CreateAssignment } from '@/hooks/api/AssignClient';
import { GetAssignedOperators } from '@/hooks/api/GetAssignedOperators';
import { deleteAssign } from '@/hooks/api/DeleteAssign';
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';
import * as FileSystem from 'expo-file-system';
import { ListOperatorsAndFreelances } from '@/hooks/api/Get_operators_and_freelances';
import { url } from '@/hooks/api/apiClient';
import Toast from 'react-native-toast-message';
import colors from '@/app/Colors';
import apiClient from '@/hooks/api/apiClient';

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
    const theme = useColorScheme();
    const isDarkMode = theme === 'dark';
    const PhoneInput = _PhoneInput as any;

    const [creatingFreelance, setCreatingFreelance] = useState(false);
    const [freelanceCode, setFreelanceCode] = useState('');
    const [freelanceData, setFreelanceData] = useState<any>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [additionalCosts, setAdditionalCosts] = useState('');
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Estados para la lista de operadores
    const [operators, setOperators] = useState<any[]>([]);
    const [filteredOperators, setFilteredOperators] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedOperators, setSelectedOperators] = useState<Set<number>>(new Set());
    const [adding, setAdding] = useState(false);


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

    // Estados para el input de teléfono
    const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>('US');
    const [formattedPhone, setFormattedPhone] = useState('');
    const phoneInput = useRef<any>(null);

    // Estados para la imagen
    const [freelanceImages, setFreelanceImages] = useState<{
        photo?: any,
    }>({});

    // Estados para la lista de asignados
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

    // Nuevo estado para controlar la vista
    const [currentView, setCurrentView] = useState<'main' | 'assignment'>('main');

    // Procesar workhouseKey
    const processedWorkhouseKey = workhouseKey?.split('|')[0] || workhouseKey || "";

    // Cargar asignados cuando se abre el modal
    useEffect(() => {
        if (visible && processedWorkhouseKey) {
            loadAssignments();
        }
    }, [visible, processedWorkhouseKey]);

    // Cargar operadores asignados
    const loadAssignments = async () => {
        if (!processedWorkhouseKey) return;

        try {
            setLoadingAssignments(true);
            const data = await GetAssignedOperators(processedWorkhouseKey);
            setAssignments(data || []);
            setAssignmentsError(null);
        } catch (err) {
            setAssignmentsError(t("error_fetching_assignments") || "Error cargando asignados");
        } finally {
            setLoadingAssignments(false);
        }
    };

    // Cargar operadores disponibles
    const fetchOperators = async (pageNumber = 1, reset = false) => {
        if (pageNumber === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await ListOperatorsAndFreelances(pageNumber);

            if (!response || !response.results) {
                throw new Error('Invalid response format from server');
            }

            const newOperators = response.results || [];
            if (reset || pageNumber === 1) {
                setOperators(newOperators);
            } else {
                setOperators(prev => [...prev, ...newOperators]);
            }

            setHasMore(!!response.next);
            setPage(pageNumber);
        } catch (error: any) {
            console.error('Error fetching operators:', error);
            Toast.show({
                type: 'error',
                text1: t('error'),
                text2: t('error_fetching_operators') || 'Error al cargar operadores',
            });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Filtrar operadores por término de búsqueda
    useEffect(() => {
        if (!freelanceCode.trim()) {
            setFilteredOperators(operators);
        } else {
            const filtered = operators.filter(operator => {
                const fullName = `${operator.first_name || ''} ${operator.last_name || ''}`.toLowerCase();
                const idNumber = (operator.id_number || '').toLowerCase();
                const search = freelanceCode.toLowerCase();

                return fullName.includes(search) || idNumber.includes(search);
            });
            setFilteredOperators(filtered);
        }
    }, [freelanceCode, operators]);

    // Cambiar a vista de asignación
    const showAssignmentView = () => {
        setCurrentView('assignment');
        fetchOperators(1, true);
    };

    // Volver a vista principal
    const goBackToMain = () => {
        setCurrentView('main');
        setShowCreateForm(false);
        setSelectedOperators(new Set());
    };


    // Extraer IDs de operadores de las asignaciones
    const assignedOperatorIds = new Set(assignments.map(assign => assign.id));

    // Seleccionar/deseleccionar operador
    const toggleOperatorSelection = (operatorId: number) => {
        // No hacer nada si el operador ya está asignado
        if (assignedOperatorIds.has(operatorId)) {
            return;
        }

        setSelectedOperators(prev => {
            const newSet = new Set(prev);
            if (newSet.has(operatorId)) {
                newSet.delete(operatorId);
            } else {
                newSet.add(operatorId);
            }
            return newSet;
        });
    };

    // Cerrar modal
    const handleClose = () => {
        onClose();
    };

    // Asignar operadores seleccionados
    const handleAssignFreelance = async () => {
        if (selectedOperators.size === 0) {
            Toast.show({
                type: 'error',
                text1: t('error'),
                text2: t('no_operators_selected') || 'Selecciona al menos un operador',
            });
            return;
        }

        setAssignmentLoading(true);
        try {
            const selected = operators.filter(op => selectedOperators.has(op.id_operator));

            const payload = selected.map(op => ({
                operator: op.id_operator,
                order: processedWorkhouseKey,
                rol: op.status === 'active' ? 'operator' : 'freelance',
                additional_costs: additionalCosts || 0
            }));

            // Usar el apiClient en lugar de fetch directo
            const response = await apiClient.post('/assigns/bulk/', payload);

            if (response.status === 207 && response.data?.data?.conflicts) {
                const conflictMessages = response.data.data.conflicts
                    .map((c: { operator_id: number; message: string }) =>
                        `${t('operator')} ${c.operator_id}: ${c.message}`)
                    .join('\n');
                throw new Error(conflictMessages);
            }

            Toast.show({
                type: 'success',
                text1: t('success'),
                text2: t('operators_assigned_successfully') || 'Operadores asignados correctamente',
            });

            // Refresh assignments and return to main view
            await loadAssignments();
            setCurrentView('main');
            setSelectedOperators(new Set());
            alert('Operadores asignados correctamente');
            // onSuccess();
        } catch (error: any) {
            console.error('Error al asignar operadores:', error);
            const errorMessage = error.response?.data?.detail ||
                error.message ||
                'Error al asignar operadores';

            Toast.show({
                type: 'error',
                text1: t('error'),
                text2: errorMessage,
            });
        } finally {
            setAssignmentLoading(false);
        }
    };
   
    // Renderizar item de operador
    const renderOperatorItem = ({ item }: { item: any }) => {
        const isSelected = selectedOperators.has(item.id_operator);
        const isAssigned = assignedOperatorIds.has(item.id_operator);
    
        return (
            <TouchableOpacity
                style={[
                    styles.operatorItem,
                    {
                        backgroundColor: isAssigned
                            ? (isDarkMode ? '#2d3748' : '#e5e7eb')
                            : isSelected
                                ? (isDarkMode ? '#2d3748' : '#ebf8ff')
                                : (isDarkMode ? '#1e293b' : '#f8fafc'),
                        borderColor: isAssigned
                            ? (isDarkMode ? '#64748b' : '#d1d5db')
                            : isSelected
                                ? (isDarkMode ? '#4ade80' : '#38b2ac')
                                : (isDarkMode ? '#334155' : '#e5e7eb'),
                        borderWidth: 2,
                        opacity: isAssigned ? 0.6 : 1,
                    }
                ]}
                onPress={() => {
                    if (!isAssigned) {
                        toggleOperatorSelection(item.id_operator);
                    }
                }}
                disabled={isAssigned}
            >
                <View style={styles.operatorInfo}>
                    <View style={styles.photoContainer}>
                        {item.photo ? (
                            <Image 
                                source={{ uri: item.photo }} 
                                style={styles.operatorPhoto} 
                            />
                        ) : (
                            <View style={[styles.operatorPhoto, styles.noPhoto, {backgroundColor: isDarkMode ? '#374151' : '#f3f4f6'}]}>
                                <Ionicons 
                                    name="person" 
                                    size={30} 
                                    color={isDarkMode ? '#64748b' : '#94a3b8'}
                                />
                            </View>
                        )}
                    </View>
    
                    <View style={styles.operatorDetails}>
                        <Text style={[
                            styles.operatorName,
                            {
                                color: isAssigned
                                    ? (isDarkMode ? '#94a3b8' : '#9ca3af')
                                    : (isDarkMode ? '#ffffff' : '#1f2937')
                            }
                        ]}>
                            {item.first_name} {item.last_name}
                        </Text>
                        <Text style={[
                            styles.operatorId, 
                            { 
                                color: isDarkMode ? '#94a3b8' : '#6b7280' 
                            }
                        ]}>
                            ID: {item.id_number}
                        </Text>
                        <Text style={[
                            styles.operatorCode, 
                            { 
                                color: isDarkMode ? '#94a3b8' : '#6b7280' 
                            }
                        ]}>
                            {item.code}
                        </Text>
                    </View>
                </View>
    
                <View style={styles.checkboxContainer}>
                    {isAssigned ? (
                        <Ionicons
                            name="checkmark-done"
                            size={24}
                            color={isDarkMode ? '#94a3b8' : '#64748b'}
                        />
                    ) : isSelected ? (
                        <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={isDarkMode ? '#4ade80' : '#38b2ac'}
                        />
                    ) : (
                        <Ionicons
                            name="ellipse-outline"
                            size={24}
                            color={isDarkMode ? '#64748b' : '#cbd5e1'}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Formatear número de teléfono
    const formatPhoneNumber = (phone: string, countryCode: string) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        const callingCode = phoneInput.current?.getCallingCode() || '';
        if (callingCode && cleaned) {
            return `+${callingCode}-${cleaned}`;
        }
        return phone;
    };

    // Botón de bandera para input de teléfono
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

    // Crear nuevo freelancer
    const handleCreateFreelance = async () => {
        setCreatingFreelance(true);
        try {
            const formData = new FormData();

            const formattedPhoneNumber = formatPhoneNumber(newFreelance.phone || '', phoneCountryCode);

            formData.append('salary', newFreelance.salary!.toString());
            formData.append('first_name', newFreelance.first_name!);
            formData.append('last_name', newFreelance.last_name!);
            formData.append('type_id', newFreelance.type_id!);
            formData.append('id_number', newFreelance.id_number!);
            formData.append('status', 'freelance');

            if (newFreelance.address) formData.append('address', newFreelance.address);
            if (formattedPhoneNumber) formData.append('phone', formattedPhoneNumber);

            if (freelanceImages.photo) {
                const filename = freelanceImages.photo.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('photo', {
                    uri: freelanceImages.photo.uri,
                    name: filename || `photo-${Date.now()}.jpg`,
                    type: type
                } as any);
            }

            await CreateFreelance(formData);
            setShowCreateForm(false);

            // Resetear formulario
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

            // Recargar operadores
            fetchOperators(1, true);

            Toast.show({
                type: 'success',
                text1: t('success'),
                text2: t('freelance_created') || 'Freelance creado exitosamente',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: t('error'),
                text2: error.message || t("create_freelance_error"),
            });
        } finally {
            setCreatingFreelance(false);
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
                            Toast.show({
                                type: 'success',
                                text1: t('success'),
                                text2: t('assignment_deleted'),
                            });
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: t('error'),
                                text2: t('delete_error'),
                            });
                        }
                    }
                }
            ]
        );
    };

    // Renderizar vista principal (operadores asignados)
    const renderMainView = () => {
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: isDarkMode ? colors.white : colors.darkText }]}>
                        {t('assigned_operators')}
                    </Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={isDarkMode ? colors.white : colors.darkText} />
                    </TouchableOpacity>
                </View>

                {/* Lista de asignados */}
                {loadingAssignments ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : assignmentsError ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{assignmentsError}</Text>
                    </View>
                ) : assignments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color={isDarkMode ? colors.lightText : colors.darkText} />
                        <Text style={[styles.emptyText, { color: isDarkMode ? colors.lightText : colors.darkText }]}>
                            {t('no_assignments')}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={assignments}
                        keyExtractor={(item) => item.id_assign.toString()}
                        renderItem={({ item }) => (
                            <View style={[styles.assignmentCard, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <View style={styles.assignmentHeader}>
                                    <Ionicons name="person-circle" size={24} color={colors.primary} />
                                    <Text style={[styles.assignmentName, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                        {item.first_name} {item.last_name}
                                    </Text>
                                </View>
                                <View style={styles.assignmentDetails}>
                                    <Text style={[styles.detailText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                        ID: {item.id_operator}
                                    </Text>
                                    <Text style={[styles.detailText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                        {t("assigned_at")}: {new Date(item.assigned_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteAssignment(item.id_assign)}
                                >
                                    <Ionicons name="trash" size={20} color={colors.warning} />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}

                {/* Botón para asignar nuevos */}
                <TouchableOpacity
                    style={[styles.assignNewButton, { backgroundColor: colors.primary }]}
                    onPress={showAssignmentView}
                >
                    <Ionicons name="person-add" size={20} color="#fff" />
                    <Text style={styles.assignNewButtonText}>{t("assign_new_operator")}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Renderizar vista de asignación (buscar y asignar operadores)
    const renderAssignmentView = () => {
        return (
            <View style={{ flex: 1 }}>
                {/* Header con botón de retroceso */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={goBackToMain} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDarkMode ? colors.white : colors.darkText} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: isDarkMode ? colors.white : colors.darkText }]}>
                        {t('assign_operators')}
                    </Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={isDarkMode ? colors.white : colors.darkText} />
                    </TouchableOpacity>
                </View>

                {/* Formulario de creación o lista de operadores */}
                {showCreateForm ? (
                    <ScrollView style={{ flex: 1 }}>
                        <View style={[styles.createFormContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("new_freelance")}</Text>

                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                    <Ionicons name="cash-outline" size={16} color={colors.primary} /> {t("salary")}
                                </Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight, color: isDarkMode ? colors.white : colors.darkText }]}
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
                                    style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight, color: isDarkMode ? colors.white : colors.darkText }]}
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
                                    style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight, color: isDarkMode ? colors.white : colors.darkText }]}
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
                                    style={[styles.input, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight, color: isDarkMode ? colors.white : colors.darkText }]}
                                    placeholder={t("address")}
                                    value={newFreelance.address}
                                    onChangeText={text => setNewFreelance(prev => ({ ...prev, address: text }))}
                                />
                            </View>

                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                    <Ionicons name="call-outline" size={16} color={colors.primary} /> {t("phone")}
                                </Text>
                                <View style={[
                                    styles.phoneInputContainer,
                                    {
                                        backgroundColor: isDarkMode ? '#1E3A5F' : '#FFFFFF',
                                        borderColor: isDarkMode ? '#A1C6EA' : '#0458AB'
                                    }
                                ]}>
                                    <PhoneInput
                                        ref={phoneInput}
                                        defaultValue={newFreelance.phone}
                                        defaultCode={phoneCountryCode}
                                        layout="first"
                                        flagButton={renderFlagButton}
                                        onChangeText={(text: string) => {
                                            setNewFreelance(prev => ({ ...prev, phone: text }));
                                        }}
                                        onChangeCountry={(country: any) => {
                                            setPhoneCountryCode(country.cca2);
                                        }}
                                        withDarkTheme={isDarkMode}
                                        withShadow={false}
                                        autoFocus={false}
                                        containerStyle={{
                                            backgroundColor: 'transparent',
                                            width: '100%',
                                            height: 50,
                                        }}
                                        textContainerStyle={{
                                            backgroundColor: 'transparent',
                                            paddingVertical: 0,
                                            height: 48,
                                            paddingLeft: 0
                                        }}
                                        textInputStyle={{
                                            color: isDarkMode ? '#FFFFFF' : '#333333',
                                            fontSize: 16,
                                            height: 48,
                                            padding: 0,
                                            margin: 0,
                                        }}
                                        codeTextStyle={{
                                            color: isDarkMode ? '#FFFFFF' : '#333333',
                                            fontSize: 16,
                                            height: 48,
                                            padding: 0,
                                            paddingVertical: 12,
                                            margin: 0,
                                        }}
                                        countryPickerButtonStyle={{
                                            paddingRight: 8,
                                            height: 45
                                        }}
                                        flagSize={20}
                                    />
                                </View>
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

                            <TouchableOpacity
                                style={[styles.cancelButton, { marginTop: 10 }]}
                                onPress={() => setShowCreateForm(false)}
                            >
                                <Text style={{ color: colors.warning, textAlign: 'center' }}>{t("cancel")}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                    <>
                        {/* Búsqueda y lista */}
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: isDarkMode ? colors.darkText : colors.darkText,
                                        borderColor: isDarkMode ? colors.darkBackground : colors.lightBackground
                                    }
                                ]}
                                placeholder={t('search_operator')}
                                placeholderTextColor={isDarkMode ? colors.darkText : colors.lightText}
                                value={freelanceCode}
                                onChangeText={setFreelanceCode}
                            />
                        </View>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                            </View>
                        ) : (
                            <FlatList
                                data={filteredOperators}
                                renderItem={renderOperatorItem}
                                keyExtractor={(item) => item.id_operator.toString()}
                                contentContainerStyle={styles.operatorList}
                                onEndReached={() => {
                                    if (!loadingMore && hasMore) {
                                        fetchOperators(page + 1);
                                    }
                                }}
                                onEndReachedThreshold={0.5}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="people-outline" size={48} color={isDarkMode ? colors.lightText : colors.darkText} />
                                        <Text style={[styles.emptyText, { color: isDarkMode ? colors.lightText : colors.darkText }]}>
                                            {t('no_operators_found')}
                                        </Text>
                                    </View>
                                }
                            />
                        )}

                        {/* Botones en el footer */}
                        <View style={[styles.footer, { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                            <TouchableOpacity
                                style={[styles.createNewButton, { flex: 1, marginRight: 10 }]}
                                onPress={() => setShowCreateForm(true)}
                            >
                                <Ionicons name="add-circle" size={20} color={colors.secondary} />
                                <Text style={[styles.createNewButtonText, { color: colors.secondary }]}>
                                    {t("create_new_operator")}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.assignButton,
                                    selectedOperators.size === 0 && styles.assignButtonDisabled,
                                    { flex: 1 }
                                ]}
                                onPress={handleAssignFreelance}
                                disabled={selectedOperators.size === 0}
                            >
                                <Text style={styles.assignButtonText}>
                                    {assignmentLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        `${t('assign_operators')} (${selectedOperators.size})`
                                    )}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.lightBackground }]}>
                {currentView === 'main' ? renderMainView() : renderAssignmentView()}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    photoContainer: {
        marginRight: 12,
    },
    operatorPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    noPhoto: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    operatorDetails: {
        flex: 1,
    },
    operatorName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    operatorId: {
        fontSize: 14,
        marginBottom: 2,
    },
    operatorCode: {
        fontSize: 12,
    },
    checkboxContainer: {
        padding: 8,
    },
    operatorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    container: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginVertical: 16,
    },
    assignNewButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 16,
    },
    assignNewButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    cancelButton: {
        padding: 10,
        alignItems: 'center',
    },
    assignedOperatorItem: {
        backgroundColor: '#f8f9fa',
        borderColor: '#dee2e6',
    },
    assignedBadge: {
        color: colors.placeholderDark,
        fontSize: 12,
        fontStyle: 'italic',
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
    },
    assignmentDetails: {
        marginLeft: 32,
    },
    detailText: {
        fontSize: 14,
        marginBottom: 4,
    },
    deleteButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 5,
    },
    searchContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    operatorItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    selectedOperatorItem: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    operatorList: {
        padding: 16,
        paddingBottom: 80,
    },
    
    operatorImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    operatorImagePlaceholder: {
        backgroundColor: colors.lightBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    operatorStatus: {
        fontSize: 12,
        fontWeight: '500',
    },
    checkIcon: {
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        padding: 16,
        backgroundColor: '#ffebee',
        borderRadius: 8,
        margin: 16,
        alignItems: 'center',
    },
    errorText: {
        color: colors.warning,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    assignButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    assignButtonDisabled: {
        backgroundColor: colors.disabled,
        opacity: 0.6,
    },
    assignButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    closeButton: {
        padding: 5,
    },
    freelanceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
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
    phoneInputContainer: {
        borderWidth: 1,
        borderRadius: 8,
        width: '100%',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    createNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
    disabledButton: {
        opacity: 0.6,
    },
});

export default FreelanceAssignmentScreen;