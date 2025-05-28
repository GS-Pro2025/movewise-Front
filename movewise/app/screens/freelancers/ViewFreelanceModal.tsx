import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { GetFreelanceByCode, FreelanceData } from '@/hooks/api/FreelanceClient';

interface ViewFreelanceModalProps {
    visible: boolean;
    freelancer: any;
    onClose: () => void;
    onEdit: () => void;
}

const ViewFreelanceModal: React.FC<ViewFreelanceModalProps> = ({ visible, freelancer, onClose, onEdit }) => {
    const { t } = useTranslation();
    const [freelanceData, setFreelanceData] = useState<Partial<FreelanceData> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && freelancer) {
            loadFreelanceData();
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
        if (!value) return null;

        return (
            <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon as any} size={18} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                </View>
            </View>
        );
    };

    const renderImageSection = (imageUrl: string | undefined, title: string, icon: string) => {
        if (!imageUrl) return null;

        return (
            <View style={styles.imageSection}>
                <View style={styles.imageTitleContainer}>
                    <Ionicons name={icon as any} size={16} color={colors.primary} />
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
            <View style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('freelancer_details')}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.textDark} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                ) : (
                    <ScrollView contentContainerStyle={styles.content}>
                        {renderInfoRow('call', t('phone'), freelanceData?.phone)}
                        {renderInfoRow('mail', t('email'), freelanceData?.email)}
                        {renderInfoRow('location', t('address'), freelanceData?.address)}
                        {renderInfoRow('id-card', t('id_type'), getIdTypeLabel(freelanceData?.type_id || ''))}
                        {renderInfoRow('document', t('id_number'), freelanceData?.id_number)}

                        {/* Campos de licencia */}
                        {renderImageSection(freelanceData?.license_front, t('license_front'), 'document')}
                        {renderImageSection(freelanceData?.license_back, t('license_back'), 'document')}

                        {/* Eliminar las líneas de seguros si no existen en la API */}
                    </ScrollView>
                )}

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEdit}
                    disabled={loading}
                >
                    <Text style={styles.editButtonText}>{t('edit')}</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textDark,
    },
    closeButton: {
        padding: 8,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingBottom: 80,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 10,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.textDark,
    },
    imageSection: {
        marginVertical: 15,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        paddingTop: 15,
    },
    imageTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    imageTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.textDark,
        marginLeft: 8,
    },
    imageContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: colors.lightBackground,
    },
    documentImage: {
        width: '100%',
        height: 200,
    },
    editButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        left: 20,
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        elevation: 2,
    },
    editButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ViewFreelanceModal;