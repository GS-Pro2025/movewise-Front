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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import colors from "./Colors";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import SettingsModal from "./Settings/SettingsModal";
import ListJobsModal from "./Settings/Options/JobAndTools/ListJobsModal";
import ListOfCustomersModal from "./Settings/Options/CompanyCustomers/ListOfCustomersModal";
import { GetAdminInfo } from "@/hooks/api/GetAdminByToken";
// import InfoAdminModal from "./modals/InfoAdminModal";
import InfoAdminModal from "./modals/InfoAdminModal";
import EditAdminModal from "./modals/EditAdminModal";
import { AdminInfo } from '@/hooks/api/GetAdminByToken';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Admin {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  status: string;
  phone: number | null;
  photo: string;
  address: string | null;
  id_number: string | null;
}

interface ActionButtonProps {
  title: string;
  iconSource?: any;
  isDarkMode: boolean;
  onPress?: () => void;
}

const Home: React.FC = () => {
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [adminDetails, setAdminDetails] = useState<AdminInfo | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();
  const router = useRouter();
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isJobsModalVisible, setJobsModalVisible] = useState(false);
  const [isListOfCustomersModal, setListOfCustomersModal] = useState(false);

  const toggleSettingsModal = () => {
    setSettingsModalVisible(!isSettingsModalVisible);
  };
  useEffect(() => {
    // En el useEffect del componente Home
    const loadAdmin = async () => {
      try {
        setLoading(true);
        const adminData = await AsyncStorage.getItem("currentUser");
        if (adminData) setAdmin(JSON.parse(adminData));

        // Obtener datos de la API
        const response = await GetAdminInfo();
        // console.log('API Response:', response);

        if (response) {
          // console.log('Datos recibidos del API:', response);
          setAdminDetails(response);

          setAdmin({
            id: response.person.id_company,
            photo: response.photo,
            user_name: response.user_name,
            first_name: response.person.first_name,
            last_name: response.person.last_name,
            phone: response.person.phone,
            address: response.person.address,
            id_number: response.person.id_number,
            status: "active"
          });

          // Guardar en AsyncStorage
          await AsyncStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: response.person.id_company,
              first_name: response.person.first_name,
              last_name: response.person.last_name,
              id_number: response.person.id_number,
              status: "active"
            })
          );
        }
      } catch (error) {
        console.error("Error loading admin:", error);
        Toast.show({ type: "error", text1: t("load_error") });
      } finally {
        setLoading(false);
      }
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

  const handleAdminUpdate = async (updatedAdmin: AdminInfo) => {
    try {

      if (!updatedAdmin.person.id_number) {
        throw new Error(t("id_number_required"));
      }

      setAdminDetails(updatedAdmin);

      // Actualizar también el estado de admin
      setAdmin({
        id: updatedAdmin.person.id_company,
        user_name: updatedAdmin.user_name,
        photo: updatedAdmin.photo,
        first_name: updatedAdmin.person.first_name,
        last_name: updatedAdmin.person.last_name,
        status: "active",
        phone: updatedAdmin.person.phone,
        address: updatedAdmin.person.address,
        id_number: updatedAdmin.person.id_number,
      });

      // Actualizar AsyncStorage
      await AsyncStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: updatedAdmin.person.id_company,
          first_name: updatedAdmin.person.first_name,
          last_name: updatedAdmin.person.last_name,
          id_number: updatedAdmin.person.id_number,
          status: "active"
        })
      );

      Toast.show({
        type: "success",
        text1: t("profile_updated"),
      });
    } catch (error) {
      console.error("Error updating admin:", error);
      Toast.show({
        type: "error",
        text1: t("update_error"),
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
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => {
                // console.log('Opening info modal with data:', adminDetails);
                setIsInfoModalVisible(true);
              }}
            >
              {admin?.photo ? (
                <Image
                  source={{ uri: admin.photo }}
                  style={[styles.avatarImage, isDarkMode && styles.darkBorder]}
                  onError={() => console.log("Error loading admin photo")}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={40}
                  color={isDarkMode ? colors.darkText : colors.primary}
                />
              )

              }
            </TouchableOpacity>

            <View style={styles.userTextContainer}>
              <Text style={[
                styles.userName,
                { color: isDarkMode ? "#FFFFFF" : "#0458AB" }
              ]}>
                {admin?.user_name}
              </Text>
              <Text style={[
                styles.userId,
                { color: isDarkMode ? "#CCCCCC" : "#888888" }
              ]}>
                {admin?.id_number || t("no_id_available")}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={toggleSettingsModal}>
            <Image
              source={require("../assets/images/settings.png")}
              style={[
                styles.userIcono,
                { tintColor: isDarkMode ? colors.darkText : colors.primary }
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleLogout}>
            <Image
              source={require("../assets/images/exit.png")}
              style={[
                styles.userIcono,
                { tintColor: isDarkMode ? colors.darkText : colors.primary }
              ]}
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
              onPress={() => router.push("./screens/orders/OrderModal")}
            />
          </View>
          <View style={styles.row}>
            <ActionButton
              title={t("resume_order")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/paper.png")}
              onPress={() => router.push("./screens/orders/ListOfOrdersForSumary")}
            />
            <ActionButton
              title={t("add_extra_cost")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/dolar.png")}
              onPress={() => router.push("./screens/orders/WorkDailyScreen")}
            />
          </View>
          <View style={styles.row}>
            <ActionButton
              title={t("create_truck")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/truck.png")}
              onPress={() => router.push("./screens/trucks/ListTruckScreen")}
            />
            <ActionButton
              title={t("operator_edit")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/Pencil.png")}
              onPress={() =>
                router.push({
                  pathname: "./screens/operators/OperatorList",
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
                  pathname: "./screens/operators/OperatorList",
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
          <View style={styles.row}>
            <ActionButton
              title={t("freelancers")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/personx.png")}
              onPress={() => router.push("./screens/freelancers/FreelanceListScreen")}
            />
            <ActionButton
              title={t("workhouse")}
              isDarkMode={isDarkMode}
              iconSource={require("../assets/images/work-house.png")}
              onPress={() => router.push("./screens/workhouse/ListWorkHouse")}
            />
          </View>

        </View>
      </ScrollView>

      {/* Modal de configuración */}
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={toggleSettingsModal}
        onOpenJobsModal={() => setJobsModalVisible(true)}
        onOpenCustomerListModal={() => setListOfCustomersModal(true)}
      />

      <ListJobsModal
        visible={isJobsModalVisible}
        onClose={() => setJobsModalVisible(false)}
      />

      <ListOfCustomersModal
        visible={isListOfCustomersModal}
        onClose={() => setListOfCustomersModal(false)}
      />

      {/* Render modal only when we have data and modal is visible */}
      {adminDetails && (
        <>
          {adminDetails && (
            <InfoAdminModal
              visible={isInfoModalVisible}
              onClose={() => setIsInfoModalVisible(false)}
              admin={adminDetails}  // Asegurar que adminDetails está correctamente poblado
              onEdit={() => {
                setIsInfoModalVisible(false);
                setIsEditModalVisible(true);
              }}
            />
          )}

          <EditAdminModal
            visible={isEditModalVisible}
            onClose={() => setIsEditModalVisible(false)}
            admin={adminDetails}
            onUpdate={handleAdminUpdate}
          />
        </>
      )}

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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, overflow: "hidden" },
  userIcono: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  userTextContainer: {
    paddingLeft:10,
    flexShrink: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userId: {
    fontSize: 12,
    marginTop: 2,
  },
  shareButton: {
    marginLeft: 10,
  },
  divider: { height: 1, backgroundColor: colors.placeholderLight, marginVertical: 10 },
  imageContainer: { alignItems: "center", marginVertical: 10 },
  userLogo: { width: 100, height: 100 },
  gridContainer: { marginTop: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  actionButton: { flex: 1, padding: 15, alignItems: "center", borderRadius: 10, marginHorizontal: 5 },
  actionButtonIcon: { width: 40, height: 40, marginBottom: 5 },
  actionButtonText: { fontSize: 14, textAlign: "center" },
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