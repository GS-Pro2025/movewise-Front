import { useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { CreateFreelance, FreelanceData } from '@/hooks/api/FreelanceClient';
import * as FileSystem from 'expo-file-system';
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';
import { Picker } from '@react-native-picker/picker';
import EditAssignmentsModal from './EditAssignmentsModal';
import { useColorScheme } from 'react-native';
import _PhoneInput from 'react-native-phone-number-input';
import { CountryCode } from 'react-native-country-picker-modal';
import CountryFlag from 'react-native-country-flag';


const PhoneInput = _PhoneInput as any;
interface CreateFreelanceModalProps {
    visible: boolean;
    isFromFreelance: Boolean;
    workHouseKey: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateFreelanceModal: React.FC<CreateFreelanceModalProps> = ({ visible, onClose, onSuccess, isFromFreelance = false, workHouseKey }) => {
    const { t } = useTranslation();
    const [showAssignmentsModal, setShowAssignmentsModal] = useState(false)
    const [newFreelance, setNewFreelance] = useState<Partial<FreelanceData>>({
        status: 'freelance',
        type_id: 'CC'
    });
    const [freelanceImages, setFreelanceImages] = useState<{
        photo?: any,
        license_front?: any,
        license_back?: any
    }>({});

    // Estados para el input de teléfono
    const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>('US');
    const [formattedPhone, setFormattedPhone] = useState('');
    const phoneInput = useRef<any>(null);

    const [loading, setLoading] = useState(false);
    const isDarkMode = useColorScheme() === 'dark';
    const handleCreateFreelance = async () => {
        try {
            setLoading(true);
            const formData = new FormData();

            const formattedPhoneNumber = formatPhoneNumber(newFreelance.phone || '', phoneCountryCode);


            // Campos obligatorios
            formData.append('salary', newFreelance.salary!.toString());
            formData.append('first_name', newFreelance.first_name!);
            formData.append('last_name', newFreelance.last_name!);
            formData.append('type_id', newFreelance.type_id!);
            formData.append('id_number', newFreelance.id_number!);
            formData.append('status', 'freelance');

            // Campos opcionales
            if (newFreelance.address) formData.append('address', newFreelance.address);
            if (formattedPhoneNumber) formData.append('phone', formattedPhoneNumber);

            // Manejo de imágenes
            const processImage = async (image: any, fieldName: string) => {
                if (image) {
                    const base64 = await FileSystem.readAsStringAsync(image.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    formData.append(fieldName, `data:${image.type || 'image/jpg'};base64,${base64}`);
                }
            };

            await processImage(freelanceImages.photo, 'photo');
            await processImage(freelanceImages.license_front, 'license_front');
            await processImage(freelanceImages.license_back, 'license_back');

            await CreateFreelance(formData);
            onSuccess();
            onClose();
            if (isFromFreelance) {
                //abrir modal de asignacion
                setShowAssignmentsModal(true)
            }
            Alert.alert(t("success"), t("freelance_created"));
        } catch (error: any) {
            Alert.alert(t("error"), error.message || t("create_freelance_error"));
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneNumber = (phone: string, countryCode: string) => {
        if (!phone) return '';
        // Eliminar caracteres que no sean dígitos
        const cleaned = phone.replace(/\D/g, '');
        // Obtener el código de llamada del país
        const callingCode = phoneInput.current?.getCallingCode() || '';
        // Formatear como +callingCode-number (solo si tenemos código de llamada y número de teléfono)
        if (callingCode && cleaned) {
            return `+${callingCode}-${cleaned}`;
        }
        return phone;
    };
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
    return (
        <>
            <Modal visible={visible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <View style={[styles.header, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.modalTitle, { color: isDarkMode ? colors.darkText : colors.lightText }]}>{t("new_freelance")}</Text>
                                <TouchableOpacity onPress={() => onClose()}>
                                    <Ionicons name="close" size={24} color={isDarkMode ? colors.darkText : colors.lightText} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.modalTitle, { fontSize: 10 }]}>{t("current_order")} {workHouseKey}</Text>

                            {/* Campos del formulario con iconos */}
                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
                                    <Ionicons name="cash-outline" size={16} color={isDarkMode ? colors.darkText : colors.lightText} /> {t("salary")}
                                </Text>
                                <TextInput
                                    style={[styles.input, { color: isDarkMode ? colors.lightText : colors.lightText }]}
                                    placeholder="$0.00"
                                    value={newFreelance.salary?.toString()}
                                    onChangeText={text => setNewFreelance(prev => ({ ...prev, salary: parseFloat(text) || 0 }))}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
                                    <Ionicons name="person-outline" size={16} color={isDarkMode ? colors.darkText : colors.lightText} /> {t("first_name")}
                                </Text>
                                <TextInput
                                    style={[styles.input, { color: isDarkMode ? colors.lightText : colors.lightText }]}
                                    placeholder={t("first_name")}
                                    value={newFreelance.first_name}
                                    onChangeText={text => setNewFreelance(prev => ({ ...prev, first_name: text }))}
                                />
                            </View>

                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
                                    <Ionicons name="people-outline" size={16} color={isDarkMode ? colors.darkText : colors.lightText} /> {t("last_name")}
                                </Text>
                                <TextInput
                                    style={[styles.input, { color: isDarkMode ? colors.lightText : colors.lightText }]}
                                    placeholder={t("last_name")}
                                    value={newFreelance.last_name}
                                    onChangeText={text => setNewFreelance(prev => ({ ...prev, last_name: text }))}
                                />
                            </View>

                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
                                    <Ionicons name="person-outline" size={16} color={isDarkMode ? colors.darkText : colors.lightText} /> {t("address")}
                                </Text>
                                <TextInput
                                    style={[styles.input, { color: isDarkMode ? colors.lightText : colors.lightText }]}
                                    placeholder={t("address")}
                                    value={newFreelance.address}
                                    onChangeText={text => setNewFreelance(prev => ({ ...prev, address: text }))}
                                />
                            </View>

                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
                                    <Ionicons name="person-outline" size={16} color={isDarkMode ? colors.darkText : colors.lightText} /> {t("phone")}
                                </Text>
                                <PhoneInput
                                    ref={phoneInput}
                                    defaultValue={newFreelance.phone}
                                    defaultCode={phoneCountryCode}
                                    layout="first"
                                    flagButton={renderFlagButton}
                                    onChangeText={(text: string) => {
                                        setNewFreelance(prev => ({ ...prev, phone: text }));
                                        // Formatear el número de teléfono cuando cambia el texto
                                        const formatted = formatPhoneNumber(text, phoneCountryCode);
                                        setFormattedPhone(formatted);
                                    }}
                                    onChangeFormattedText={(text: string) => {
                                        // No usamos esto para establecer el teléfono formateado
                                        // ya que no coincide con nuestro formato deseado con guión
                                    }}
                                    onChangeCountry={(country: any) => {
                                        setPhoneCountryCode(country.cca2);
                                        // Actualizar solo el código de país, sin incluir el número de teléfono aún
                                        setFormattedPhone(`+${phoneInput.current?.getCallingCode()}`);
                                    }}
                                    withDarkTheme={isDarkMode}
                                    withShadow={false}
                                    autoFocus={false}
                                    containerStyle={{
                                        backgroundColor: '#fff',
                                        width: '100%',
                                        height: 50, borderWidth: 1,
                                        borderColor: colors.primary,
                                        borderRadius: 8,
                                    }}
                                    textContainerStyle={{
                                        backgroundColor: 'transparent',
                                        paddingVertical: 0,
                                        height: 48,
                                        paddingLeft: 0,
                                        color: isDarkMode ? colors.lightText : colors.lightText,
                                    }}
                                    textInputStyle={{
                                        color: isDarkMode ? colors.lightText : colors.lightText,
                                        fontSize: 16,
                                        height: 48,
                                        padding: 0,
                                        margin: 0,
                                    }}
                                    codeTextStyle={{
                                        color: isDarkMode ? colors.lightText : colors.lightText,
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

                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
                                    <Ionicons name="id-card-outline" size={16} color={isDarkMode ? colors.darkText : colors.lightText} /> {t("id_type")}
                                </Text>
                                <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? colors.lightBackground : colors.backgroundLight }]}>
                                    <Picker
                                        selectedValue={newFreelance.type_id}
                                        onValueChange={value => setNewFreelance(prev => ({ ...prev, type_id: value }))}
                                    >
                                        <Picker.Item label="social" value="CC" />
                                        <Picker.Item label="passport" value="PA" />
                                        <Picker.Item label="Driver licence" value="OT" />
                                    </Picker>
                                </View>
                            </View>

                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
                                    <Ionicons name="images-outline" size={18} /> {t("documents")}
                                </Text>
                                <TextInput
                                    style={[styles.input, { color: isDarkMode ? colors.lightText : colors.lightText }]}
                                    placeholder="123456789"
                                    value={newFreelance.id_number}
                                    onChangeText={text => setNewFreelance(prev => ({ ...prev, id_number: text }))}
                                />
                            </View>

                            {/* Sección de imágenes */}
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
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

            {isFromFreelance && workHouseKey && (
                <EditAssignmentsModal
                    visible={showAssignmentsModal}
                    onClose={() => setShowAssignmentsModal(false)}
                    workhouseKey={workHouseKey!} // Usar non-null assertion
                    onRefresh={onSuccess}
                />
            )}

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

export default CreateFreelanceModal;