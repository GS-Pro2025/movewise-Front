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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

interface ActionButtonProps {
    title: string;
    iconSource?: any;
    isDarkMode: boolean;
    onPress?: () => void;
}

interface Operator {
    id: number;
    first_name: string;
    last_name: string;
    status: string;
    id_number: string;
}

const Home: React.FC = () => {
    const router = useRouter();
    const theme = useColorScheme();
    const isDarkMode = theme === "dark";
    const [operator, setOperator] = useState<Operator | null>(null);
    useEffect(() => {
        const loadOperator = async () => {
            const operatorData = await AsyncStorage.getItem("currentUser");
            setOperator(JSON.parse(operatorData || "{}"));
        };
        loadOperator();
    }, []);

    return (
        <SafeAreaView
            style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}
        >
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={require("../assets/images/logo.png")}
                                style={[styles.userIcono, { tintColor: isDarkMode ? "#fff" : "#0458AB" }]}
                            />
                        </View>
                        <View style={styles.userTextContainer}>
                            <Text style={[styles.userName, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
                                {operator?.first_name} {operator?.last_name}
                            </Text>
                            <Text style={[styles.userName, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
                                Level
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.shareButton}>
                        <Image
                            source={require("../assets/images/exit.png")}
                            style={[styles.userIcono, { tintColor: isDarkMode ? "#FFFFFF" : "#0458AB" }]}
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
                            title={"Work\nDaily"}
                            isDarkMode={isDarkMode}
                            iconSource={require("../assets/images/workDailyIcon.png")}
                            onPress={() => router.push({
                                pathname: "/modals/OperatorView",
                                params: {
                                    type: "work",
                                    operatorId: operator?.id
                                }
                            })}
                        />
                        <ActionButton
                            title={"Truck\nDaily"}
                            isDarkMode={isDarkMode}
                            iconSource={require("../assets/images/truck.png")}
                            onPress={() => router.push({
                                pathname: "/modals/OperatorView",
                                params: {
                                    type: "truck",
                                    operatorId: operator?.id
                                }
                            })}
                        />
                    </View>
                    <View style={styles.row}>
                        <ActionButton
                            title={"Work\nHistory"}
                            isDarkMode={isDarkMode}
                            iconSource={require("../assets/images/historyIcon.png")}
                        //   onPress={() => router.push("/modals/HistoryModal")}
                        />
                    </View>
                </View>
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
});

export default Home;
