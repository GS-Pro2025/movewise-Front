import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    useColorScheme,
    ScrollView,
    Dimensions,
    Image,
    Platform,
    ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";1
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import InfoOperatorModal from "./screens/operators/InfoOperatorModal";
import EditOperatorModal from "./screens/operators/EditOperatorModal";
import colors from "./Colors";
import Ionicons from 'react-native-vector-icons/Ionicons';

// Importar las vistas existentes
import OrderOperatorModal from '@/app/modals/operators/OrderOperatorModal';
import OperatorView from '@/app/screens/operators/OperatorView';

// Tipos para las props de OperatorView
interface OperatorViewProps {
    params: {
        type: string;
        operatorId: string;
    };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Son {
    name: string;
    birth_date: string;
    gender: "M" | "F" | string;
}

interface Operator {
    id_operator: number;
    number_licence: string;
    code: string;
    n_children: number;
    size_t_shift: string;
    name_t_shift: string;
    salary: string;
    photo: string | null;
    license_front: string | null;
    license_back: string | null;
    status: string;
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

interface TabItem {
    id: string;
    title: string;
    icon: string;
    component: React.ComponentType<any>;
}

const Home: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const theme = useColorScheme();
    const isDarkMode = theme === "dark";
    const scrollViewRef = useRef<ScrollView>(null);

    const [activeTab, setActiveTab] = useState(0);
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [operator, setOperator] = useState<Operator | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOperator = async () => {
            try {
                const operatorData = await AsyncStorage.getItem("currentUser");
                if (operatorData) {
                    const parsedData = JSON.parse(operatorData);
                    setOperator(parsedData);
                }
            } catch (error) {
                console.error("Error loading operator:", error);
                Toast.show({ type: "error", text1: t("load_error") });
            } finally {
                setLoading(false);
            }
        };
        loadOperator();
    }, []);

    const handleUpdate = async (updatedOperator: Operator) => {
        setOperator(updatedOperator);
        await AsyncStorage.setItem("currentUser", JSON.stringify(updatedOperator));
        Toast.show({ type: "success", text1: t("profile_updated") });
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            Toast.show({
                type: "success",
                text1: t("logout_success"),
            });
            router.replace("/Login");
        } catch (error) {
            Toast.show({
                type: "error",
                text1: t("logout_error"),
            });
        }
    };

    // Componente de carga
    const LoadingIndicator = () => (
        <View style={styles.placeholderContainer}>
            <ActivityIndicator size="large" color={isDarkMode ? colors.secondary : colors.primary} />
            <Text style={[styles.placeholderText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                {t("loading")}...
            </Text>
        </View>
    );

    // Componente para la vista de Work Daily
    const WorkDailyView = () => {
        if (!operator?.id_operator) {
            return <LoadingIndicator />;
        }

        return (
            <View style={styles.tabContent}>
                <OperatorView
                    params={{
                        type: "work",
                        operatorId: operator.id_operator.toString()
                    }}
                />
            </View>
        );
    };

    // Componente para la vista de Truck Daily
    const TruckDailyView = () => {
        if (!operator?.id_operator) {
            return <LoadingIndicator />;
        }

        return (
            <View style={styles.tabContent}>
                <OperatorView
                    params={{
                        type: "truck",
                        operatorId: operator.id_operator.toString()
                    }}
                />
            </View>
        );
    };

    // Componente para la vista de Orders
    const OrdersView = () => (
        <View style={styles.tabContent}>
            <OrderOperatorModal/>
        </View>
    );

    // Componente para la vista de History
    const HistoryView = () => (
        <View style={styles.tabContent}>
            <View style={styles.placeholderContainer}>
                <Ionicons
                    name="time-outline"
                    size={60}
                    color={isDarkMode ? colors.darkText : colors.primary}
                />
                <Text style={[styles.placeholderText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
                    {t("operator_work_history")}
                </Text>
                <Text style={[styles.placeholderSubtext, { color: isDarkMode ? colors.placeholderDark : colors.placeholderLight }]}>
                    {t("coming_soon")}
                </Text>
            </View>
        </View>
    );

    const tabs: TabItem[] = [
        {
            id: 'orders',
            title: t("orders"),
            icon: 'cube-outline',
            component: OrdersView
        },
        {
            id: 'work',
            title: t("work_daily"),
            icon: 'briefcase-outline',
            component: WorkDailyView
        },
        {
            id: 'truck',
            title: t("truck_daily"),
            icon: 'car-outline',
            component: TruckDailyView
        },
        {
            id: 'history',
            title: t("history"),
            icon: 'time-outline',
            component: HistoryView
        }
    ];

    const handleTabPress = (index: number) => {
        setActiveTab(index);
        scrollViewRef.current?.scrollTo({
            x: index * screenWidth,
            animated: true
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
                <LoadingIndicator />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}
        >
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={[styles.header, {
                backgroundColor: isDarkMode ? colors.third : colors.lightBackground,
                paddingTop: Platform.OS === 'ios' ? 40 : 20
            }]}>
                <TouchableOpacity
                    onPress={() => setIsInfoModalVisible(true)}
                    style={styles.avatarContainer}
                >
                    {operator?.photo ? (
                        <Image
                            source={{ uri: operator.photo }}
                            style={[styles.avatarImage, isDarkMode && styles.darkBorder]}
                            onError={() => console.log("Error cargando foto del operador")}
                        />
                    ) : (
                        <Ionicons
                            name="person-circle-outline"
                            size={40}
                            color={isDarkMode ? colors.darkText : colors.primary}
                        />
                    )}
                </TouchableOpacity>

                <View style={styles.userTextContainer}>
                    <Text style={[styles.userName, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
                        {operator?.first_name} {operator?.last_name}
                    </Text>
                    <Text style={[styles.userId, { color: isDarkMode ? "#CCCCCC" : "#888888" }]}>
                        {operator?.code || t("no_code_available")}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={28}
                        color={isDarkMode ? colors.darkText : colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* Contenido principal */}
            <View style={styles.contentContainer}>
                {tabs.map((tab, index) => {
                    const TabComponent = tab.component;
                    return (
                        <View
                            key={tab.id}
                            style={[
                                styles.tabPage,
                                {
                                    display: activeTab === index ? 'flex' : 'none',
                                    width: screenWidth
                                }
                            ]}
                        >
                            <TabComponent />
                        </View>
                    );
                })}
            </View>

            {/* Bottom Tab Bar con indicador de tab activo */}
            <View style={[styles.tabBar, {
                backgroundColor: isDarkMode ? colors.third : colors.lightBackground,
                height: 70,
                paddingBottom: Platform.OS === 'ios' ? 20 : 10
            }]}>
                {tabs.map((tab, index) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tabItem,
                            activeTab === index && styles.activeTabItem
                        ]}
                        onPress={() => handleTabPress(index)}
                    >
                        <View style={styles.tabIconContainer}>
                            <Ionicons
                                name={tab.icon as any}
                                size={24}
                                color={
                                    activeTab === index
                                        ? colors.secondary
                                        : (isDarkMode ? colors.placeholderDark : colors.placeholderLight)
                                }
                            />
                            {/* Indicador de tab activo */}
                            {activeTab === index && (
                                <View style={[styles.activeIndicator, {
                                    backgroundColor: colors.secondary
                                }]} />
                            )}
                        </View>
                        <Text
                            style={[
                                styles.tabText,
                                {
                                    color: activeTab === index
                                        ? colors.secondary
                                        : (isDarkMode ? colors.placeholderDark : colors.placeholderLight)
                                }
                            ]}
                        >
                            {tab.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Modales */}
            {operator && (
                <>
                    <InfoOperatorModal
                        visible={isInfoModalVisible}
                        onClose={() => setIsInfoModalVisible(false)}
                        operator={operator}
                        onEdit={() => {
                            setIsInfoModalVisible(false);
                            setIsEditModalVisible(true);
                        }}
                    />

                    <EditOperatorModal
                        visible={isEditModalVisible}
                        onClose={() => setIsEditModalVisible(false)}
                        operator={operator}
                        onUpdate={handleUpdate}
                    />
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    darkBackground: {
        backgroundColor: "#112A4A"
    },
    lightBackground: {
        backgroundColor: "#FFF"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 15,
        backgroundColor: '#0458AB',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: '#F0F0F0'
    },
    userTextContainer: {
        flex: 1,
        marginLeft: 15
    },
    userName: {
        fontSize: 18,
        fontWeight: "bold",
        color: '#FFF'
    },
    userId: {
        fontSize: 12,
        marginTop: 2,
        color: '#E0E0E0'
    },
    logoutButton: {
        padding: 6,
        borderRadius: 4,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFF'
    },
    darkBorder: {
        borderColor: "#333333",
    },
    contentContainer: {
        flex: 1,
    },
    tabPage: {
        flex: 1,
        width: '100%'
    },
    tabContent: {
        flex: 1,
        padding: 0
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    placeholderText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center'
    },
    placeholderSubtext: {
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center'
    },
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 8,
        paddingHorizontal: 5
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4
    },
    tabIconContainer: {
        position: 'relative',
        marginBottom: 4
    },
    activeTabItem: {
        // Estilo adicional si es necesario
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -6,
        left: '50%',
        marginLeft: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    tabText: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500'
    }
});

export default Home;