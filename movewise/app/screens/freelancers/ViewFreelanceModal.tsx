import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { GetFreelanceByCode, FreelanceData } from '@/hooks/api/FreelanceClient';
import { useColorScheme } from 'react-native';

interface ViewFreelanceModalProps {
    visible: boolean;
    freelancer: any;
    onClose: () => void;
    onEdit: () => void;
}

const ViewFreelanceModal: React.FC<ViewFreelanceModalProps> = ({ visible, freelancer, onClose, onEdit }) => {
//    console.log(`received freelance: ${JSON.stringify(freelancer)}`);
   
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";
    const [freelanceData, setFreelanceData] = useState<Partial<FreelanceData> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && freelancer) {
            setFreelanceData(freelancer); // Usa directamente los datos del prop
        }
    }, [visible, freelancer]);

    const loadFreelanceData = async () => {
        try {
            setLoading(true);
            const data = await GetFreelanceByCode(freelancer.code);
            setFreelanceData(data);
        } catch (error: any) {
            Alert.alert(t("error"), t("error_loading_freelance_data"));
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        onEdit();
    };

    const renderInfoRow = (icon: string, label: string, value: string | number | undefined) => {
        const primaryColor = isDarkMode ? colors.primaryDark : colors.primary;
        if (!value) return null;

        return (
            <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon as any} size={18} color={isDarkMode ? colors.darkText : colors.lightText} />
                </View>
                <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: isDarkMode ? colors.darkText : colors.lightText }]}>{label}</Text>
                    <Text style={[styles.infoValue, { color: isDarkMode ? colors.darkText : colors.lightText }]}>{value}</Text>
                </View>
            </View>
        );
    };

    const renderImageSection = (imageUrl: string | undefined, title: string, icon: string) => {
        if (!imageUrl) return null;
        const backgroundColor = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
        const primaryColor = isDarkMode ? colors.primaryDark : colors.primary;
        return (
            <View style={[styles.imageSection, { backgroundColor }]}>
                <View style={styles.imageTitleContainer}>
                    <Ionicons name={icon as any} size={16} color={primaryColor} />
                    <Text style={styles.imageTitle}>{title}</Text>
                </View>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.documentImage}
                        resizeMode="cover"
                    />
                </View>
            </View>
        );
    };

    const getIdTypeLabel = (typeI: string) => {
        switch (typeI.toLowerCase()) {
            case 'dni':
                return t('dni');
            case 'nie':
                return t('nie');
            case 'passport':
                return t('passport');
            default:
                return typeI;
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                    {/* Header con gradiente */}
                    <View style={[styles.header, { borderBottomColor: isDarkMode ? colors.lightText : colors.darkText }]}>
                        <Text style={[styles.title, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t('freelancer_details')}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.closeButton, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                        >
                            <Ionicons name="close" size={20} color={isDarkMode ? colors.darkText : colors.lightText} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <ScrollView
                            contentContainerStyle={styles.content}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Información principal */}
                            <View style={styles.profileSection}>
                                <View style={[styles.avatar, { backgroundColor: isDarkMode ? colors.primaryDark : colors.primary }]}>
                                    <Ionicons name="person" size={40} color={isDarkMode ? colors.textLight : colors.primary} />
                                </View>
                                <Text style={[styles.name, { color: isDarkMode ? colors.darkText : colors.lightText }]}>
                                    {freelanceData?.first_name} {freelanceData?.last_name}
                                </Text>
                                
                            </View>

                            {/* Sección de información */}
                            <View style={[styles.infoSection, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                    {t('contact_info')}
                                </Text>
                                {renderInfoRow('call', t('phone'), freelanceData?.phone)}
                                {renderInfoRow('mail', t('email'), freelanceData?.email || t('not_specified'))}
                                {renderInfoRow('location', t('address'), freelanceData?.address || t('not_specified'))}
                            </View>

                            {/* Sección de documentos */}
                            <View style={[styles.infoSection, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                    {t('documents')}
                                </Text>
                                {renderInfoRow('id-card', t('id_type'), getIdTypeLabel(freelanceData?.type_id || '') || t('not_specified'))}
                                {renderInfoRow('document', t('id_number'), freelanceData?.id_number || t('not_specified'))}
                            </View>

                            {/* Sección de imágenes */}
                            {renderImageSection(freelanceData?.license_front, t('license_front'), 'document')}
                            {renderImageSection(freelanceData?.license_back, t('license_back'), 'document')}
                        </ScrollView>
                    )}

                    {/* Botón de editar */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: colors.primary }]}
                            onPress={handleEdit}
                            disabled={loading}
                        >
                            <Ionicons name="pencil" size={18} color={isDarkMode ? colors.darkText : colors.lightText} style={styles.editIcon} />
                            <Text style={styles.editButtonText}>{t('edit')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 0,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginLeft: 10,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingVertical: 10,
        paddingBottom: 100,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 25,
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    name: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 5,
        textAlign: 'center',
    },
    code: {
        fontSize: 16,
        opacity: 0.8,
    },
    infoSection: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        paddingLeft: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.lightText,
    },
    imageSection: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    imageTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    imageTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.lightText,
        marginLeft: 8,
    },
    imageContainer: {
        width: '100%',
        height: 220,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    documentImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        backgroundColor: 'white',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'transparent',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    editButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    editButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    editIcon: {
        marginRight: 5,
    },
});

export default ViewFreelanceModal;