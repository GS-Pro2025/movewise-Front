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

  useEffect(() => {
    const loadAdmin = async () => {
      const adminData = await AsyncStorage.getItem("currentUser");
      setAdmin(JSON.parse(adminData || "{}"));
    };
    loadAdmin();
  }, []);

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
            <View style={styles.userTextContainer}>
              <Text
                style={[styles.userName, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}
              >
                {Admin?.first_name} {Admin?.last_name}
              </Text>
              <Text style={[styles.userName, { color: isDarkMode ? "#FFFFFF" : "#0458AB" }]}>
                {t("admin_id")} <Text style={{ fontSize: 14 }}>{Admin?.id_number}</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.shareButton}>
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
            <ActionButton
              title={t("add_extra_cost")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/dolar.png")}
              onPress={() => router.push("/modals/WorkDailyScreen")}
            />
          </View>
          <View style={styles.row}>
            <ActionButton
              title={t("edit_daily")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/paquete.png")}
              onPress={() => console.log("")}
            />
            <ActionButton
              title={t("resume_order")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/paper.png")}
              onPress={() => router.push("/modals/ListOfOrdersForSumary")}
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
              title={t("collaborator_registration")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/logo.png")}
              onPress={() =>
                router.push({
                  pathname: "/modals/OperatorList",
                  params: { isEdit: "false" },
                })
              }
            />
          </View>
          <View style={styles.row}>
            <ActionButton
              title={t("collaborator_unlink")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/personx.png")}
            />
            <ActionButton
              title={t("collaborator_edit")}
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
        </View>
      </ScrollView>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, overflow: "hidden" },
  userIcono: { width: 40, height: 40 },
  userTextContainer: { marginLeft: 10 },
  userName: { fontSize: 18, fontWeight: "bold" },
  shareButton: { padding: 10 },
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