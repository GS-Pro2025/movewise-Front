import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { GetFreelanceByCode, FreelanceData } from '@/hooks/api/FreelanceClient';
import * as FileSystem from 'expo-file-system';
import { Picker } from '@react-native-picker/picker';
import { UpdateOperator } from '@/hooks/api/PostOperator';
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';

interface EditFreelanceModalProps {
    visible: boolean;
    freelancer: any;
    onClose: () => void;
    onSuccess: () => void;
}

const EditFreelanceModal: React.FC<EditFreelanceModalProps> = ({ visible, freelancer, onClose, onSuccess }) => {
    // console.log(`lo que se recibe en editar: ${JSON.stringify(freelancer)}`);

    const { t } = useTranslation();
    const [freelanceData, setFreelanceData] = useState<Partial<FreelanceData>>({
        code: '',
        salary: 0,
        first_name: '',
        last_name: '',
        type_id: 'CC',
        id_number: '',
        address: '',
        phone: '',
        email: '',
        status: 'freelance'
    });
    const [freelanceImages, setFreelanceImages] = useState<{
        photo?: any,
        license_front?: any,
        license_back?: any
    }>({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (visible && freelancer) {
            loadFreelanceData();
        } else if (!visible) {
            // Limpiar formulario al cerrar
            resetForm();
        }
    }, [visible, freelancer]);

    const loadFreelanceData = async () => {
        try {
            setLoadingData(true);
            const response = await GetFreelanceByCode(freelancer.code);
            const apiData = response.data; // Acceder a data.data según tu estructura

            // console.log('Datos procesados:', apiData);

            setFreelanceData({
                code: apiData.code || '',
                salary: parseFloat(apiData.salary) || 0,
                first_name: apiData.first_name || '',
                last_name: apiData.last_name || '',
                type_id: apiData.type_id || 'CC',
                id_number: apiData.id_number || '',
                address: apiData.address || '',
                phone: apiData.phone || '',
                email: apiData.email || '',
                status: apiData.status || 'freelance'
            });

            setFreelanceImages({
                photo: apiData.photo ? { uri: apiData.photo } : null,
                license_front: apiData.license_front ? { uri: apiData.license_front } : null,
                license_back: apiData.license_back ? { uri: apiData.license_back } : null
            });

        } catch (error: any) {
            console.error('Error cargando datos:', error);
            Alert.alert(t("error"), t("error_loading_freelance_data"));
            onClose();
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (visible && freelancer?.code) {
            loadFreelanceData();
        } else if (!visible) {
            resetForm();
        }
    }, [visible, freelancer?.code]); // Usar código como dependencia

    const handleUpdateFreelance = async () => {
        // Validar campos requeridos
        if (!freelanceData.code || !freelanceData.first_name || !freelanceData.last_name || !freelanceData.id_number) {
            Alert.alert(t("error"), t("please_fill_required_fields"));
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();

            // Campos obligatorios
            formData.append('code', freelanceData.code!);
            formData.append('salary', freelanceData.salary!.toString());
            formData.append('first_name', freelanceData.first_name!);
            formData.append('last_name', freelanceData.last_name!);
            formData.append('type_id', freelanceData.type_id!);
            formData.append('id_number', freelanceData.id_number!);
            formData.append('status', 'freelance');

            // Campos opcionales
            if (freelanceData.address) formData.append('address', freelanceData.address);
            if (freelanceData.phone) formData.append('phone', freelanceData.phone);
            if (freelanceData.email) formData.append('email', freelanceData.email);

            // Manejo de imágenes solo si se seleccionaron nuevas
            const processImage = async (image: any, fieldName: string) => {
                if (image && image.uri) {
                    const base64 = await FileSystem.readAsStringAsync(image.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    formData.append(fieldName, `data:${image.type || 'image/jpeg'};base64,${base64}`);
                }
            };

            await processImage(freelanceImages.photo, 'photo');
            await processImage(freelanceImages.license_front, 'license_front');
            await processImage(freelanceImages.license_back, 'license_back');

            await UpdateOperator(freelancer.id_operator, formData);
            Alert.alert(t("success"), t("freelance_updated"));
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error actualizando freelance:', error);
            Alert.alert(t("error"), error.message || t("update_freelance_error"));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFreelanceData({
            code: '',
            salary: 0,
            first_name: '',
            last_name: '',
            type_id: 'CC',
            id_number: '',
            address: '',
            phone: '',
            email: '',
            status: 'freelance'
        });
        setFreelanceImages({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const updateField = (field: keyof FreelanceData, value: any) => {
        setFreelanceData(prev => ({ ...prev, [field]: value }));
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: colors.lightBackground }]}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.header}>
                            <Text style={styles.modalTitle}>
                                <Ionicons name="pencil" size={20} color={colors.textLight} /> {t("edit_freelance")}
                            </Text>
                            <TouchableOpacity onPress={handleClose}>
                                <Ionicons name="close" size={24} color={colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        {loadingData ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.textLight} />
                                <Text style={styles.loadingText}>{t("loading_data")}</Text>
                            </View>
                        ) : (
                            <>
                                {/* Campos del formulario con iconos */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="barcode-outline" size={16} color={colors.textLight} /> {t("code")} *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="FRL-001"
                                        value={freelanceData.code}
                                        onChangeText={text => updateField('code', text)}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="cash-outline" size={16} color={colors.textLight} /> {t("salary")} *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0.00"
                                        value={freelanceData.salary?.toString() || ''}
                                        onChangeText={text => updateField('salary', parseFloat(text) || 0)}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="person-outline" size={16} color={colors.textLight} /> {t("first_name")} *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t("first_name")}
                                        value={freelanceData.first_name}
                                        onChangeText={text => updateField('first_name', text)}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="people-outline" size={16} color={colors.textLight} /> {t("last_name")} *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t("last_name")}
                                        value={freelanceData.last_name}
                                        onChangeText={text => updateField('last_name', text)}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="mail-outline" size={16} color={colors.textLight} /> {t("email")}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="ejemplo@correo.com"
                                        value={freelanceData.email}
                                        onChangeText={text => updateField('email', text)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="location-outline" size={16} color={colors.textLight} /> {t("address")}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t("address")}
                                        value={freelanceData.address}
                                        onChangeText={text => updateField('address', text)}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="call-outline" size={16} color={colors.textLight} /> {t("phone")}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t("phone")}
                                        value={freelanceData.phone}
                                        onChangeText={text => updateField('phone', text)}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="id-card-outline" size={16} color={colors.textLight} /> {t("id_type")} *
                                    </Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={freelanceData.type_id}
                                            onValueChange={value => updateField('type_id', value)}
                                        >
                                            <Picker.Item label="Cédula" value="CC" />
                                            <Picker.Item label="Pasaporte" value="PA" />
                                            <Picker.Item label="Otro" value="OT" />
                                        </Picker>
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        <Ionicons name="card-outline" size={16} color={colors.textLight} /> {t("id_number")} *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="123456789"
                                        value={freelanceData.id_number}
                                        onChangeText={text => updateField('id_number', text)}
                                        keyboardType="numeric"
                                    />
                                </View>

                                {/* Sección de imágenes */}
                                <Text style={styles.sectionTitle}>
                                    <Ionicons name="images-outline" size={18} color={colors.textLight} /> {t("documents")}
                                </Text>

                                <Text style={styles.imageNote}>
                                    <Ionicons name="information-circle-outline" size={16} color={colors.neutralGray} />
                                    {" " + t("select_only_if_updating_images")}
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

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={handleClose}
                                    >
                                        <Ionicons name="close-outline" size={20} color={colors.neutralGray} />
                                        <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                                        onPress={handleUpdateFreelance}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Ionicons name="save-outline" size={20} color="#fff" />
                                        )}
                                        <Text style={styles.buttonText}>
                                            {loading ? t("updating") : t("update_freelance")}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textLight,
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.neutralGray,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textLight,
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
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: colors.textLight,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginTop: 4,
    },
    imageNote: {
        fontSize: 12,
        color: colors.neutralGray,
        marginBottom: 15,
        fontStyle: 'italic',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        gap: 8,
    },
    cancelButtonText: {
        color: colors.neutralGray,
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        flex: 2,
        flexDirection: 'row',
        backgroundColor: colors.textLight,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});


export default EditFreelanceModal;