import React, { useEffect, useState } from "react";
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
import colors from "./Colors";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import SettingsModal from "./Settings/SettingsModal";
import ListJobsModal from "./Settings/Options/JobAndTools/ListJobsModal";

interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  status: string;
  id_number: string;
}

interface ActionButtonProps {
  title: string;
  iconSource?: any;
  isDarkMode: boolean;
  onPress?: () => void;
}

const Home: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";
  const [Admin, setAdmin] = useState<Admin | null>(null);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isJobsModalVisible, setJobsModalVisible] = useState(false);

  const toggleSettingsModal = () => {
    setSettingsModalVisible(!isSettingsModalVisible);
  };
  useEffect(() => {
    const loadAdmin = async () => {
      const adminData = await AsyncStorage.getItem("currentUser");
      setAdmin(JSON.parse(adminData || "{}"));
    };
    loadAdmin();
  }, []);

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
      style={[styles.container, { backgroundColor: isDarkMode ? colors.third : colors.lightBackground }]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={require("../assets/images/logo.png")}
                style={[styles.userIcono, { tintColor: isDarkMode ? colors.darkText : colors.primary }]}
              />
            </View>
            <View style={[styles.userTextContainer, { maxWidth: "70%" }]}>
              <Text
                style={[styles.userName, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}
                numberOfLines={2} 
                ellipsizeMode="tail"
              >
                {Admin?.first_name} {Admin?.last_name}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={toggleSettingsModal}>
            <Image
              source={require("../assets/images/settings.png")} 
              style={[styles.userIcono, { tintColor: isDarkMode ? colors.darkText : colors.primary }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleLogout}>
            <Image
              source={require("../assets/images/exit.png")}
              style={[styles.userIcono, { tintColor: isDarkMode ? colors.darkText : colors.primary }]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/LOGOPNG.png")}
            style={[styles.userLogo, { tintColor: isDarkMode ? colors.darkText : colors.primary }]}
          />
        </View>

        {/* Grid de botones */}
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <ActionButton
              title={t("create_daily")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/paquete.png")}
              onPress={() => router.push("/modals/OrderModal")}
            />
          </View>
          <View style={styles.row}>
            <ActionButton
              title={t("resume_order")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/paper.png")}
              onPress={() => router.push("/modals/ListOfOrdersForSumary")}
            />
            <ActionButton
              title={t("add_extra_cost")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/dolar.png")}
              onPress={() => router.push("/modals/WorkDailyScreen")}
            />
          </View>
          <View style={styles.row}>
            <ActionButton
              title={t("create_truck")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/truck.png")}
              onPress={() => router.push("/modals/ListTruckScreen")}
            />
            <ActionButton
                title={t("operator_edit")}
                isDarkMode={isDarkMode}
                iconSource={require("../assets/images/Pencil.png")}
                onPress={() =>
                  router.push({
                    pathname: "/modals/OperatorList",
                    params: { isEdit: "true" },
                  })
                }
              />
          </View>
          <View style={styles.row}>
            <ActionButton
              title={t("operator_registration")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/logo.png")}
              onPress={() =>
                router.push({
                  pathname: "/modals/OperatorList",
                  params: { isEdit: "false" },
                })
              }
            />
            <ActionButton
              title={t("operator_unlink")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/personx.png")}
            />
          </View>
        </View>
      </ScrollView>
    {/* Modal de configuración */}
    <SettingsModal
      visible={isSettingsModalVisible}
      onClose={toggleSettingsModal}
      onOpenJobsModal={() => setJobsModalVisible(true)}
    />

    <ListJobsModal
      visible={isJobsModalVisible}
      onClose={() => setJobsModalVisible(false)}
    />
    </SafeAreaView>
  );
};

const ActionButton: React.FC<ActionButtonProps> = ({ title, iconSource, isDarkMode, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: isDarkMode ? colors.lightBackground : colors.primary }]}
      onPress={onPress}
    >
      {iconSource ? (
        <Image
          source={iconSource}
          style={[styles.actionButtonIcon, { tintColor: isDarkMode ? colors.third : colors.lightBackground }]}
        />
      ) : null}
      <Text style={[styles.actionButtonText, { color: isDarkMode ? colors.third : colors.lightBackground }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20, },
  userInfo: { flexDirection: "row", 
    alignItems: "center",
    flex: 1, // Permite que userInfo ocupe el espacio restante
  },
  avatarContainer: { 
    width: 40,
    height: 40, 
    borderRadius: 20, 
    overflow: "hidden",
    marginRight: 10, },
  userIcono: {  
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  userTextContainer: { 
    marginLeft: 10, 
    maxWidth: '50%', // Ocupa la mitad del espacio del contenedor userInfo
    justifyContent: 'center', // Centra el texto verticalmente si ocupa una sola línea 
  },
  userName: { 
  fontSize: 16,
  fontWeight: 'bold',
  lineHeight: 20, // Ajusta el espaciado entre líneas si el nombre se divide
  },
  shareButton: { padding: 10,
    marginLeft: 15,
  },
  divider: { height: 1, backgroundColor: colors.placeholderLight, marginVertical: 10 },
  imageContainer: { alignItems: "center", marginVertical: 10 },
  userLogo: { width: 100, height: 100 },
  gridContainer: { marginTop: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  actionButton: { flex: 1, padding: 15, alignItems: "center", borderRadius: 10, marginHorizontal: 5 },
  actionButtonIcon: { width: 40, height: 40, marginBottom: 5 },
  actionButtonText: { fontSize: 14, textAlign: "center" },
});

export default Home;