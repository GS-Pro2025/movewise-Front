import React from "react";
import {
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    useColorScheme,
    ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeToken, getPersonIdFromToken, isAdmin } from "@/utils/decodeToken";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import InfoOperatorModal from "./screens/operators/InfoOperatorModal";
import EditOperatorModal from "./screens/operators/EditOperatorModal";
import colors from "./Colors";
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ActionButtonProps {
    title: string;
    iconSource?: any;
    isDarkMode: boolean;
    onPress?: () => void;
}

// En tu archivo de interfaces o en el mismo componente
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

const Home: React.FC = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const theme = useColorScheme();
    const isDarkMode = theme === "dark";
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [operator, setOperator] = useState<Operator | null>(null);

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
            }
        };
        loadOperator();
    }, [])


    const handleUpdate = async (updatedOperator: Operator) => {
        setOperator(updatedOperator);
        await AsyncStorage.setItem("currentUser", JSON.stringify(updatedOperator));
        Toast.show({ type: "success", text1: t("profile_updated") });
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear(); // Limpia todos los datos almacenados
            Toast.show({
                type: "success",
                text1: t("logout_success"),
            });
            router.replace("/Login"); // Redirige al login
        } catch (error) {
            Toast.show({
                type: "error",
                text1: t("logout_error"),
            });
        }
    };
    return (
        <SafeAreaView
            style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}
        >
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
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

                <View style={styles.divider} />

                <View style={styles.imageContainer}>
                    <Image
                        source={require("../assets/images/LOGOPNG.png")}
                        style={[styles.userLogo, { tintColor: isDarkMode ? "#FFFFFF" : "#0458AB" }]}
                    />
                </View>

                {/* Grid de botones */}
                <View style={styles.gridContainer}>
                    <View style={styles.row}>
                        <ActionButton
                            title={t("create_daily")}
                            isDarkMode={isDarkMode}
                            iconSource={require("../assets/images/paquete.png")}
                            onPress={() => router.push({
                                pathname: "/screens/orders/OrderModal",
                                params: { isOperator: "true" }
                            })}
                        />
                        <ActionButton
                            title={t("operator_work_daily")}
                            isDarkMode={isDarkMode}
                            iconSource={require("../assets/images/workDailyIcon.png")}
                            onPress={() => router.push({
                                pathname: "./screens/operators/OperatorView",
                                params: {
                                    type: "work",
                                    operatorId: operator?.id_operator
                                }
                            })}
                        />
                        <ActionButton
                            title={t("operator_truck_daily")}
                            isDarkMode={isDarkMode}
                            iconSource={require("../assets/images/truck.png")}
                            onPress={() => router.push({
                                pathname: "./screens/operators/OperatorView",
                                params: {
                                    type: "truck",
                                    operatorId: operator?.id_operator
                                }
                            })}
                        />
                    </View>
                    <View style={styles.row}>
                        <ActionButton
                            title={t("operator_work_history")}
                            isDarkMode={isDarkMode}
                            iconSource={require("../assets/images/historyIcon.png")}
                        />
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
            </ScrollView>
        </SafeAreaView>
    );
};

const ActionButton: React.FC<ActionButtonProps> = ({ title, iconSource, isDarkMode, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={onPress}
        >
            {iconSource ? (
                <Image
                    source={iconSource}
                    style={[styles.actionButtonIcon, { tintColor: isDarkMode ? "#112A4A" : "#FFFFFF" }]}
                />
            ) : null}
            <Text style={[styles.actionButtonText, isDarkMode ? styles.darkText : styles.lightText]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1 },
    darkBackground: { backgroundColor: "#112A4A" },
    lightBackground: { backgroundColor: "#FFF" },
    scrollContent: { flexGrow: 1, padding: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    userInfo: { flexDirection: "row", alignItems: "center" },
    avatarContainer: { width: 40, height: 40, borderRadius: 20, overflow: "hidden" },
    userIcono: { width: 40, height: 40 },
    userTextContainer: { marginLeft: 10 },
    userName: { fontSize: 18, fontWeight: "bold", color: "#ffff" },
    shareButton: { padding: 10 },
    divider: { height: 1, backgroundColor: "#ccc", marginVertical: 10 },
    imageContainer: { alignItems: "center", marginVertical: 10 },
    userLogo: { width: 100, height: 100 },
    gridContainer: { marginTop: 10 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    actionButton: { flex: 1, padding: 15, alignItems: "center", borderRadius: 10, marginHorizontal: 5 },
    darkButton: { backgroundColor: "#FFF" },
    lightButton: { backgroundColor: "#0458AB" },
    actionButtonIcon: { width: 40, height: 40, marginBottom: 5 },
    actionButtonText: { fontSize: 14, textAlign: "center" },
    darkText: { color: "#112A4A" },
    lightText: { color: "#ffff" },
    userId: { fontSize: 11 },
    logoutButton: {
        marginLeft: 10,
        padding: 6,
        borderRadius: 4,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        overflow: "hidden",
        marginRight: 10,
    },
    darkBorder: {
        borderColor: "#333333",
    },
});

export default Home;
