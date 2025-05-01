import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface EmptyListProps {
  message: string;
  date: Date;
  isDarkMode: boolean;
}

const EmptyList: React.FC<EmptyListProps> = ({ message, date, isDarkMode }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="calendar-outline" 
        size={50} 
        color={isDarkMode ? '#FFFFFF80' : '#0458AB80'} 
      />
      <Text style={[styles.emptyText, { color: isDarkMode ? '#FFFFFF' : '#666666' }]}>
        {t(message)} {t('for_date')} {date.toLocaleDateString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
  },
});

export default EmptyList;