import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ScrollView,
  FlatList,
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
import colors from "./Colors";
import Ionicons from 'react-native-vector-icons/Ionicons';

// Importar todas las vistas existentes
import OrderModal from "./screens/orders/OrderModal";
import ListOfOrdersForSummary from "./screens/orders/ListOfOrdersForSumary";
import WorkDailyScreen from "./screens/orders/WorkDailyScreen";
import ListTruckScreen from "./screens/trucks/ListTruckScreen";
import FreelanceListScreen from "./screens/freelancers/FreelanceListScreen";
import ListWorkHouse from "./screens/workhouse/ListWorkHouse";
import { AdminInfo, GetAdminInfo } from '@/hooks/api/GetAdminByToken';
import InfoAdminModal from '@/app/modals/InfoAdminModal';
import EditAdminModal from '@/app/modals/EditAdminModal';
import OperatorList from "./screens/operators/OperatorList";
import SettingsModal from "./Settings/SettingsModal";
import ListOfCustomersModal from "./Settings/Options/CompanyCustomers/ListOfCustomersModal";
import ListJobsModal from "./Settings/Options/JobAndTools/ListJobsModal";

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
  role?: string;
}

interface TabItem {
  id: string;
  title: string;
  icon: string;
}

const Home: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";
  const scrollViewRef = useRef<FlatList<TabItem>>(null);
  const menuRef = useRef<View>(null);

  // Estados principales
  const [activeTab, setActiveTab] = useState(0);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  // Estados de animación
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);

  // Estados de admin
  const [operatorId, setOperatorId] = useState<string>('');
  const [adminDetails, setAdminDetails] = useState<AdminInfo | null>(null);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const renderedTabsRef = useRef<Record<string, React.ReactNode>>({});

  //estados para menu de operadores
  const [isOperatorsMenuVisible, setIsOperatorsMenuVisible] = useState(false);
  const operatorsMenuAnim = useRef(new Animated.Value(0)).current;
  //estados para el settings
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  //Opciones de settings
  const [isCustomersModalVisible, setIsCustomersModalVisible] = useState(false);
  const [isListJobsModalVisible, setIsListJobsModalVisible] = useState(false);

  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
      setIsLandscape(result.window.width > result.window.height);
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    // Verificar orientación inicial
    const { width, height } = Dimensions.get('window');
    setIsLandscape(width > height);

    return () => subscription?.remove();
  }, []);

  // Configuración de pestañas principales
  const mainTabs: TabItem[] = useMemo(() => [
    { id: 'orders', title: t("orders"), icon: 'cube-outline' },
    { id: 'summary-order', title: t("summary_order"), icon: 'briefcase-outline' },
    { id: 'operators', title: t("operators"), icon: 'people-outline' },
    { id: 'truck', title: t("truck_daily"), icon: 'car-outline' },
    { id: 'work-history', title: t("work_history"), icon: 'time-outline' },
    { id: 'truck-history', title: t("truck_history"), icon: 'car-sport-outline' },
    { id: 'workhouse', title: t("workhouse"), icon: 'home-outline' },
  ], [t]);

  // Todas las pestañas incluyendo las de operadores para el renderizado
  const allTabs = useMemo(() => {
    return [
      ...mainTabs,
      { id: 'freelance', title: t("freelance"), icon: 'person-outline' },
      { id: 'operator', title: t("operator"), icon: 'people-outline' },
    ];
  }, [mainTabs, t]);



  // Animación para el menú de operadores
  const toggleOperatorsMenu = useCallback(() => {
    if (isOperatorsMenuVisible) {
      Animated.timing(operatorsMenuAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsOperatorsMenuVisible(false));
    } else {
      setIsOperatorsMenuVisible(true);
      Animated.spring(operatorsMenuAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [isOperatorsMenuVisible]);

  // Optimización: Memoizar cálculos de tabs
  const tabCalculations = useMemo(() => {
    const MAX_VISIBLE_TABS = 4;
    // Usar solo las pestañas principales para el menú inferior
    const visibleTabs = mainTabs.slice(0, MAX_VISIBLE_TABS - 1);
    const hiddenTabs = mainTabs.slice(MAX_VISIBLE_TABS - 1);
    const hasMoreTabs = mainTabs.length > MAX_VISIBLE_TABS;

    return { MAX_VISIBLE_TABS, visibleTabs, hiddenTabs, hasMoreTabs };
  }, [mainTabs]);

  // Usar allTabs para el renderizado de contenido
  const tabs = allTabs;

  // Manejador para la selección de opciones de operadores
  const handleOperatorsOption = useCallback((option: 'freelance' | 'operator') => {
    const tabIndex = allTabs.findIndex(tab => tab.id === option);
    if (tabIndex !== -1) {
      setActiveTab(tabIndex);
      // Desplazar al tab seleccionado
      scrollViewRef.current?.scrollToIndex({
        index: tabIndex,
        animated: true,
      });
      // Cerrar el menú
      toggleOperatorsMenu();
    }
  }, [allTabs, toggleOperatorsMenu]);


  const renderOperatorsMenu = useCallback(() => (
    isOperatorsMenuVisible && (
      <Animated.View
        style={[
          styles.operatorsMenu,
          {
            opacity: operatorsMenuAnim,
            transform: [
              {
                translateY: operatorsMenuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              },
              {
                scale: operatorsMenuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.operatorsMenuItem}
          onPress={() => handleOperatorsOption('freelance')}
        >
          <Ionicons name="person-outline" size={20} color={isDarkMode ? colors.textDark : colors.textDark} />
          <Text style={[styles.operatorsMenuText, { color: isDarkMode ? colors.textDark : colors.textDark }]}>
            {t("freelance")}
          </Text>
        </TouchableOpacity>

        <View style={styles.operatorsMenuDivider} />

        <TouchableOpacity
          style={styles.operatorsMenuItem}
          onPress={() => handleOperatorsOption('operator')}
        >
          <Ionicons name="people-outline" size={20} color={isDarkMode ? colors.textDark : colors.textDark} />
          <Text style={[styles.operatorsMenuText, { color: isDarkMode ? colors.textDark : colors.textDark }]}>
            {t("operator")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    )
  ), [isOperatorsMenuVisible, operatorsMenuAnim, isDarkMode, t]);



  const operatorToAdminInfo = (operator: Operator | null): AdminInfo | null => {
    if (!operator) return null;

    return {
      user_name: operator.email || '',  // You'll need to adjust these mappings
      person: {
        email: operator.email || '',
        first_name: operator.first_name,
        last_name: operator.last_name,
        phone: operator.phone ? parseInt(operator.phone) : null,
        address: operator.address || '',
        birth_date: operator.birth_date,
        id_number: operator.id_number,
        type_id: operator.type_id,
        id_company: operator.id_company
      },
      created_at: new Date().toISOString(), // You'll need to get these from somewhere
      updated_at: new Date().toISOString(),
      photo: operator.photo || ''
    };
  };

  // Load operator data on mount
  useEffect(() => {
    const loadOperator = async () => {
      try {
        setLoading(true);
        const operatorData = await AsyncStorage.getItem("currentUser");

        if (operatorData) {
          const parsedData = JSON.parse(operatorData);
          setOperator(parsedData);

          // Obtener ID del operador
          const opId = parsedData.id_operator?.toString() ||
            parsedData.id?.toString() ||
            parsedData.person?.id_operator?.toString() ||
            parsedData.id_company?.toString() || '';
          setOperatorId(opId);
        }
      } catch (error) {
        console.error("Error loading operator:", error);
        Toast.show({
          type: "error",
          text1: t("load_error"),
          text2: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoading(false);
      }
    };

    loadOperator();
  }, []);

  const handleAvatarPress = useCallback(() => {
    if (adminDetails) {
      setIsInfoModalVisible(true);
    } else {
      Toast.show({
        type: "info",
        text1: "Admin data is loading",
        text2: "Please wait a moment"
      });
    }
  }, [adminDetails]);

  // Efecto para cargar datos del admin (siempre se ejecuta)
  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const adminData = await GetAdminInfo();
        if (adminData) {
          setAdminDetails(adminData);
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    };

    loadAdmin();
  }, []);


  // Función para actualizar admin
  const handleAdminUpdate = useCallback((updatedAdmin: AdminInfo) => {
    setAdminDetails(updatedAdmin);
    setIsEditModalVisible(false);

    // Actualizar datos en AsyncStorage
    AsyncStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...operator,
        adminDetails: updatedAdmin
      })
    );

    Toast.show({
      type: "success",
      text1: t("profile_updated"),
    });
  }, [operator, t]);
  // Funciones de manejo optimizadas
  const handleLogout = useCallback(async () => {
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
  }, [t, router]);


  // Componente de carga memoizado
  const LoadingIndicator = useMemo(() => (
    <View style={styles.placeholderContainer}>
      <ActivityIndicator size="large" color={isDarkMode ? colors.secondary : colors.primary} />
      <Text style={[styles.placeholderText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
        {t("loading")}...
      </Text>
    </View>
  ), [isDarkMode, t]);

  // Cache de componentes renderizados
  const [renderedTabs, setRenderedTabs] = useState<{ [key: string]: React.ReactNode }>({});

  // Optimización: Solo renderizar el tab activo y cachear componentes
  const renderTabContent = useCallback((tabId: string, isActive: boolean) => {

    // Si ya existe en caché, devolver el componente
    if (renderedTabsRef.current[tabId]) {
      return renderedTabsRef.current[tabId];
    }

    // Generar componente solo si es activo o adyacente
    if (isActive) {
      let component: React.ReactNode;
      const effectiveOperatorId = tabId === 'operator'
        ? (operatorId || operator?.id_company?.toString() || '')
        : operatorId;

      if (tabId === 'operator' && !effectiveOperatorId) {
        component = (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: isDarkMode ? colors.white : colors.darkText }]}>
              {'No se pudo cargar la información del operador. Por favor cierre sesión y vuelva a ingresar.'}
            </Text>
          </View>
        );
      } else {
        switch (tabId) {
          case 'orders':
            component = <OrderModal key={`orders-${Date.now()}`} />;
            break;
          case 'summary-order':
            component = <ListOfOrdersForSummary key={`summary-${Date.now()}`} />;
            break;
          case 'work-history':
            component = <WorkDailyScreen key={`work-${Date.now()}`} />;
            break;
          case 'truck':
          case 'truck-history':
            component = <ListTruckScreen key={`truck-${Date.now()}`} />;
            break;
          case 'operator':
            component = (
              <OperatorList
                key={`operator-${Date.now()}`}
                isEdit="true"
                onClose={() => setActiveTab(0)}
              />
            );
            break;
          case 'freelance':
            component = <FreelanceListScreen key={`freelance-${Date.now()}`} />;
            break;
          case 'workhouse':
            component = <ListWorkHouse key={`workhouse-${Date.now()}`} visible={true} onClose={() => { }} />;
            break;
          default:
            component = LoadingIndicator;
        }
      }

      // Almacenar en caché sin causar re-render
      renderedTabsRef.current[tabId] = component;
      return component;
    }

    // Para tabs inactivos no renderizados previamente
    return (
      <View style={styles.placeholderContainer}>
        <ActivityIndicator size="large" color={isDarkMode ? colors.secondary : colors.primary} />
      </View>
    );
  }, [loading, initialized, operatorId, operator, isDarkMode, LoadingIndicator]);

  // Funciones de manejo de tabs optimizadas con debounce
  const handleTabPress = useCallback((index: number) => {
    if (loading || index < 0 || index >= tabs.length) return;
    if (activeTab === index) return;

    // Manejar la opción especial de "Operadores"
    if (tabs[index].id === 'operators') {
      toggleOperatorsMenu();
      return;
    }

    setActiveTab(index);
    closeMoreMenu();

    scrollViewRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5
    });
  }, [loading, tabs, activeTab, toggleOperatorsMenu]);

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
    e?.stopPropagation?.();
    e?.preventDefault?.();

    if (isMoreMenuVisible) {
      closeMoreMenu();
    } else {
      openMoreMenu();
    }
  }, [isMoreMenuVisible, closeMoreMenu, openMoreMenu]);

  const handleContainerPress = useCallback(() => {
    if (isMoreMenuVisible) {
      closeMoreMenu();
    }
  }, [isMoreMenuVisible, closeMoreMenu]);

  // Renderizado del menú más optimizado
  const renderMoreMenu = useCallback(() => (
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
        <View style={[
          styles.bubbleArrow,
          { borderTopColor: isDarkMode ? colors.third : colors.lightBackground }
        ]} />

        {tabCalculations.hiddenTabs.map((tab, index) => {
          const tabIndex = tabCalculations.MAX_VISIBLE_TABS - 1 + index;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.bubbleMenuItem,
                activeTab === tabIndex && styles.activeBubbleMenuItem,
                index === tabCalculations.hiddenTabs.length - 1 && styles.lastBubbleMenuItem
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
  ), [isMoreMenuVisible, slideAnim, opacityAnim, isDarkMode, tabCalculations, activeTab, handleTabPress]);

  // Título de tab actual memoizado
  const getCurrentTabTitle = useCallback(() => {
    if (activeTab < tabs.length) {
      return tabs[activeTab].title;
    }
    return "";
  }, [activeTab, tabs]);

  // Limpiar cache cuando sea necesario
  useEffect(() => {
    // Limpiar cache de tabs lejanos para liberar memoria
    const activeTabId = tabs[activeTab]?.id;
    if (activeTabId) {
      const keysToKeep = new Set([
        activeTabId,
        tabs[activeTab - 1]?.id,
        tabs[activeTab + 1]?.id
      ].filter(Boolean));

      setRenderedTabs(prev => {
        const newCache: { [key: string]: React.ReactNode } = {};
        Object.keys(prev).forEach(key => {
          if (keysToKeep.has(key)) {
            newCache[key] = prev[key];
          }
        });
        return newCache;
      });
    }
  }, [activeTab, tabs]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
        <View style={styles.placeholderContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? colors.secondary : colors.primary} />
          <Text style={[styles.placeholderText, { color: isDarkMode ? colors.darkText : colors.primary }]}>
            {t("loading")}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView
      style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header con padding adaptativo */}
      <View style={[
        styles.header,
        {
          backgroundColor: isDarkMode ? colors.third : colors.primary,
          // Padding adaptativo basado en orientación
          paddingTop: isLandscape ? 40 : 15,
          paddingLeft: isLandscape ? 30 : 15,
          paddingRight: isLandscape ? 30 : 15,
          paddingVertical: isLandscape ? 30 : 15,
          minHeight: isLandscape ? 50 : 70, // Altura mínima adaptativa
        }
      ]}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleAvatarPress}
          activeOpacity={0.7}
        >
          {adminDetails?.photo ? (
            <Image
              source={{ uri: adminDetails.photo }}
              style={[styles.avatarImage, isDarkMode && styles.darkBorder]}
            />
          ) : operator?.photo ? (
            <Image
              source={{ uri: operator.photo }}
              style={[styles.avatarImage, isDarkMode && styles.darkBorder]}
            />
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={40}
              color="#FFFFFF"
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
        {/* Botón de settings */}
        <TouchableOpacity
          onPress={() => setIsSettingsModalVisible(true)}
          style={{ marginLeft: 12, padding: 6, borderRadius: 4 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings-outline"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
      {renderOperatorsMenu()}
      {/* Overlay para cerrar el menú */}
      {isMoreMenuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleContainerPress}
        />
      )}

      {/* Contenido principal con lazy loading */}
      <View style={styles.contentContainer}>
        <FlatList
          ref={scrollViewRef}
          data={tabs}
          renderItem={({ item: tab, index }) => (
            <View style={[styles.tabPage, { width: screenWidth }]}>
              {renderTabContent(tab.id, index === activeTab)}
            </View>
          )}
          keyExtractor={(tab) => tab.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.floor(event.nativeEvent.contentOffset.x / screenWidth);
            if (newIndex !== activeTab && newIndex >= 0 && newIndex < tabs.length) {
              setActiveTab(newIndex);
            }
          }}
          style={styles.scrollView}
          scrollEnabled={false}  // HABILITAR SCROLL
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          initialNumToRender={1}
          windowSize={3}
        />
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBarContainer}>
        {renderMoreMenu()}

        <View style={[styles.tabBar, {
          backgroundColor: isDarkMode ? colors.third : colors.lightBackground,
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10
        }]}>
          {tabCalculations.visibleTabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                activeTab === index && styles.activeTabItem
              ]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
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

          {tabCalculations.hasMoreTabs && (
            <TouchableOpacity
              style={[
                styles.tabItem,
                styles.moreButton,
                (activeTab >= tabCalculations.MAX_VISIBLE_TABS - 1 || isMoreMenuVisible) && styles.activeTabItem
              ]}
              onPress={toggleMoreMenu}
              activeOpacity={0.7}
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
                      (activeTab >= tabCalculations.MAX_VISIBLE_TABS - 1 || isMoreMenuVisible)
                        ? colors.secondary
                        : (isDarkMode ? colors.placeholderDark : colors.placeholderLight)
                    }
                  />
                </Animated.View>
                {(activeTab >= tabCalculations.MAX_VISIBLE_TABS - 1) && (
                  <View style={[styles.activeIndicator, {
                    backgroundColor: colors.secondary
                  }]} />
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <InfoAdminModal
        visible={isInfoModalVisible}
        onClose={() => setIsInfoModalVisible(false)}
        admin={adminDetails}  // Usar adminDetails directamente
        onEdit={() => {
          setIsInfoModalVisible(false);
          setIsEditModalVisible(true);
        }}
      />
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onOpenJobsModal={() => {
          setIsSettingsModalVisible(false);
          setIsListJobsModalVisible(true);
          // Si necesitas seleccionar un job específico, ajusta aquí setSelectedJobId/setSelectedJobName
        }}
        onOpenCustomerListModal={() => {
          setIsSettingsModalVisible(false);
          setIsCustomersModalVisible(true);
        }}
      />
      <ListOfCustomersModal
        visible={isCustomersModalVisible}
        onClose={() => setIsCustomersModalVisible(false)}
      />
      <ListJobsModal
        visible={isListJobsModalVisible}
        onClose={() => setIsListJobsModalVisible(false)}
      />
      <EditAdminModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        admin={adminDetails}  // Usar adminDetails directamente
        onUpdate={handleAdminUpdate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 0 : 0, // Dejar que SafeAreaView maneje esto
  },
  scrollView: {
    flex: 1,
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
    paddingTop: 15,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  activeTabItem: {},
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
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
  operatorsMenu: {
    position: 'absolute',
    bottom: 75,
    right: 20,
    minWidth: 160,
    borderRadius: 12,
    backgroundColor: colors.primary,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 1001,
    paddingVertical: 8,
  },
  operatorsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  operatorsMenuText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  operatorsMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
});

export default Home;