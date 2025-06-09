import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { GetFreelanceByCode, CreateFreelance, FreelanceData } from '@/hooks/api/FreelanceClient';
import { CreateAssignment, AssignmentData } from '@/hooks/api/AssignClient';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import AddWorkhouseForm from './AddWorkhouseForm';

interface AssignFreelanceScreenProps {
    workhouseKey?: string;
}

const AssignFreelanceScreen: React.FC<AssignFreelanceScreenProps> = ({ workhouseKey }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [freelanceCode, setFreelanceCode] = useState('');
    const [freelanceData, setFreelanceData] = useState<any>(null);
    const [showFreelanceForm, setShowFreelanceForm] = useState(false);
    const [additionalCosts, setAdditionalCosts] = useState('');
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>('');
    const scrollViewRef = useRef<ScrollView>(null);
    
    const [newFreelance, setNewFreelance] = useState<Partial<FreelanceData>>({
        status: 'freelance' as const,
        type_id: 'CC' as const,
        salary: 0,
        email: '',
        first_name: '',
        last_name: '',
        id_number: ''
    });

    interface FreelanceImages {
        photo?: string;
        license_front?: string;
        license_back?: string;
    }

    const [freelanceImages, setFreelanceImages] = useState<FreelanceImages>({});

    const handleSearchFreelance = async () => {
        if (!freelanceCode.trim()) {
            setSearchError(t("enter_freelance_code"));
            return;
        }

        setSearchLoading(true);
        setSearchError(null);
        setFreelanceData(null);

        try {
            const response = await GetFreelanceByCode(freelanceCode);
            if (response?.data) {
                setFreelanceData(response.data);
                setSearchError(null);
            } else {
                setSearchError(t("freelance_not_found"));
            }
        } catch (error) {
            setSearchError(t("error_searching_freelance"));
        } finally {
            setSearchLoading(false);
        }
    };

    const handleCreateAssignment = async () => {
        if (!freelanceData) {
            Alert.alert(t("error"), t("select_freelance_first"));
            return;
        }

        setAssignmentLoading(true);
        try {
            const response = await CreateAssignment({
                workhouse_key: workhouseKey,
                operator: freelanceData.id_operator,
                order: freelanceData.code,
                rol: 'freelance',
                additional_costs: additionalCosts
            });

            if (response?.data) {
                Alert.alert(t("success"), t("assignment_created"));
                router.back();
            }
        } catch (error) {
            Alert.alert(t("error"), t("error_creating_assignment"));
        } finally {
            setAssignmentLoading(false);
        }
    };

    const handleCreateNewFreelance = async () => {
        if (!newFreelance.first_name || !newFreelance.email) {
            Alert.alert(t("error"), t("fill_required_fields"));
            return;
        }

        try {
            const formData = new FormData();
            
            // Agregar campos de texto
            Object.entries(newFreelance).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });
            
            // Agregar imágenes
            Object.entries(freelanceImages).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            const response = await CreateFreelance(formData);

            if (response?.data) {
                setFreelanceData(response.data);
                setShowFreelanceForm(false);
                setNewFreelance({
                    status: 'freelance',
                    type_id: 'CC'
                });
                setFreelanceImages({});
            }
        } catch (error) {
            Alert.alert(t("error"), t("error_creating_freelance"));
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView ref={scrollViewRef} style={styles.scrollView}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t("assign_freelance")}</Text>
                </View>

                <View style={styles.content}>
                    <TextInput
                        style={styles.input}
                        placeholder={t("freelance_code")}
                        value={freelanceCode}
                        onChangeText={setFreelanceCode}
                    />

                    {searchError && (
                        <Text style={styles.error}>{searchError}</Text>
                    )}

                    <TouchableOpacity
                        style={[styles.button, searchLoading && styles.buttonDisabled]}
                        onPress={handleSearchFreelance}
                        disabled={searchLoading}
                    >
                        {searchLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>{t("search")}</Text>
                        )}
                    </TouchableOpacity>

                    {freelanceData && (
                        <View style={styles.freelanceInfo}>
                            <Text style={styles.freelanceName}>{freelanceData.name}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t("additional_costs")}
                                value={additionalCosts}
                                onChangeText={setAdditionalCosts}
                            />
                            
                            <TouchableOpacity
                                style={[styles.button, assignmentLoading && styles.buttonDisabled]}
                                onPress={handleCreateAssignment}
                                disabled={assignmentLoading}
                            >
                                {assignmentLoading ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <Text style={styles.buttonText}>{t("assign")}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {!freelanceData && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setShowFreelanceForm(true)}
                        >
                            <Text style={styles.buttonText}>{t("create_new_freelance")}</Text>
                        </TouchableOpacity>
                    )}

                    {showFreelanceForm && (
                        <AddWorkhouseForm
                            visible={showFreelanceForm}
                            onClose={() => {
                                setShowFreelanceForm(false);
                                setNewFreelance({
                                    status: 'freelance' as const,
                                    type_id: 'CC' as const,
                                    salary: 0,
                                    email: '',
                                    first_name: '',
                                    last_name: '',
                                    id_number: ''
                                });
                                setFreelanceImages({});
                            }}
                            onSuccess={handleCreateNewFreelance}
                            data={newFreelance}
                            images={freelanceImages}
                            onImageChange={(images) => setFreelanceImages(images)}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightBackground,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightBackground,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    content: {
        padding: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.lightBackground,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    error: {
        color: colors.warning,
        marginBottom: 16,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: colors.neutralGray,
    },
    buttonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    freelanceInfo: {
        marginBottom: 16,
    },
    freelanceName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
});

export default AssignFreelanceScreen;
