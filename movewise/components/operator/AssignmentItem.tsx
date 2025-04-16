// components/operator/AssignmentItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Assignment } from './BaseOperator';

interface AssignmentItemProps {
  item: Assignment;
  showRole?: boolean;
  onPress: (item: Assignment) => void;
  isDarkMode: boolean;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({ 
  item, 
  showRole = true, 
  onPress, 
  isDarkMode 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.card,
        { backgroundColor: isDarkMode ? '#1C3A5A' : '#F5F5F5' }
      ]} 
      onPress={() => onPress(item)}
    >
      <View style={styles.header}>
        <Text style={[
          styles.title,
          { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
        ]}>
          {item.data_order.key_ref || 'No Reference'}
        </Text>
        {showRole && item.rol && (
          <View style={[
            styles.roleBadge,
            { backgroundColor: isDarkMode ? '#0458AB80' : '#0458AB20' }
          ]}>
            <Text style={[
              styles.roleText,
              { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
            ]}>
              {item.rol}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons 
          name="location-outline" 
          size={16} 
          color={isDarkMode ? '#FFFFFF80' : '#66666680'} 
        />
        <Text style={[
          styles.infoText,
          { color: isDarkMode ? '#FFFFFF' : '#666666' }
        ]}>
          {item.data_order.state_usa || 'No location'}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons 
          name="person-outline" 
          size={16} 
          color={isDarkMode ? '#FFFFFF80' : '#66666680'} 
        />
        <Text style={[
          styles.infoText,
          { color: isDarkMode ? '#FFFFFF' : '#666666' }
        ]}>
          {item.data_order.person.first_name} {item.data_order.person.last_name}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons 
          name="briefcase-outline" 
          size={16} 
          color={isDarkMode ? '#FFFFFF80' : '#66666680'} 
        />
        <Text style={[
          styles.infoText,
          { color: isDarkMode ? '#FFFFFF' : '#666666' }
        ]}>
          {item.data_order.status || 'No status'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 5,
  },
});

export default AssignmentItem;