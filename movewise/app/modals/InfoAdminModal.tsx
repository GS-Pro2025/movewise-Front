import React from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '../Colors';
import { AdminInfo } from '@/hooks/api/GetAdminByToken';

interface InfoAdminModalProps {
    visible: boolean;
    onClose: () => void;
    admin: AdminInfo | null;
    onEdit: () => void;
}

const InfoAdminModal: React.FC<InfoAdminModalProps> = ({ visible, onClose, admin, onEdit }) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";
    
    console.log('Datos recibidos en modal:', JSON.stringify(admin, null, 2));
    
    const backgroundColor = isDarkMode ? colors.darkBackground : colors.lightBackground;
    const textColor = isDarkMode ? colors.darkText : colors.lightText;
    const primaryColor = isDarkMode ? colors.darkText : colors.primary;
    const cardBackground = isDarkMode ? '#2A2A2A' : '#ffffff';
    const borderColor = isDarkMode ? '#444444' : '#e0e0e0';

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
});

export default InfoAdminModal;