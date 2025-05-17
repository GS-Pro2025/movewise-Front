import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    useColorScheme,
    SafeAreaView,
    ScrollView,
    Image
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Platform } from 'react-native';
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Assignment } from "@/components/operator/BaseOperator";
import ToolsManager from "@/components/operator/ToolsList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';
import { useTranslation } from "react-i18next"
import { url } from "@/hooks/api/apiClient";
interface Props {
    visible: boolean;
    onClose: () => void;
    assignment: Assignment;
    operatorId: string;
    type: string;
}

const AssignmentDetails: React.FC<Props> = ({
    visible, onClose, assignment, operatorId, type
}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [toolsModalVisible, setToolsModalVisible] = useState(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const { showActionSheetWithOptions } = useActionSheet();
    const [pickerVisible, setPickerVisible] = useState(false);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    useEffect(() => {
        if (assignment) {
            setLoading(false);
        }
    }, [assignment]);

    const formatDate = (dateString: string) => {
        if (!dateString) return t("no_date");
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    const handleCompleteWork = () => setActionModalVisible(true);

    const handleImageSelection = async (type: 'camera' | 'gallery') => {
        try {
            setPickerVisible(true);
            let result: ImagePicker.ImagePickerResult;

            if (type === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t("permission_required"), t("camera_permission_needed"));
                    return null;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t("permission_denied"), t("allow_photo_access"));
                    return null;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets?.[0]) {
                setSelectedImage(result.assets[0]);
                return result.assets[0];
            }
            return null;
        } catch (error) {
            console.error(t("error_picking_image"), error);
            Alert.alert(t("error"), t("failed_to_select_image"));
            return null;
        } finally {
            setPickerVisible(false);
        }
    };

    const showImagePickerOptions = () => {
        setActionModalVisible(false); // Cerrar modal antes de abrir el selector
        const options = [t('take_photo'), t('choose_from_gallery'), t('cancel')];

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex: 2,
                tintColor: isDarkMode ? '#FFFFFF' : '#0458AB',
            },
            async (buttonIndex) => {
                if (buttonIndex === 0) await handleImageSelection('camera');
                if (buttonIndex === 1) await handleImageSelection('gallery');
                setActionModalVisible(true); // Reabrir modal después de selección
            }
        );
    };

    const completeWorkAction = async () => {
        if (!selectedImage) {
            showImagePickerOptions();
            return;
        }

        if (assignment.data_order.status === 'finished') {
            Toast.show({
                type: 'error',
                text1: t("error"),
                text2: t("order_already_completed"),
                position: 'bottom',
                visibilityTime: 4000,
            });
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('status', 'finished');

            const localUri = selectedImage.uri;
            const filename = localUri.split('/').pop() || 'evidence.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('evidence', {
                uri: localUri,
                name: filename,
                type,
            } as any);

            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error(t("no_auth_token"));

            const response = await fetch(
                `${url}/orders/status/${assignment.data_order.key}/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || t("failed_complete_work"));
            }

            setActionModalVisible(false);
            onClose();

            Toast.show({
                type: 'success',
                text1: t("success"),
                text2: `${t("work_completed_success")}\n${t("order_final_warning")}`,
                position: 'bottom',
                visibilityTime: 5000,
            });

            setSelectedImage(null);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: t("error"),
                text2: error.message || t("failed_complete_work"),
                position: 'bottom',
                visibilityTime: 4000,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleOpenToolsList = () => {
        setActionModalVisible(false);
        setToolsModalVisible(true);
    };

    const handleClose = () => {
        setActionModalVisible(false);
        setToolsModalVisible(false);
        onClose();
    };

    if (loading) {
        return (
            <Modal visible={visible} animationType="slide">
                <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                </SafeAreaView>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={[
                styles.container,
                { backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF' }
            ]}>
                {/* Header */}
                <View style={[
                    styles.header,
                    { backgroundColor: isDarkMode ? '#0A1C30' : '#0458AB' }
                ]}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Assignment Details</Text>

                    <View style={styles.headerRight} />
                </View>

                {/* Content */}
                <ScrollView style={styles.content}>
                    {/* Assignment Header */}
                    <View style={[
                        styles.cardHeader,
                        { backgroundColor: isDarkMode ? '#1C3A5A' : '#F5F5F5' }
                    ]}>
                        <Text style={[
                            styles.cardTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
                        ]}>
                            {assignment?.data_order.key_ref || 'No Reference'}
                        </Text>

                        <View style={[
                            styles.roleBadge,
                            { backgroundColor: isDarkMode ? '#0458AB80' : '#0458AB20' }
                        ]}>
                            <Text style={[
                                styles.roleText,
                                { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
                            ]}>
                                {assignment.rol || 'No Role'}
                            </Text>
                        </View>
                    </View>

                    {/* Assignment Details */}
                    <View style={[
                        styles.card,
                        { backgroundColor: isDarkMode ? '#1C3A5A' : '#F5F5F5' }
                    ]}>
                        <View style={styles.detailRow}>
                            <Ionicons
                                name="calendar-outline"
                                size={18}
                                color={isDarkMode ? '#FFFFFF80' : '#66666680'}
                            />
                            <Text style={[
                                styles.detailLabel,
                                { color: isDarkMode ? '#FFFFFF80' : '#666666' }
                            ]}>
                                Date:
                            </Text>
                            <Text style={[
                                styles.detailValue,
                                { color: isDarkMode ? '#FFFFFF' : '#333333' }
                            ]}>
                                {formatDate(assignment?.data_order.date || '')}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons
                                name="location-outline"
                                size={18}
                                color={isDarkMode ? '#FFFFFF80' : '#66666680'}
                            />
                            <Text style={[
                                styles.detailLabel,
                                { color: isDarkMode ? '#FFFFFF80' : '#666666' }
                            ]}>
                                Location:
                            </Text>
                            <Text style={[
                                styles.detailValue,
                                { color: isDarkMode ? '#FFFFFF' : '#333333' }
                            ]}>
                                {assignment?.data_order.state_usa || 'No location'}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons
                                name="person-outline"
                                size={18}
                                color={isDarkMode ? '#FFFFFF80' : '#66666680'}
                            />
                            <Text style={[
                                styles.detailLabel,
                                { color: isDarkMode ? '#FFFFFF80' : '#666666' }
                            ]}>
                                Customer:
                            </Text>
                            <Text style={[
                                styles.detailValue,
                                { color: isDarkMode ? '#FFFFFF' : '#333333' }
                            ]}>
                                {`${assignment?.data_order.person.first_name} ${assignment?.data_order.person.last_name}`}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons
                                name="mail-outline"
                                size={18}
                                color={isDarkMode ? '#FFFFFF80' : '#66666680'}
                            />
                            <Text style={[
                                styles.detailLabel,
                                { color: isDarkMode ? '#FFFFFF80' : '#666666' }
                            ]}>
                                Email:
                            </Text>
                            <Text style={[
                                styles.detailValue,
                                { color: isDarkMode ? '#FFFFFF' : '#333333' }
                            ]}>
                                {assignment?.data_order.person.email || 'No email'}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons
                                name="briefcase-outline"
                                size={18}
                                color={isDarkMode ? '#FFFFFF80' : '#66666680'}
                            />
                            <Text style={[
                                styles.detailLabel,
                                { color: isDarkMode ? '#FFFFFF80' : '#666666' }
                            ]}>
                                Status:
                            </Text>
                            <Text style={[
                                styles.detailValue,
                                { color: isDarkMode ? '#FFFFFF' : '#333333' }
                            ]}>
                                {assignment?.data_order.status || 'No status'}
                            </Text>
                        </View>

                        {assignment?.data_order.weight && (
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="cube-outline"
                                    size={18}
                                    color={isDarkMode ? '#FFFFFF80' : '#66666680'}
                                />
                                <Text style={[
                                    styles.detailLabel,
                                    { color: isDarkMode ? '#FFFFFF80' : '#666666' }
                                ]}>
                                    Weight:
                                </Text>
                                <Text style={[
                                    styles.detailValue,
                                    { color: isDarkMode ? '#FFFFFF' : '#333333' }
                                ]}>
                                    {assignment?.data_order.weight} kg
                                </Text>
                            </View>
                        )}

                        {assignment?.data_order.distance && (
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="navigate-outline"
                                    size={18}
                                    color={isDarkMode ? '#FFFFFF80' : '#66666680'}
                                />
                                <Text style={[
                                    styles.detailLabel,
                                    { color: isDarkMode ? '#FFFFFF80' : '#666666' }
                                ]}>
                                    Distance:
                                </Text>
                                <Text style={[
                                    styles.detailValue,
                                    { color: isDarkMode ? '#FFFFFF' : '#333333' }
                                ]}>
                                    {assignment?.data_order.distance} km
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Leader Actions Section */}
                    {assignment?.rol === 'leader' && (
                        <View style={[
                            styles.actionsCard,
                            { backgroundColor: isDarkMode ? '#1C3A5A' : '#F5F5F5' }
                        ]}>
                            <Text style={[
                                styles.actionsTitle,
                                { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
                            ]}>
                                Leader Actions
                            </Text>

                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        {
                                            backgroundColor: isDarkMode ? '#0458AB' : '#0458AB',
                                            opacity: assignment.data_order.status === 'finished' ? 0.6 : 1
                                        }
                                    ]}
                                    onPress={assignment.data_order.status === 'finished' ? undefined : handleCompleteWork}
                                    disabled={assignment.data_order.status === 'finished'}
                                >
                                    <Ionicons
                                        name={assignment.data_order.status === 'finished' ? "checkmark-done" : "checkmark-circle-outline"}
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.actionButtonText}>
                                        {assignment.data_order.status === 'finished'
                                            ? t("completed")
                                            : t("complete_work")}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        { backgroundColor: isDarkMode ? '#0458AB' : '#0458AB' }
                                    ]}
                                    onPress={handleOpenToolsList}
                                >
                                    <Ionicons name="construct-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Checklist of Tools</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Non-Leader Message */}
                    {assignment?.rol !== 'leader' && (
                        <View style={[
                            styles.messageCard,
                            { backgroundColor: isDarkMode ? '#1C3A5A' : '#F5F5F5' }
                        ]}>
                            <Ionicons
                                name="information-circle-outline"
                                size={24}
                                color={isDarkMode ? '#FFFFFF80' : '#0458AB'}
                            />
                            <Text style={[
                                styles.messageText,
                                { color: isDarkMode ? '#FFFFFF' : '#666666' }
                            ]}>
                                You are assigned as an operator for this job. Only leaders can assign tools and mark work as complete.
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Action Modal - Similar to the one in WorkDailyOperator */}
                {assignment && (
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={actionModalVisible}
                        onRequestClose={() => setActionModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[
                                styles.modalContainer,
                                { backgroundColor: isDarkMode ? '#1C3A5A' : '#2A4B8D' }
                            ]}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {assignment?.data_order.key_ref} - {assignment?.data_order.person.first_name} {assignment?.data_order.person.last_name}
                                    </Text>
                                    <TouchableOpacity onPress={() => setActionModalVisible(false)} style={styles.modalClose}>
                                        <Ionicons name="close" size={24} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalContent}>
                                    <Text style={styles.modalInfoText}>
                                        Date: {formatDate(assignment?.data_order.date || '')}
                                    </Text>
                                    <Text style={styles.modalInfoText}>
                                        Status: {assignment.data_order.status}
                                    </Text>
                                    <Text style={styles.modalInfoText}>
                                        Role: {assignment.rol === 'leader' ? 'Leader' : 'Operator'}
                                    </Text>

                                    {/* Image Preview */}
                                    {selectedImage && (
                                        <View style={styles.imagePreviewContainer}>
                                            <Image
                                                source={{ uri: selectedImage.uri }}
                                                style={styles.imagePreview}
                                                resizeMode="cover"
                                            />
                                            <TouchableOpacity
                                                style={styles.changeImageButton}
                                                onPress={() => showImagePickerOptions()}>
                                                <Text style={styles.changeImageText}>Change Image</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                {assignment.rol === 'leader' && (
                                    <View style={styles.modalButtonContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.modalButton,
                                                { opacity: uploading ? 0.7 : 1 }
                                            ]}
                                            onPress={completeWorkAction}
                                            disabled={uploading}
                                        >
                                            {uploading ? (
                                                <ActivityIndicator color="#2A4B8D" />
                                            ) : (
                                                <Text style={styles.modalButtonText}>
                                                    {selectedImage ? t("submit_work") : t("select_photo")}
                                                </Text>
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.modalButton}
                                            onPress={handleOpenToolsList}
                                        >
                                            <Text style={styles.modalButtonText}>Checklist of Tools</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {assignment.rol !== 'leader' && (
                                    <View style={styles.modalMessageContainer}>
                                        <Text style={styles.modalMessageText}>
                                            You do not have leader permissions for this assignment
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Tools Assignment Modal */}
                {toolsModalVisible && (
                    <ToolsManager
                        visible={toolsModalVisible}
                        onClose={() => setToolsModalVisible(false)}
                        assignment={assignment}
                        isDarkMode={isDarkMode}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    // General container styles
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#0458AB',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    // Header styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 5,
    },
    headerRight: {
        width: 30, // Same width as close button for balance
    },

    // Content styles
    content: {
        flex: 1,
        padding: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '500',
    },
    card: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 15,
        marginLeft: 8,
        width: 80,
    },
    detailValue: {
        fontSize: 15,
        flex: 1,
    },

    // Actions card styles
    actionsCard: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    actionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        flex: 0.48,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 8,
    },

    // Message card styles
    messageCard: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    messageText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
        flex: 1,
    },
    modalClose: {
        padding: 5,
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    modalInfoText: {
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 8,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    modalButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: '45%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#2A4B8D',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalMessageContainer: {
        padding: 20,
        alignItems: 'center',
    },
    modalMessageText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
    },

    // Image preview styles
    imagePreviewContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    imagePreview: {
        width: 250,
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    changeImageButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    changeImageText: {
        color: '#FFFFFF',
        fontSize: 14,
    },

    // Tools modal styles
    toolsModalInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 5,
    },
    toolsModalSelection: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    toolsModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    toolsModalContainer: {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
    },
    toolsModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    toolsModalTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    toolsModalClose: {
        padding: 4,
    },
    toolsModalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    toolsModalSubtitle: {
        fontSize: 16,
        marginBottom: 20,
        fontWeight: '500',
        paddingLeft: 10,
        paddingTop: 10,
        textAlign: 'center',
    },
    toolsModalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    toolsModalButton: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        minWidth: 120,
        alignItems: 'center',
    },
    toolsModalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#0458AB',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
        color: '#FFFFFF',
    },
});

export default AssignmentDetails;