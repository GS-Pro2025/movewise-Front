import React, { useState, useEffect, useRef, useCallback } from "react";
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
    ActivityIndicator,
    Modal,
    Animated
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import InfoOperatorModal from "./screens/operators/InfoOperatorModal";
import EditOperatorModal from "./screens/operators/EditOperatorModal";
import colors from "./Colors";  
import Ionicons from 'react-native-vector-icons/Ionicons';
import AddOrderForm from "./screens/orders/AddOrderForm";
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
    const menuRef = useRef<View>(null);

    const [activeTab, setActiveTab] = useState(0);
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
    const [operator, setOperator] = useState<Operator | null>(null);
    const [loading, setLoading] = useState(true);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

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

    // Memorizar los componentes para evitar re-renders innecesarios
    const WorkDailyView = useCallback(() => {
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
    }, [operator?.id_operator]);

    const TruckDailyView = useCallback(() => {
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
    }, [operator?.id_operator]);

    const OrdersView = useCallback(() => (
        <View style={styles.tabContent}>
            <OrderOperatorModal/>
        </View>
    ), []);

    const AddOrderView = useCallback(() => (
        <View style={styles.tabContent}>
            <AddOrderForm />
        </View>
    ), []);

    const HistoryView = useCallback(() => (
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
    ), [isDarkMode, t]);

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
        },
        {
            id: 'add-order',
            title: t("add_order") || "Add Order",
            icon: 'add-circle-outline',
            component: AddOrderView
        }
    ];

    const MAX_VISIBLE_TABS = 4;
    const visibleTabs = tabs.slice(0, MAX_VISIBLE_TABS - 1);
    const hiddenTabs = tabs.slice(MAX_VISIBLE_TABS - 1);
    const hasMoreTabs = tabs.length > MAX_VISIBLE_TABS;

    const handleTabPress = useCallback((index: number) => {
        setActiveTab(index);
        closeMoreMenu(); // Cerrar el menú al cambiar de tab
        scrollViewRef.current?.scrollTo({
            x: index * screenWidth,
            animated: true
        });
    }, [screenWidth]);

    const closeMoreMenu = useCallback(() => {
        if (!isMoreMenuVisible) return;
        
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => setIsMoreMenuVisible(false));
    }, [isMoreMenuVisible, slideAnim, opacityAnim]);

    const openMoreMenu = useCallback(() => {
        setIsMoreMenuVisible(true);
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    }, [slideAnim, opacityAnim]);

    const toggleMoreMenu = useCallback((e?: any) => {
        // Prevent event propagation
        e?.stopPropagation?.();
        e?.preventDefault?.();
        
        if (isMoreMenuVisible) {
            closeMoreMenu();
        } else {
            openMoreMenu();
        }
    }, [isMoreMenuVisible, closeMoreMenu, openMoreMenu]);

    // Handle clicks outside the menu to close it
    const handleContainerPress = useCallback((e: any) => {
        if (isMoreMenuVisible) {
            closeMoreMenu();
        }
    }, [isMoreMenuVisible, closeMoreMenu]);

    const renderMoreMenu = () => (
        isMoreMenuVisible && (
            <Animated.View 
                ref={menuRef}
                style={[
                    styles.moreMenuBubble,
                    {
                        backgroundColor: isDarkMode ? colors.third : colors.lightBackground,
                        opacity: opacityAnim,
                        transform: [
                            {
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0],
                                })
                            },
                            {
                                scale: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                })
                            }
                        ]
                    }
                ]}
            >
                {/* Flecha apuntando hacia abajo */}
                <View style={[
                    styles.bubbleArrow,
                    { borderTopColor: isDarkMode ? colors.third : colors.lightBackground }
                ]} />
                
                {hiddenTabs.map((tab, index) => {
                    const tabIndex = MAX_VISIBLE_TABS - 1 + index;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.bubbleMenuItem,
                                activeTab === tabIndex && styles.activeBubbleMenuItem,
                                index === hiddenTabs.length - 1 && styles.lastBubbleMenuItem
                            ]}
                            onPress={() => handleTabPress(tabIndex)}
                        >
                            <View style={styles.bubbleItemContent}>
                                <Ionicons
                                    name={tab.icon as any}
                                    size={20}
                                    color={
                                        activeTab === tabIndex
                                            ? colors.secondary
                                            : (isDarkMode ? colors.darkText : colors.primary)
                                    }
                                />
                                <Text
                                    style={[
                                        styles.bubbleMenuText,
                                        {
                                            color: activeTab === tabIndex
                                                ? colors.secondary
                                                : (isDarkMode ? colors.darkText : colors.primary)
                                        }
                                    ]}
                                >
                                    {tab.title}
                                </Text>
                            </View>
                            {activeTab === tabIndex && (
                                <View style={[styles.bubbleActiveIndicator, {
                                    backgroundColor: colors.secondary
                                }]} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </Animated.View>
        )
    );

    const getCurrentTabTitle = () => {
        if (activeTab < tabs.length) {
            return tabs[activeTab].title;
        }
        return "";
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
                backgroundColor: isDarkMode ? colors.third : colors.primary,
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
                            color={isDarkMode ? colors.darkText : "#FFFFFF"}
                        />
                    )}
                </TouchableOpacity>

                <View style={styles.userTextContainer}>
                    <Text style={[styles.userName, { color: "#FFFFFF" }]}>
                        {operator?.first_name} {operator?.last_name}
                    </Text>
                    <Text style={[styles.currentTabTitle, { color: "#E0E0E0" }]}>
                        {getCurrentTabTitle()}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={28}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            </View>

            {/* Overlay para cerrar el menú */}
            {isMoreMenuVisible && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleContainerPress}
                />
            )}

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

            {/* Bottom Tab Bar con menú expandible integrado */}
            <View style={styles.tabBarContainer}>
                {/* Menú burbuja flotante */}
                {renderMoreMenu()}
                
                <View style={[styles.tabBar, {
                    backgroundColor: isDarkMode ? colors.third : colors.lightBackground,
                    height: 70,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10
                }]}>
                    {/* Tabs visibles */}
                    {visibleTabs.map((tab, index) => (
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
                                {activeTab === index && (
                                    <View style={[styles.activeIndicator, {
                                        backgroundColor: colors.secondary
                                    }]} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Botón "Más" si hay tabs ocultos */}
                    {hasMoreTabs && (
                        <TouchableOpacity
                            style={[
                                styles.tabItem,
                                styles.moreButton,
                                (activeTab >= MAX_VISIBLE_TABS - 1 || isMoreMenuVisible) && styles.activeTabItem
                            ]}
                            onPress={toggleMoreMenu}
                        >
                            <View style={styles.tabIconContainer}>
                                <Animated.View
                                    style={{
                                        transform: [{
                                            rotate: slideAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '180deg'],
                                            })
                                        }]
                                    }}
                                >
                                    <Ionicons
                                        name="chevron-up"
                                        size={24}
                                        color={
                                            (activeTab >= MAX_VISIBLE_TABS - 1 || isMoreMenuVisible)
                                                ? colors.secondary
                                                : (isDarkMode ? colors.placeholderDark : colors.placeholderLight)
                                        }
                                    />
                                </Animated.View>
                                {(activeTab >= MAX_VISIBLE_TABS - 1) && (
                                    <View style={[styles.activeIndicator, {
                                        backgroundColor: colors.secondary
                                    }]} />
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
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
        position: 'relative',
    },
    darkBackground: {
        backgroundColor: "#112A4A"
    },
    lightBackground: {
        backgroundColor: "#FFF"
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 999,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 15,
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
        backgroundColor: 'rgba(255,255,255,0.2)'
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
    currentTabTitle: {
        fontSize: 14,
        marginTop: 2,
        fontWeight: '500',
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
    tabBarContainer: {
        position: 'relative',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4
    },
    moreButton: {
        position: 'relative',
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
    moreMenuBubble: {
        position: 'absolute',
        bottom: 75,
        right: 20,
        minWidth: 160,
        borderRadius: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        zIndex: 1000,
    },
    bubbleArrow: {
        position: 'absolute',
        bottom: -8,
        right: 20,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    bubbleMenuItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        position: 'relative',
    },
    lastBubbleMenuItem: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    activeBubbleMenuItem: {
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
    },
    bubbleItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bubbleMenuText: {
        fontSize: 14,
        marginLeft: 12,
        fontWeight: '500',
    },
    bubbleActiveIndicator: {
        position: 'absolute',
        right: 12,
        top: '50%',
        marginTop: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});

export default Home;