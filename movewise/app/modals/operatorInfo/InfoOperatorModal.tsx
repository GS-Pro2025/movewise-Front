import React, { useEffect, useState } from 'react';
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
import { Image, ActivityIndicator } from 'react-native';
import colors from '@/app/Colors';
const colorScheme = useColorScheme();
const isDarkMode = colorScheme === 'dark';


interface Son {
    name: string;
    birth_date: string;
    gender: string;
}

interface OperatorInfo {
    id_operator: number;
    number_licence: string;
    photo: string | null;
    license_front: string | null;
    license_back: string | null;
    code: string;
    n_children: number;
    size_t_shift: string;
    name_t_shift: string;
    salary: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    type_id: string;
    id_number: string;
    address: string;
    phone: string;
    email: string;
    id_company: number;
    sons: Son[];
}

interface InfoOperatorModalProps {
    visible: boolean;
    onClose: () => void;
    operator: OperatorInfo | null;
    onEdit: () => void;
}

const InfoOperatorModal: React.FC<InfoOperatorModalProps> = ({ visible, onClose, operator, onEdit }) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";

    const backgroundColor = isDarkMode ? colors.darkBackground : colors.lightBackground;
    const textColor = isDarkMode ? colors.darkText : colors.lightText;
    const primaryColor = isDarkMode ? colors.darkText : colors.primary;
    const cardBackground = isDarkMode ? '#2A2A2A' : '#ffffff';
    const borderColor = isDarkMode ? '#444444' : '#e0e0e0';
    const [imageStatus, setImageStatus] = useState<{
        photo: 'loading' | 'valid' | 'invalid';
        licenseFront: 'loading' | 'valid' | 'invalid';
        licenseBack: 'loading' | 'valid' | 'invalid';
    }>({ photo: 'loading', licenseFront: 'loading', licenseBack: 'loading' });


    useEffect(() => {
        const verifyImages = async () => {
            if (!operator) return;
            
            console.log('Verificando imágenes para operador:', operator.id_operator);
            console.log('URL de foto:', operator.photo);
            
            const checkImage = async (url: string | null): Promise<'valid' | 'invalid'> => {
                if (!url) {
                    console.log('URL vacía o null');
                    return 'invalid';
                }
                try {
                    console.log('Verificando URL:', url);
                    const response = await fetch(url, { method: 'HEAD' });
                    const status = response.ok ? 'valid' : 'invalid';
                    console.log('Status de imagen:', url, status);
                    return status;
                } catch (error) {
                    console.log('Error verificando imagen:', error);
                    return 'invalid';
                }
            };

            // Reset to loading state first
            setImageStatus({
                photo: 'loading',
                licenseFront: 'loading', 
                licenseBack: 'loading'
            });

            const [photoStatus, licenseFrontStatus, licenseBackStatus] = await Promise.all([
                checkImage(operator.photo),
                checkImage(operator.license_front),
                checkImage(operator.license_back)
            ]);

            console.log('Estados finales:', { photoStatus, licenseFrontStatus, licenseBackStatus });

            setImageStatus({
                photo: photoStatus,
                licenseFront: licenseFrontStatus,
                licenseBack: licenseBackStatus
            });
        };

        verifyImages();
    }, [operator]);

    const formatDate = (dateString: string) => {
        if (!dateString) return t('not_found');
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderPhotoSection = () => (
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.cardHeader}>
                <Ionicons name="camera" size={20} color={primaryColor} />
                <Text style={[styles.cardTitle, { color: primaryColor }]}>
                    {t("operator_photo")}
                </Text>
            </View>

            <View style={styles.photoContainer}>
                {imageStatus.photo === 'loading' && (
                    <ActivityIndicator size="large" color={primaryColor} />
                )}

                {imageStatus.photo === 'valid' && operator?.photo && (
                    <Image
                        source={{ uri: operator.photo }}
                        style={styles.operatorPhoto}
                        resizeMode="cover"
                    />
                )}

                {imageStatus.photo === 'invalid' && (
                    <Ionicons
                        name="person-circle-outline"
                        size={100}
                        color={borderColor}
                    />
                )}
            </View>
        </View>
    );

    const renderLicenseSection = () => (
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.cardHeader}>
                <Ionicons name="card" size={20} color={primaryColor} />
                <Text style={[styles.cardTitle, { color: primaryColor }]}>
                    {t("license_images") || "License Images"}
                </Text>
            </View>

            {/* License Front */}
            <View style={styles.licenseImageSection}>
                <Text style={[styles.licenseLabel, { color: primaryColor }]}>
                    {t("license_front") || "License Front"}
                </Text>
                <View style={styles.licenseImageContainer}>
                    {imageStatus.licenseFront === 'loading' && (
                        <ActivityIndicator size="large" color={primaryColor} />
                    )}

                    {imageStatus.licenseFront === 'valid' && operator?.license_front && (
                        <Image
                            source={{ uri: operator.license_front }}
                            style={styles.licenseImage}
                            resizeMode="contain"
                        />
                    )}

                    {imageStatus.licenseFront === 'invalid' && (
                        <View style={[styles.placeholderContainer, { borderColor }]}>
                            <Ionicons
                                name="document-outline"
                                size={40}
                                color={borderColor}
                            />
                            <Text style={[styles.placeholderText, { color: borderColor }]}>
                                {t("no_image_available") || "No image available"}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* License Back */}
            <View style={styles.licenseImageSection}>
                <Text style={[styles.licenseLabel, { color: primaryColor }]}>
                    {t("license_back") || "License Back"}
                </Text>
                <View style={styles.licenseImageContainer}>
                    {imageStatus.licenseBack === 'loading' && (
                        <ActivityIndicator size="large" color={primaryColor} />
                    )}

                    {imageStatus.licenseBack === 'valid' && operator?.license_back && (
                        <Image
                            source={{ uri: operator.license_back }}
                            style={styles.licenseImage}
                            resizeMode="contain"
                        />
                    )}

                    {imageStatus.licenseBack === 'invalid' && (
                        <View style={[styles.placeholderContainer, { borderColor }]}>
                            <Ionicons
                                name="document-outline"
                                size={40}
                                color={borderColor}
                            />
                            <Text style={[styles.placeholderText, { color: borderColor }]}>
                                {t("no_image_available") || "No image available"}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

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

    if (!operator) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="arrow-back" size={24} color={primaryColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: primaryColor }]}>{t("operator_info")}</Text>
                    <TouchableOpacity onPress={onEdit}>
                        <Ionicons name="create-outline" size={24} color={primaryColor} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Personal Info */}
                    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="person-circle" size={20} color={primaryColor} />
                            <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("personal_info")}</Text>
                        </View>

                        {renderInfoItem(t("name"), `${operator.first_name} ${operator.last_name}`)}
                        {renderInfoItem(t("email"), operator.email, true)}
                        {renderInfoItem(t("phone"), operator.phone)}
                        {renderInfoItem(t("address"), operator.address)}
                        {renderInfoItem(t("birth_date"), formatDate(operator.birth_date))}
                        {renderInfoItem(t("id_number"), operator.id_number)}
                        {renderInfoItem(t("id_type"), operator.type_id)}
                    </View>

                    {/* Work Info */}
                    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="briefcase" size={20} color={primaryColor} />
                            <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("work_info")}</Text>
                        </View>

                        {renderInfoItem(t("license_number"), operator.number_licence)}
                        {renderInfoItem(t("employee_code"), operator.code)}
                        {renderInfoItem(t("shift_size"), operator.size_t_shift)}
                        {renderInfoItem(t("shift_name"), operator.name_t_shift)}
                        {renderInfoItem(t("salary"), `$${operator.salary}`)}
                    </View>

                    {/* Children Info */}
                    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="people" size={20} color={primaryColor} />
                            <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("children_info")}</Text>
                        </View>

                        {operator.sons.map((son, index) => (
                            <View key={index} style={styles.childItem}>
                                <Text style={[styles.value, { color: textColor }]}>{son.name}</Text>
                                <Text style={[styles.value, { color: textColor }]}>
                                    {formatDate(son.birth_date)} ({son.gender})
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Photo Section */}
                    {renderPhotoSection()}

                    {/* License Images Section */}
                    {renderLicenseSection()}
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
    childItem: {
        flex: 1
    },
    photoContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    operatorPhoto: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    licenseImageSection: {
        marginBottom: 20,
    },
    licenseLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    licenseImageContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        overflow: 'hidden',
    },
    licenseImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 8,
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    photoUploadButton: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 20,
    },
    photoPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 75,
    },
});

export default InfoOperatorModal;