// components/operator/DateSelector.tsx
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";

const DateSelector = ({ selectedDate, onDateChange, isDarkMode }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date) => {
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.dateButton, 
          { borderColor: isDarkMode ? '#444' : '#DDD' }
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[
          styles.dateText, 
          { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
        ]}>
          {formatDate(selectedDate)}
        </Text>
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={isDarkMode ? '#FFFFFF' : '#0458AB'} 
        />
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowDatePicker(false);
            date && onDateChange(date);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 15,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
  }
});

export default DateSelector;