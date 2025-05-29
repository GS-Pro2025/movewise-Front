import React, { useState, useEffect } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Dimensions,
  Alert
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '@/app/Colors';
import { Order } from './OrderModal';
import { GetAssignedOperators } from '@/hooks/api/GetAssignedOperators';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';
import { url } from "@/hooks/api/apiClient";
import CrossPlatformImageUpload from '@/components/CrossPlatformImageUpload';
import { ImageInfo } from '@/components/CrossPlatformImageUpload';

interface Operator {
  id_assign: number;
  assigned_at: string;
  photo: string | null;
  first_name: string;
  last_name: string;
  rol: string;
}

interface InfoOrderModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
  isWorkhouse: boolean;
  userRole?: string; // Add user role prop
}

const InfoOrderModal: React.FC<InfoOrderModalProps> = ({
  visible,
  onClose,
  order,
  isWorkhouse = false,
  userRole
}) => {
  const { width } = Dimensions.get('window');
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [imageStatus, setImageStatus] = useState<{
    dispatchTicket: 'loading' | 'valid' | 'invalid';
    evidence: 'loading' | 'valid' | 'invalid';
  }>({ dispatchTicket: 'loading', evidence: 'loading' });

  const [operators, setOperators] = useState<Operator[]>([]);
  const [loadingOperators, setLoadingOperators] = useState(true);


  // Admin complete work states
  const [completeWorkModalVisible, setCompleteWorkModalVisible] = useState(false);
  const [evidence, setEvidence] = useState<ImageInfo | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchOperators = async (orderKey: string) => {
    try {
      setLoadingOperators(true);
      const data = await GetAssignedOperators(orderKey);
      setOperators(data);
    } catch (error) {
      console.error("Error fetching operators:", error);
    } finally {
      setLoadingOperators(false);
    }
  };

  useEffect(() => {
    if (visible && order?.key) {
      fetchOperators(order.key);
    }
  }, [visible, order?.key]);

  // Base theme colors
  const backgroundColor = isDarkMode ? colors.darkBackground : colors.lightBackground;
  const textColor = isDarkMode ? colors.darkText : colors.lightText;
  const primaryColor = isDarkMode ? colors.darkText : colors.primary;
  const cardBackground = isDarkMode ? '#2A2A2A' : '#ffffff';
  const borderColor = isDarkMode ? '#444444' : '#e0e0e0';

  useEffect(() => {
    const verifyImage = async (url: string, type: 'dispatchTicket' | 'evidence') => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          setImageStatus(prev => ({ ...prev, [type]: 'valid' }));
        } else {
          setImageStatus(prev => ({ ...prev, [type]: 'invalid' }));
        }
      } catch (error) {
        setImageStatus(prev => ({ ...prev, [type]: 'invalid' }));
      }
    };

    if (order) {
      if (order.dispatch_ticket) {
        verifyImage(order.dispatch_ticket, 'dispatchTicket');
      } else {
        setImageStatus(prev => ({ ...prev, dispatchTicket: 'invalid' }));
      }

      if (order.evidence) {
        verifyImage(order.evidence, 'evidence');
      } else {
        setImageStatus(prev => ({ ...prev, evidence: 'invalid' }));
      }
    }
  }, [order]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('not_found');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatGroupedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'finished':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return primaryColor;
    }
  };

  const handleEvidenceSelected = (image: ImageInfo) => {
    setEvidence(image);
  };

  const handleCompleteWork = () => {
    if (order?.status === 'finished') {
      Toast.show({
        type: 'error',
        text1: t("error"),
        text2: t("order_already_completed"),
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    setCompleteWorkModalVisible(true);
  };

  const removeDashes = (str: string | undefined | null) => {
    return str ? str.replace(/-/g, '') : '';
  };

  const completeWorkAction = async () => {
    if (!order) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('status', 'finished');

      // Add evidence if provided (optional for admin)
      if (evidence) {
        console.log(`agregando evidencia evidence ${evidence}`);
        const localUri = evidence.uri;
        const filename = localUri.split('/').pop() || 'evidence.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('evidence', {
          uri: localUri,
          name: filename,
          type,
        } as any);
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error(t("no_auth_token"));
      // console.log(`key en info ${removeDashes(order.key)}`);
      const response = await fetch(
        `${url}/orders/status/${removeDashes(order.key)}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t("failed_complete_work"));
      }

      setCompleteWorkModalVisible(false);
      onClose();

      Toast.show({
        type: 'success',
        text1: t("success"),
        text2: t("work_completed_success"),
        position: 'bottom',
        visibilityTime: 4000,
      });

      setEvidence(null);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t("error"),
        text2: error.message || t("failed_complete_work"),
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      setUploading(false);
    }
  };

  const renderInfoItem = (label: string, value: string | number | undefined | null) => {
    const displayValue = value !== undefined && value !== null ? value : t('not_found');

    return (
      <View style={styles.infoItem}>
        <Text style={[styles.label, { color: primaryColor }]}>{label}</Text>
        <Text style={[styles.value, { color: textColor }]}>{displayValue}</Text>
      </View>
    );
  };

  const renderOperators = () => {
    // Procesar agrupamiento
    const groupedOperators = operators.reduce((acc, operator) => {
      const dateKey = new Date(operator.assigned_at).toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(operator);
      return acc;
    }, {} as Record<string, Operator[]>);

    const sortedDates = Object.keys(groupedOperators).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return (
      <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="people" size={20} color={primaryColor} style={styles.cardIcon} />
          <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("assigned_operators")}</Text>
        </View>

        <View style={styles.operatorsContainer}>
          {loadingOperators ? (
            <ActivityIndicator size="small" color={primaryColor} />
          ) : operators.length === 0 ? (
            <Text style={[styles.value, { color: textColor }]}>{t("no_operators")}</Text>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.operatorsGroupContainer}
            >
              {sortedDates.map((date) => (
                <View key={date} style={styles.dateGroup}>
                  <Text style={[styles.dateHeader, { color: textColor }]}>
                    {formatGroupedDate(date)}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.operatorsScroll}
                  >
                    {groupedOperators[date].map((operator) => (
                      <View key={operator.id_assign} style={styles.operatorCard}>
                        <View style={[styles.operatorImageContainer, { borderColor: primaryColor }]}>
                          {operator.photo ? (
                            <Image
                              source={{ uri: operator.photo }}
                              style={styles.operatorImage}
                            />
                          ) : (
                            <Ionicons name="person" size={24} color={primaryColor} />
                          )}
                        </View>
                        <Text style={[styles.operatorName, { color: textColor }]}>
                          {operator.first_name} {operator.last_name}
                        </Text>
                        <Text style={[styles.operatorRole, { color: primaryColor }]}>
                          {operator.rol}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    );
  };

  const renderImageSection = (url: string | null, type: 'dispatchTicket' | 'evidence') => {
    const status = imageStatus[type];
    const label = type === 'dispatchTicket' ? t('dispatch_ticket') : t('evidence');

    return (
      <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.cardHeader}>
          <Ionicons
            name={type === 'dispatchTicket' ? 'document-text' : 'camera'}
            size={20}
            color={primaryColor}
            style={styles.cardIcon}
          />
          <Text style={[styles.cardTitle, { color: primaryColor }]}>{label}</Text>
        </View>

        <View style={styles.imageContainer}>
          {status === 'loading' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          )}

          {status === 'valid' && url && (
            <TouchableOpacity
              style={styles.imageWrapper}
              onPress={() => Linking.openURL(url)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: url }}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImageStatus(prev => ({ ...prev, [type]: 'invalid' }))}
              />
              <View style={styles.viewOverlay}>
                <Ionicons name="eye" size={28} color="#ffffff" />
                <Text style={styles.viewText}>{t("view_full")}</Text>
              </View>
            </TouchableOpacity>
          )}

          {status === 'invalid' && (
            <View style={styles.emptyImageContainer}>
              <Ionicons name="image-outline" size={50} color={borderColor} />
              <Text style={[styles.notFoundText, { color: colors.warning }]}>
                {t("image_not_found")}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render Admin Actions Card
  const renderAdminActions = () => {
    const isAdmin = userRole === 'admin';
    const isEditableStatus = order?.status &&
      order.status.toLowerCase() !== 'finished' &&
      order.status.toLowerCase() !== 'inactive';

    if (!isAdmin || !isEditableStatus) return null;

    return (
      <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark" size={20} color={primaryColor} style={styles.cardIcon} />
          <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("admin_actions")}</Text>
        </View>

        <View style={styles.cardContent}>
          <TouchableOpacity
            style={[
              styles.adminActionButton,
              {
                backgroundColor: order?.status === 'finished' ? '#cccccc' : '#4CAF50',
                opacity: order?.status === 'finished' ? 0.6 : 1
              }
            ]}
            onPress={order?.status === 'finished' ? undefined : handleCompleteWork}
            disabled={order?.status === 'finished'}
          >
            <Ionicons
              name={order?.status === 'finished' ? "checkmark-done" : "checkmark-circle-outline"}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.adminActionButtonText}>
              {order?.status === 'finished' ? t("completed") : t("complete_work")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!order) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={primaryColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: primaryColor }]}>
            {t("order_details")}
          </Text>
          <View style={styles.placeholderIcon} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Reference & Status Banner */}
          <View style={[styles.banner, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.referenceContainer}>
              <Text style={[styles.refLabel, { color: textColor }]}>{t("reference")}</Text>
              <Text style={[styles.refValue, { color: primaryColor }]}>{order.key_ref || t("not_found")}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20', borderColor: getStatusColor(order.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {t(order.status.toLowerCase())}
              </Text>
            </View>
          </View>

          {/* Admin Actions */}
          {renderAdminActions()}

          {/* Basic Info Card */}
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={20} color={primaryColor} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("basic_info")}</Text>
            </View>

            <View style={styles.cardContent}>
              {renderInfoItem(t("date_info_order"), formatDate(order.date))}
              {renderInfoItem(t("weight_info_order"), `${order.weight} Lb`)}
              {renderInfoItem(t("job_info_order"), `#${order.job} - ${order.job_name}`)}
              {renderInfoItem(t("state_info_order"), order.state_usa)}
            </View>
          </View>

          {/* Customer Card */}
          {!isWorkhouse &&
            <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={20} color={primaryColor} style={styles.cardIcon} />
                <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("customer_info")}</Text>
              </View>

              <View style={styles.cardContent}>
                {renderInfoItem(
                  t("name_info_order"),
                  `${order.person?.first_name || ''} ${order.person?.last_name || ''}`
                )}
                {renderInfoItem(t("email_info_order"), order.person?.email)}
                {renderInfoItem(t("phone_info_order"), order.person?.phone)}
                {renderInfoItem(t("address_info_order"), order.person?.address)}
              </View>
            </View>
          }

          {/* Technical Card */}
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="build" size={20} color={primaryColor} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("technical_info")}</Text>
            </View>

            <View style={styles.cardContent}>
              {renderInfoItem(t("customer_factory"), `#${order.customer_factory} - ${order.customer_factory_name}`)}
            </View>
          </View>

          {/* Images */}
          {renderImageSection(order.dispatch_ticket, 'dispatchTicket')}
          {renderImageSection(order.evidence, 'evidence')}
          {renderOperators()}
        </ScrollView>

        {/* Complete Work Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={completeWorkModalVisible}
          onRequestClose={() => setCompleteWorkModalVisible(false)}
          statusBarTranslucent={true}
          hardwareAccelerated={true}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContainer,
              { backgroundColor: isDarkMode ? '#1C3A5A' : '#2A4B8D' }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t("complete_work")} - {order?.key_ref}
                </Text>
                <TouchableOpacity
                  onPress={() => setCompleteWorkModalVisible(false)}
                  style={styles.modalClose}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <Text style={[styles.modalInfoText, { color: '#FFFFFF', marginBottom: 16 }]}>
                  {t("admin_complete_work_info")}
                </Text>

                <Text style={[styles.modalInfoText, { color: '#FFFFFF', marginTop: 10 }]}>
                  {t('evidence')} ({t("optional")})
                </Text>
                <CrossPlatformImageUpload
                  label={t("upload_evidence")}
                  image={evidence}
                  onImageSelected={handleEvidenceSelected}
                  required={false}
                />
              </View>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setCompleteWorkModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#666666' }]}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    { opacity: uploading ? 0.7 : 1 }
                  ]}
                  onPress={completeWorkAction}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalButtonText}>
                      {t('complete_work')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  operatorsGroupContainer: {
    paddingBottom: 16,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  operatorsScroll: {
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  placeholderIcon: {
    width: 24,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  referenceContainer: {
    flex: 1,
  },
  refLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  refValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Admin Actions Styles
  adminActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  adminActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  imageContainer: {
    height: 220,
    width: '100%',
  },
  imageWrapper: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  viewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewText: {
    color: '#ffffff',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  notFoundText: {
    marginTop: 12,
    fontSize: 16,
    fontStyle: 'italic',
  },
  operatorsContainer: {
    padding: 16,
  },
  operatorCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  operatorImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  operatorImage: {
    width: '100%',
    height: '100%',
  },
  operatorName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 80,
  },
  operatorRole: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  modalClose: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalInfoText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
});

export default InfoOrderModal;