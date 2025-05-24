//modal para ver, editar y eliminar las asignaciones de un workhouse
import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { GetAssignedOperators } from '@/hooks/api/GetAssignedOperators';
import AssignFreelanceModal from './AssignFreelanceModal';
import { deleteAssign } from '@/hooks/api/DeleteAssign';

interface EditAssignmentsModalProps {
    visible: boolean;
    onClose: () => void;
    workhouseKey: string;
    onRefresh: () => void;
}


const EditAssignmentsModal: React.FC<EditAssignmentsModalProps> = ({ visible, onClose, workhouseKey, onRefresh }) => {
    console.log(`modal de edicion, key: ${workhouseKey}`);
    
    const { t } = useTranslation();
    const [storedKey, setStoredKey] = useState('');
    const initialKeyRef = useRef('');
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => {
        if (visible && workhouseKey && !initialKeyRef.current) {
            initialKeyRef.current = workhouseKey.split('|')[0]; // Extraer key real
            setStoredKey(initialKeyRef.current);
        }
    }, [visible]);


    const handleOpenAssign = () => {
        onClose();
        setTimeout(() => {
            setShowAssignModal(true)
        }, 100);
    }

    useEffect(() => {
        if (storedKey) {
            fetchAssignments();
        }
    }, [visible, workhouseKey]);

    const fetchAssignments = async () => {
        try {
            if (!storedKey) return;

            const data = await GetAssignedOperators(storedKey);
            setAssignments(data);
            setLoading(false)
        } catch (err) {
            setError(t("error_fetching_assignments"));
        }
    };

    const handleDelete = async (assignmentId: number) => {
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
                            onRefresh();
                            fetchAssignments();
                            Alert.alert(t("success"), t("assignment_deleted"));
                        } catch (error) {
                            Alert.alert(t("error"), t("delete_error"));
                        }
                    }
                }
            ]
        );
    };

    return (
        <>
            <SafeAreaView>
                <Modal visible={visible} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={[styles.modalContent, { backgroundColor: colors.lightBackground }]}>
                            <ScrollView contentContainerStyle={styles.scrollContent}>
                                <View style={styles.header}>
                                    <Text style={styles.modalTitle}>{t("assigned_freelancers")}</Text>
                                    <TouchableOpacity style={{ padding: 15 }} onPress={onClose}>
                                        <Ionicons name="close" size={24} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>

                                {loading ? (
                                    <ActivityIndicator size="large" color={colors.primary} />
                                ) : error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : assignments.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="people-outline" size={40} color={colors.primary} />
                                        <Text style={styles.emptyText}>{t("no_assignments")}</Text>
                                    </View>
                                ) : (
                                    assignments.map((assignment) => (
                                        <View key={assignment.id_assign} style={styles.assignmentCard}>
                                            <View style={styles.assignmentHeader}>
                                                <Ionicons name="person-circle" size={24} color={colors.primary} />
                                                <Text style={styles.assignmentName}>
                                                    {assignment.first_name} {assignment.last_name}
                                                </Text>
                                            </View>
                                            <View style={styles.assignmentDetails}>
                                                <Text style={styles.detailText}>
                                                    ID: {assignment.id}
                                                </Text>
                                                <Text style={styles.detailText}>
                                                    {t("assigned_at")}: {new Date(assignment.assigned_at).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleDelete(assignment.id_assign)}
                                            >
                                                <Ionicons name="trash" size={20} color={colors.warning} />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                )}

                                <TouchableOpacity
                                    style={styles.assignButton}
                                    onPress={() => handleOpenAssign()}
                                >
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>{t("assign_new_freelance")}</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                <AssignFreelanceModal
                    visible={showAssignModal}
                    onClose={() => setShowAssignModal(false)}
                    onSuccess={() => {
                        fetchAssignments();
                        onRefresh();
                    }}
                    workhouseKey={storedKey}
                />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        margin: 20,
        borderRadius: 20,
        padding: 24,
        maxHeight: '80%',
        backgroundColor: colors.lightBackground,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textLight,
        marginTop: 10,
        textAlign: 'center',
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
        color: colors.lightText,
    },
    assignmentDetails: {
        marginLeft: 32,
    },
    detailText: {
        fontSize: 14,
        color: colors.darkText,
        marginBottom: 4,
    },
    deleteButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 8,
    },
    assignButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    errorText: {
        color: colors.warning,
        textAlign: 'center',
        marginVertical: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
});

export default EditAssignmentsModal;