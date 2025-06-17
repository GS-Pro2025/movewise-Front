import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, useColorScheme, StyleSheet, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import colors from '@/app/Colors';
import { useTranslation } from 'react-i18next';
import { GetFreelancers } from '@/hooks/api/GetFreelancers';
import { SoftDeleteOperator } from '@/hooks/api/SoftDeleteOperator';
import CreateFreelanceModal from '../workhouse/CreateFreelanceModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import EditFreelanceModal from './EditFreelanceModal';
import ViewFreelanceModal from './ViewFreelanceModal';
import Colors from '@/app/Colors';
const FreelanceListScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const loadFreelancers = async () => {
        try {
            setRefreshing(true);
            const data = await GetFreelancers();
            setFreelancers(data.results || []);
        } catch (error) {
            setLoadError(true);
            // Alert.alert(t("error"), t("error_loading_freelancers"));
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadFreelancers();
    }, []);

    const handleDelete = async (operator_id: number) => {
        Alert.alert(
            t("confirm_delete"),
            t("delete_freelance_warning"),
            [
                { text: t("cancel") },
                {
                    text: t("delete"),
                    onPress: async () => {
                        try {
                            await SoftDeleteOperator(operator_id);
                            loadFreelancers();
                        } catch (error) {
                            Alert.alert(t("error"), t("delete_error"));
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (freelancer: any) => {
        setSelectedFreelancer(freelancer);
        setShowEditModal(true);
    };

    const handleView = (freelancer: any) => {
        setSelectedFreelancer(freelancer);
        setShowViewModal(true);
    };

    const renderRightActions = (operator_id: number) => (
        <View style={styles.swipeActions}>
            <TouchableOpacity
                style={[styles.swipeButton, styles.deleteButton]}
                onPress={() => handleDelete(operator_id)}
            >
                <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );

    const renderLeftActions = (freelancer: any) => (
        <View style={styles.swipeActions}>
            <TouchableOpacity
                style={[styles.swipeButton, styles.editButton]}
                onPress={() => handleEdit(freelancer)}
            >
                <Ionicons name="pencil" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );

    const filteredFreelancers = freelancers.filter(freelancer =>
        `${freelancer.first_name} ${freelancer.last_name} ${freelancer.code}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                {/* Header mejorado */}
                <View style={[styles.header, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                    {/* <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={isDarkMode ? colors.darkText : colors.primary} />
                    </TouchableOpacity> */}
                    <Text style={[styles.title, { color: isDarkMode ? colors.darkText : colors.primary }]}>{t("freelancers")}</Text>
                    <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
                        <Ionicons name="add" size={28} color={isDarkMode ? colors.darkText : colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                    <View style={[styles.searchInputContainer, { backgroundColor: isDarkMode ? colors.third : '#f5f5f5', borderColor: isDarkMode ? colors.darkText : '#ddd' }]}>
                        <Ionicons name="search-outline" size={20} color={isDarkMode ? colors.darkText : colors.primary} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: isDarkMode ? colors.darkText : colors.primary }]}
                            placeholder={t("search_freelancers")}
                            placeholderTextColor={isDarkMode ? colors.darkText : colors.primary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color={isDarkMode ? colors.darkText : '#666'} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Listado */}
                <FlatList
                    data={filteredFreelancers}
                    keyExtractor={(item) => item.id_operator.toString()}
                    refreshing={refreshing}
                    onRefresh={loadFreelancers}
                    ListEmptyComponent={() => (
                        <View style={[styles.emptyContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                            <Ionicons
                                name="people-outline"
                                size={60}
                                color={colors.placeholderLight}
                                style={styles.emptyIcon}
                            />
                            {loadError && (
                                <Text style={[styles.emptyText, { color: isDarkMode ? colors.darkText : colors.primary }]}>

                                    {searchQuery
                                        ? t("no_results_found")
                                        : t("no_freelancers_available")
                                    }

                                </Text>
                            )}
                            {!searchQuery && (
                                <Text style={[styles.emptySubText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                    {t("add_new_freelancer_prompt")}
                                </Text>
                            )}
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <Swipeable
                            friction={2}
                            rightThreshold={40}
                            containerStyle={[styles.swipeContainer, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                            renderRightActions={() => renderRightActions(item.id_operator)}
                            renderLeftActions={() => renderLeftActions(item)}
                        >
                            <TouchableOpacity
                                style={[styles.freelanceCard, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}
                                onPress={() => handleView(item)}
                            >
                                <View style={[styles.operatorInfo, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                    <Text style={[styles.operatorName, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                                        {item.first_name} {item.last_name}
                                    </Text>
                                    <Text style={[styles.operatorCode, { color: isDarkMode ? colors.darkText : colors.primary }]}>{item.code}</Text>
                                </View>
                                <View style={[styles.details, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
                                    <Text style={[styles.salary, { color: isDarkMode ? colors.darkText : colors.primary }]}>${item.salary}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                                    ]}>
                                        <Text style={[styles.statusText, { color: isDarkMode ? colors.darkText : colors.primary }]}>{item.status === 'active' ? t("operator") : item.status}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Swipeable>
                    )}
                />

                {/* Modal de creación */}
                <CreateFreelanceModal
                    visible={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={loadFreelancers}
                    isFromFreelance={false}
                    workHouseKey={null}
                />

                {/* Modal de edición */}
                <EditFreelanceModal
                    visible={showEditModal}
                    freelancer={selectedFreelancer}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedFreelancer(null);
                    }}
                    onSuccess={loadFreelancers}
                />

                {/* Modal de visualización */}
                <ViewFreelanceModal
                    visible={showViewModal}
                    freelancer={selectedFreelancer}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedFreelancer(null);
                    }}
                    onEdit={() => {
                        setShowViewModal(false);
                        setShowEditModal(true);
                    }}
                />
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    addButton: {
        backgroundColor: '#3498db',
        borderRadius: 30,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    swipeActions: {
        flexDirection: 'row',
        width: 160,  // Ancho para ambos botones
        height: '100%',
    },
    deleteButton: {
        backgroundColor: colors.swipeDelete,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        marginLeft: 'auto',  // Empuja el botón de eliminar a la derecha
    },
    editButton: {
        backgroundColor: colors.swipeEdit,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        marginRight: 'auto',  // Empuja el botón de editar a la izquierda
    },
    swipeContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },

    swipeButton: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0, // Eliminar bordes redondeados
    },
    container: {
        flex: 1,
        backgroundColor: colors.lightBackground,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 10,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    searchContainer: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInputContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: 40,
    },
    clearButton: {
        padding: 5,
    },
    freelanceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    operatorInfo: {
        flex: 1,
    },
    operatorName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textLight,
    },
    operatorCode: {
        fontSize: 14,
        color: colors.neutralGray,
    },
    details: {
        alignItems: 'flex-end',
    },
    salary: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    activeBadge: {
        backgroundColor: '#e8f5e8',
    },
    inactiveBadge: {
        backgroundColor: '#ffebee',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.blackText,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        opacity: 0.5,
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 18,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 5,
    },
    emptySubText: {
        fontSize: 14,
        color: colors.placeholderLight,
        textAlign: 'center',
    },
});

export default FreelanceListScreen;