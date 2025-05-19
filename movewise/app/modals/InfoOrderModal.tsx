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
  Dimensions
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '../Colors';
import { Order } from './OrderModal';
import { GetAssignedOperators } from '@/hooks/api/GetAssignedOperators';


interface Operator {
  id_assign: number;
  photo: string | null;
  first_name: string;
  last_name: string;
  rol: string;
}


interface InfoOrderModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
}

const InfoOrderModal: React.FC<InfoOrderModalProps> = ({ visible, onClose, order }) => {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return primaryColor;
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

  const renderOperators = () => (
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
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.operatorsScroll}
          >
            {operators.map((operator) => (
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
        )}
      </View>
    </View>
  );

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

          {/* Basic Info Card */}
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={20} color={primaryColor} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: primaryColor }]}>{t("basic_info")}</Text>
            </View>

            <View style={styles.cardContent}>
              {renderInfoItem(t("date_info_order"), formatDate(order.date))}
              {renderInfoItem(t("weight_info_order"), `${order.weight} kg`)}
              {renderInfoItem(t("job_info_order"), `#${order.job} - ${order.job_name}`)}
              {renderInfoItem(t("state_info_order"), order.state_usa)}
            </View>
          </View>

          {/* Customer Card */}
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
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  //operators styles
   operatorsScroll: {
    paddingRight: 16, // Previene el corte del último elemento
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
});

export default InfoOrderModal;