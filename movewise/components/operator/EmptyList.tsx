// components/operator/EmptyList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

interface EmptyListProps {
  message: string;
  date: Date;
  isDarkMode: boolean;
}

const EmptyList: React.FC<EmptyListProps> = ({ message, date, isDarkMode }) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="calendar-outline" 
        size={50} 
        color={isDarkMode ? '#FFFFFF80' : '#0458AB80'} 
      />
      <Text style={[styles.emptyText, { color: isDarkMode ? '#FFFFFF' : '#666666' }]}>
        {message} para {date.toLocaleDateString()}
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
