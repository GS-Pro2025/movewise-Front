import { Modal, SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { Image } from 'react-native';
import { useRouter } from "expo-router";


interface AddOrderModalProps {
  visible: boolean;
  onClose: () => void;  
}


export default function AddOrderModal({ visible, onClose }: AddOrderModalProps) {
  const [state, setState] = useState('');
  const [date, setDate] = useState('');
  const [keyReference, setKeyReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [weight, setWeight] = useState('');
  const [job, setJob] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter(); // Inicializar router

  const handleSave = async () => {
    if (!validateFields()) return;

    const orderData = { 
      state, date, keyReference, customerName, customerLastName, 
      cellPhone, address, email, weight, job,
    };

    try {
      console.log("Saving order...", orderData);

      // Simula un retraso de 1 segundo como si la API respondiera
      setTimeout(() => {
        console.log("Order saved successfully!");
        onClose();

        setTimeout(() => {
          router.push("/modals/OperatorModal");
        }, 300);
      }, 1000);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const validateFields = () => {
    let newErrors: { [key: string]: string } = {};

    if (!state) newErrors.state = "State is required";
    if (!date) newErrors.date = "Date is required";
    if (!keyReference) newErrors.keyReference = "Key/Reference is required";
    if (!customerName) newErrors.customerName = "Customer Name is required";
    if (!customerLastName) newErrors.customerLastName = "Customer Last Name is required";
    if (!weight) newErrors.weight = "Weight is required";
    if (!job) newErrors.job = "Job is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Devuelve true si no hay errores
  };

  const colorScheme = useColorScheme();
  const imageSource = colorScheme === "dark"
    ? require("../../assets/images/PNG_blanco.png")
    : require("../../assets/images/PNG_negativo.png");

  const styles = StyleSheet.create({
    container: {
      flex: 1, 
      padding: 19,
      paddingTop: 1,
      borderRadius: 10,
      backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff',
    },
    header: {
      backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff',
      paddingVertical: 5,
      flexDirection: 'row', // Poner en fila
      alignItems: 'center', // Centrar verticalmente
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    image: {
      width: 50,  // Ajusta el tamaño deseado
      height: 50,
      resizeMode: 'contain', // Para que no se deforme
      position: 'absolute', // Fija la imagen a la izquierda
      left: 10,
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#0458AB',
      marginTop: 8,
    },
    textLarge: {
      fontSize: 20, 
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#0458AB',
      marginTop: 16, 
      marginBottom: 8, 
    },
    input: {
      borderWidth: 2,
      borderColor: colorScheme === 'dark' ? '#64748b' : '#0458AB',
      backgroundColor: colorScheme === 'dark' ? '#FFFFFF36' : '#ffffff',
      padding: 8,
      borderRadius: 8,
      color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
    },
    buttonContainer: {
      flexDirection: 'row', 
      justifyContent: 'center',
      marginTop: 16,
    },
    buttonCancel: {
      backgroundColor: colorScheme === 'dark' ? '#0458AB' : '#545257',
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
      marginRight: 8,
    },
    buttonSave: {
      backgroundColor: colorScheme === 'dark' ? '#FFFFFF' : '#0458AB',
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
    },
    buttonTextCancel: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    buttonTextSave: {
      color: colorScheme === 'dark' ? '#0458AB' : '#FFFFFF',
      fontWeight: 'bold',
    },
    required: {
      color: '#FF0000',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#FFFFFF' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

          <View style={styles.header}>
            <Image source={imageSource} style={styles.image} />
            <Text style={styles.textLarge}>Add Order</Text>
          </View>

          <ThemedView style={styles.container}>
            {/* Aquí comienzan los campos que tenías */}
            <Text style={styles.text}>State <Text style={styles.required}>(*)</Text></Text>
            <View style={[styles.input, { justifyContent: "center", height: 40 }, errors.state && { borderColor: "red" }]}>
              <Picker
                selectedValue={state}
                onValueChange={(itemValue) => {
                  setState(itemValue);
                  setErrors((prev) => ({ ...prev, state: "" })); 
                }}
                style={{ width: "100%", color: state === "" ? "#9ca3af" : "#000000" }}
              >
                <Picker.Item label="Select State" value="" enabled={false} color="#9ca3af" />
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="Completed" value="completed" />
              </Picker>
            </View>

            <Text style={styles.text}>Date <Text style={styles.required}>(*)</Text></Text>
            <TextInput 
              style={[styles.input, errors.date ? { borderColor: "red", borderWidth: 2 } : {}]}  
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9ca3af"
              value={date}
              onChangeText={(text) => {
                setDate(text);
                setErrors((prev) => ({ ...prev, date: "" }));
              }} 
            />

            <Text style={styles.textLarge}>General Data</Text>
            
            <Text style={styles.text}>Key/Reference <Text style={styles.required}>(*)</Text></Text>
            <TextInput style={styles.input} placeholder="Key/Reference" placeholderTextColor="#9ca3af" value={keyReference} onChangeText={setKeyReference} />

            <Text style={styles.text}>Customer Name <Text style={styles.required}>(*)</Text></Text>
            <TextInput style={styles.input} placeholder="Customer Name" placeholderTextColor="#9ca3af" value={customerName} onChangeText={setCustomerName} />

            <Text style={styles.text}>Customer Last Name <Text style={styles.required}>(*)</Text></Text>
            <TextInput style={styles.input} placeholder="Customer Last Name" placeholderTextColor="#9ca3af" value={customerLastName} onChangeText={setCustomerLastName} />

            <Text style={styles.text}>Cell Phone Number</Text>
            <TextInput style={styles.input} placeholder="Cell Phone" placeholderTextColor="#9ca3af" value={cellPhone} onChangeText={setCellPhone} />

            <Text style={styles.text}>Address</Text>
            <TextInput style={styles.input} placeholder="Address" placeholderTextColor="#9ca3af" value={address} onChangeText={setAddress} />

            <Text style={styles.text}>Email</Text>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} />

            <Text style={styles.text}>Weight (kg) <Text style={styles.required}>(*)</Text></Text>
            <TextInput style={styles.input} placeholder="0.0" placeholderTextColor="#9ca3af" value={weight} onChangeText={setWeight} keyboardType="numeric" />

            <Text style={styles.text}>Job <Text style={styles.required}>(*)</Text></Text>
            <View style={[styles.input, { justifyContent: "center", height: 40 }, errors.job && { borderColor: "red" }]}>
              <Picker
                selectedValue={job}
                onValueChange={(itemValue) => {
                  setJob(itemValue);
                  setErrors((prev) => ({ ...prev, job: "" })); // Borra el error si el usuario selecciona algo
                }}
                style={{ width: "100%", color: job === "" ? "#9ca3af" : "#000000" }}
              >
                <Picker.Item label="Select Job" value="" enabled={false} color="#9ca3af" />
                <Picker.Item label="Delivery" value="delivery" />
                <Picker.Item label="Pick-up" value="pickup" />
              </Picker>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                <Text style={styles.buttonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
                <Text style={styles.buttonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
