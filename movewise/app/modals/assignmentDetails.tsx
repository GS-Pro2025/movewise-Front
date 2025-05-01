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
    ScrollView
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Assignment } from "@/components/operator/BaseOperator";
import ToolsManager from "@/components/operator/ToolsList";
import { useTranslation } from "react-i18next";

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

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    useEffect(() => {
        if (assignment) {
            setLoading(false);
        }
    }, [assignment]);

    // Format date for display (MM/DD/YYYY)
    const formatDate = (dateString: string) => {
        if (!dateString) return "No date";

        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
    };

    const handleCompleteWork = () => {
        setActionModalVisible(true);
    };

    const completeWorkAction = () => {
        Alert.alert(t('success'), t('work_marked_as_completed'));
        setActionModalVisible(false);
        onClose();
    };

    const handleOpenToolsList = () => {
        setActionModalVisible(false);
        setToolsModalVisible(true);
    };


    const handleClose = () => {
        setActionModalVisible(false);
        onClose();
    };

    if (loading) {
        return (
            <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
                <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#112A4A' : '#FFF' }]}>
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
                {/* Encabezado */}
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
    
                    <Text style={styles.headerTitle}>{t('assignment_details')}</Text>
    
                    <View style={styles.headerRight} />
                </View>
    
                {/* Contenido */}
                <ScrollView style={styles.content}>
                    {/* Encabezado de la Asignación */}
                    <View style={[
                        styles.cardHeader,
                        { backgroundColor: isDarkMode ? '#1C3A5A' : '#F5F5F5' }
                    ]}>
                        <Text style={[
                            styles.cardTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
                        ]}>
                            {assignment?.data_order.key_ref || t('no_reference')}
                        </Text>
    
                        <View style={[
                            styles.roleBadge,
                            { backgroundColor: isDarkMode ? '#0458AB80' : '#0458AB20' }
                        ]}>
                            <Text style={[
                                styles.roleText,
                                { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
                            ]}>
                                {assignment.rol || t('no_role')}
                            </Text>
                        </View>
                    </View>
    
                    {/* Detalles de la Asignación */}
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
                                {t('date')}:
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
                                {t('location')}:
                            </Text>
                            <Text style={[
                                styles.detailValue,
                                { color: isDarkMode ? '#FFFFFF' : '#333333' }
                            ]}>
                                {assignment?.data_order.state_usa || t('no_location')}
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
                                {t('customer')}:
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
                                {t('email')}:
                            </Text>
                            <Text style={[
                                styles.detailValue,
                                { color: isDarkMode ? '#FFFFFF' : '#333333' }
                            ]}>
                                {assignment?.data_order.person.email || t('no_email')}
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
                                {t('status')}:
                            </Text>
                            <Text style={[
                                styles.detailValue,
                                { color: isDarkMode ? '#FFFFFF' : '#333333' }
                            ]}>
                                {assignment?.data_order.status || t('no_status')}
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
                                    {t('weight')}:
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
                                    {t('distance')}:
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
    
                    {/* Sección de Acciones del Líder */}
                    {assignment?.rol === 'leader' && (
                        <View style={[
                            styles.actionsCard,
                            { backgroundColor: isDarkMode ? '#1C3A5A' : '#F5F5F5' }
                        ]}>
                            <Text style={[
                                styles.actionsTitle,
                                { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
                            ]}>
                                {t('leader_actions')}
                            </Text>
    
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        { backgroundColor: isDarkMode ? '#0458AB' : '#0458AB' }
                                    ]}
                                    onPress={handleCompleteWork}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>{t('complete_work')}</Text>
                                </TouchableOpacity>
    
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        { backgroundColor: isDarkMode ? '#0458AB' : '#0458AB' }
                                    ]}
                                    onPress={handleOpenToolsList}
                                >
                                    <Ionicons name="construct-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>{t('checklist_of_tools')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
    
                    {/* Mensaje para No Líder */}
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
                                {t('operator_message')}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};





const styles = StyleSheet.create({
    // Add these to your styles object
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
        fontSize: 12,
        marginLeft: 8,
    },
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
    // Modal Styles from WorkDailyOperator
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#2A4B8D',
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
        fontSize: 12,
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