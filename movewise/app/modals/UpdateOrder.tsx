import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { useRouter } from "expo-router";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareView } from '../../components/KeyboardAwareView';

// Props for the modal, including visibility, close function, and order data
interface UpdateOrderModalProps {
  visible?: boolean; // Determines if the modal is visible
  onClose?: () => void; // Function to call when closing the modal
  orderData: { // Object containing order details
    key : string;
    state_usa: string; // State of the order
    date: string; // Date of the order
    key_ref: string; // Reference key for the order
    person: { // Customer information
      first_name: string; // Customer's first name
      last_name: string; // Customer's last name
      email: string; // Customer's email
    };
    phone: string; // Customer's phone number
    address: string; // Customer's address
    weight: string; // Weight of the order
  };
}

export default function UpdateOrderModal({ visible = true, onClose, orderData }: UpdateOrderModalProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  console.log(orderData);
  // State variables for form fields
  const [state, setState] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [keyReference, setKeyReference] = useState('');
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const colorScheme = useColorScheme();

  // Effect to populate form fields with order data when modal is visible
  useEffect(() => {
    if (visible && orderData) {
      setKey(orderData.key || '');
      setState(orderData.state_usa || null);
      setDate(orderData.date || null);
      setKeyReference(orderData.key_ref || '');
      setCustomerFirstName(orderData.person?.first_name || '');
      setCustomerLastName(orderData.person?.last_name || '');
      setCellPhone(orderData.phone || '');
      setAddress(orderData.address || '');
      setEmail(orderData.person?.email || '');
      setWeight(orderData.weight || '');
      setErrors({});
    }
  }, [orderData, visible]);

  // Function to validate form fields
  const validateFields = () => {
    let newErrors: { [key: string]: string } = {};
    if (!state) newErrors.state = "State is required";
    if (!date) newErrors.date = "Date is required";
    if (!keyReference) newErrors.keyReference = "Reference is required";
    if (!customerFirstName) newErrors.customerFirstName = "Customer's first name is required";
    if (!customerLastName) newErrors.customerLastName = "Customer's last name is required";
    if (!weight) newErrors.weight = "Weight is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // Function to handle order update
  const handleUpdate = () => {
    if (!validateFields()) return; // Validate fields before updating
    console.log("updating order with key: ", key);
    // Alert.alert("Order updated successfully"); // Alert on successful update
    // router.back(); // Navigate back after update
  };

  // Function to handle modal close
  const handleClose = () => {
    if (onClose) {
      onClose(); // Call onClose if provided
    } 
    else {
      router.replace("/modals/OrderModal"); // Navigate to OrderModal if no onClose
    }
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#FFFFFF' }}>
        <KeyboardAwareView style={{ flex: 1 }}>
          <ThemedView style={{ padding: 19, flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colorScheme === 'dark' ? '#ffffff' : '#0458AB', marginBottom: 20 }}>Update Order</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>State <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <DropDownPicker
                open={dropdownOpen}
                value={state}
                items={[
                  { label: 'Wisconsin', value: 'WI' },
                  { label: 'New York', value: 'NY' }, 
                  { label: 'California', value: 'CA' },
                  { label: 'Texas', value: 'TX' },
                  { label: 'Florida', value: 'FL' },
                ]}
                setOpen={setDropdownOpen}
                setValue={setState}
                placeholder="Select State"
                style={styles.dropdown}
                containerStyle={dropdownOpen ? { zIndex: 1000 } : undefined}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setDatePickerVisibility(true)}
              >
                <Text style={styles.dateButtonText}>{date ? date : "Select date"}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(selectedDate) => {
                  setDatePickerVisibility(false);
                  setDate(selectedDate.toISOString().split('T')[0]); // Format date to YYYY-MM-DD
                }}
                onCancel={() => setDatePickerVisibility(false)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Reference <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <TextInput
                value={keyReference}
                onChangeText={setKeyReference}
                placeholder="Reference"
                style={styles.input}
              />
              {errors.keyReference && <Text style={styles.errorText}>{errors.keyReference}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Customer's First Name <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <TextInput
                value={customerFirstName}
                onChangeText={setCustomerFirstName}
                placeholder="Customer's First Name"
                style={styles.input}
              />
              {errors.customerFirstName && <Text style={styles.errorText}>{errors.customerFirstName}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Customer's Last Name <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <TextInput
                value={customerLastName}
                onChangeText={setCustomerLastName}
                placeholder="Customer's Last Name"
                style={styles.input}
              />
              {errors.customerLastName && <Text style={styles.errorText}>{errors.customerLastName}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight (kg) <Text style={{ color: '#FF0000' }}>(*)</Text></Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="Weight (kg)"
                keyboardType="numeric"
                style={styles.input}
              />
              {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </KeyboardAwareView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  dropdown: {
    borderColor: '#ddd',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  dateButtonText: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'red',
    fontWeight: 'bold',
  },
  updateButton: {
    backgroundColor: '#0458AB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});