import React, { useState, useEffect } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '../Colors';
import { AdminInfo } from '@/hooks/api/GetAdminByToken';
import { deleteAdmin } from '@/hooks/api/deleteAdminAccount';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPersonIdFromToken } from '@/utils/decodeToken';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';


interface InfoAdminModalProps {
    visible: boolean;
    onClose: () => void;
    admin: AdminInfo | null;
    onEdit: () => void;
}


const InfoAdminModal: React.FC<InfoAdminModalProps> = ({ visible, onClose, admin, onEdit }) => {
    // console.log(`se abrio el modal con la info de admin: ${admin}`);
    const { t } = useTranslation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";
    const [photoStatus, setPhotoStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        Alert.alert(
            t('confirm_delete'),
            t('delete_account_confirmation'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel'
                },
                {
                    text: t('delete'),
                    onPress: async () => {
                        try {
                            setIsDeleting(true);
                            const token = await AsyncStorage.getItem('userToken');

                            if (!token) {
                                throw new Error(t('authentication_error'));
                            }

                            const personId = getPersonIdFromToken(token);
                            await deleteAdmin(personId);

                            await AsyncStorage.clear();
                            Toast.show({
                                type: 'success',
                                text1: t('account_deleted'),
                            });

                            router.replace('/Login');
                            onClose();
                        } catch (error) {
                            console.error('Delete error:', error);
                            Toast.show({
                                type: 'error',
                                text1: t('delete_error'),
                                text2: t('try_again_later'),
                            });
                        } finally {
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };
    useEffect(() => {
        const verifyPhoto = async () => {
            console.log(`: ${admin?.photo}`);
            
            if (!admin?.photo) {
                setPhotoStatus('invalid');
                return;
            }

            try {
                const response = await fetch(admin.photo, { method: 'HEAD' });
                
                if (response.ok) {
                    setPhotoStatus('valid');
                } else {
                    setPhotoStatus('invalid');
                }
            } catch (error) {
                setPhotoStatus('invalid');
            }
        };

        verifyPhoto();
    }, [admin?.photo]);

    const backgroundColor = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
    const textColor = isDarkMode ? colors.darkText : colors.lightText;
    const primaryColor = isDarkMode ? colors.darkText : colors.primary;
    const cardBackground = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
    const borderColor = isDarkMode ? colors.borderDark : colors.borderLight;

    const formatDate = (dateString: string) => {
        if (!dateString) return t('not_found');
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const renderInfoItem = (label: string, value: string | number | undefined | null, isLink = false) => (
        <View style={styles.infoItem}>
            <Text style={[styles.label, { color: primaryColor }]}>{label}</Text>
            {isLink && value ? (
                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${value}`)}>
                    <Text style={[styles.linkValue, { color: colors.primary }]}>{value}</Text>
                </TouchableOpacity>
            ) : (
                <Text style={[styles.value, { color: textColor }]}>{value || t('not_found')}</Text>
            )}
        </View>
    );

    // Verificar que tenemos datos válidos antes de renderizar
    if (!admin) {
        return null;
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="arrow-back" size={24} color={primaryColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: primaryColor }]}>{t("admin_info")}</Text>
                    <TouchableOpacity onPress={onEdit}>
                        <Ionicons name="create-outline" size={24} color={primaryColor} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Personal Info Card */}
                    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="person-circle" size={20} color={primaryColor} />
                            <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("personal_info")}</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            {photoStatus === 'loading' && (
                                <ActivityIndicator size="small" color={primaryColor} />
                            )}
                            {photoStatus === 'valid' && admin?.photo && (
                                <Image
                                    source={{ uri: admin.photo }}
                                    style={styles.profileImage}
                                    onError={() => setPhotoStatus('invalid')}
                                />
                            )}
                            {photoStatus === 'invalid' && (
                                <View style={styles.emptyImageContainer}>
                                    <Ionicons name="person-circle-outline" size={50} color={borderColor} />
                                    <Text style={[styles.notFoundText, { color: colors.warning }]}>
                                        {t("image_not_found")}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {renderInfoItem(t("email"), admin?.person?.email, true)}
                        {renderInfoItem(t("first_name"), admin?.person?.first_name)}
                        {renderInfoItem(t("last_name"), admin?.person?.last_name)}
                        {renderInfoItem(t("phone"), admin?.person?.phone)}
                        {renderInfoItem(t("address"), admin?.person?.address)}
                        {renderInfoItem(t("birth_date"), admin?.person?.birth_date ? formatDate(admin.person.birth_date) : null)}
                        {renderInfoItem(t("id_number"), admin?.person?.id_number)}
                        {renderInfoItem(t("id_type"), admin?.person?.type_id)}
                    </View>

                    {/* System Info Card */}
                    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="time" size={20} color={primaryColor} />
                            <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("system_info")}</Text>
                        </View>

                        {renderInfoItem(t("user_name"), admin?.user_name)}
                        {renderInfoItem(t("created_at"), admin?.created_at ? formatDate(admin.created_at) : null)}
                        {renderInfoItem(t("updated_at"), admin?.updated_at ? formatDate(admin.updated_at) : null)}
                        {renderInfoItem(t("company_id"), admin?.person?.id_company)}
                    </View>
                    <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: colors.swipeDelete }]}
                        onPress={handleDeleteAccount}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator color={colors.warning} />
                        ) : (
                            <Text style={styles.deleteButtonText}>
                                <Ionicons name="trash-bin" size={16} color="#fff" /> {t('delete_account')}
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoItem: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
    },
    linkValue: {
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#ccc',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
        height: 120, // Altura fija para evitar cambios de layout
        justifyContent: 'center',
    },
    emptyImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    notFoundText: {
        marginTop: 8,
        fontSize: 14,
        fontStyle: 'italic',
    },
    deleteButton: {
        marginTop: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default InfoAdminModal;