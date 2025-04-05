    import { Modal, SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
    import DropDownPicker from "react-native-dropdown-picker";
    import { useState } from 'react';
    import { ThemedView } from '../../components/ThemedView';
    import { Image } from 'react-native';
    import { useRouter } from "expo-router";
    import AddOrderformApi from '@/hooks/api/AddOrderFormApi';
    import { AddOrderForm } from '@/models/ModelAddOrderForm';
    import DateTimePickerModal from "react-native-modal-datetime-picker";4
    import { MaterialIcons } from '@expo/vector-icons';
    import { KeyboardAvoidingView, Platform } from 'react-native';
    import { job } from '@/models/ModelJob';
    import { List } from 'lucide-react-native';
    import { ListJobs } from '@/hooks/api/JobClient';

    interface AddOrderModalProps {
      visible: boolean;
      onClose: () => void;  
    }


    export default function AddOrderModal({ visible, onClose }: AddOrderModalProps) {
      const [open, setOpen] = useState(false);
      const [state, setState] = useState<string | null>(null); // Asegura que es string o null      
      const [openJob, setOpenJob] = useState(false);
      const [job, setJob] = useState<string | null>(null);
      const [date, setDate] = useState<Date | null>(null);
      const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
      const [keyReference, setKeyReference] = useState('');
      const [customerName, setCustomerName] = useState('');
      const [customerLastName, setCustomerLastName] = useState('');
      const [cellPhone, setCellPhone] = useState('');
      const [address, setAddress] = useState('');
      const [email, setEmail] = useState('');
      const [weight, setWeight] = useState('');
      const [errors, setErrors] = useState<{ [key: string]: string }>({});

      const router = useRouter(); // Inicializar router
      const { saveOrder, isLoading, error } = AddOrderformApi();

      const handleSave = async () => {
        if (!validateFields()) return;

      
        const orderData: AddOrderForm = {
          state: state || "", date: date ? date.toISOString() : "", keyReference, customerName, customerLastName, 
          cellPhone, address, email, weight, job: job || "",
        };

        try {
          const savedOrder = await saveOrder(orderData);

          if (savedOrder) {
            console.log("Order saved successfully!");
            onClose();
            router.push("/modals/OperatorModal");
          }
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
      let ObjListJobs: job[] = [];

      
      const fetchJobs = async () => {
        try {
          ObjListJobs = await ListJobs();
          console.log(ObjListJobs); // Verifica los datos obtenidos
        } catch (error) {
          console.error('Error al obtener los jobs:', error);
        }
      };
      
      fetchJobs(); // Llamar la función para obtener los datos
      
    
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true} // ✅ Permite listas anidadas
        >
          <View style={styles.header}>
            <Image source={imageSource} style={styles.image} />
            <Text style={styles.textLarge}>Add Order</Text>
          </View>

          <ThemedView style={styles.container}>
            <View style={{ zIndex: 2000 }}> 
              <Text style={styles.text}>State <Text style={styles.required}>(*)</Text></Text>
              <DropDownPicker
                open={open} value={state || ""}
                items={[{ label: "Pending", value: "pending" }, { label: "Completed", value: "completed" }]}
                setOpen={setOpen} setValue={setState} setItems={() => {}}
                placeholder="Select State" 
                placeholderStyle={{ color: '#9ca3af' }}
                style={[styles.input, { borderColor: errors.state ? "red" : "#0458AB" }]}
                listMode="SCROLLVIEW"

              />
            </View>

            <Text style={styles.text}>Date <Text style={styles.required}>(*)</Text></Text>
            <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={[styles.input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
              <Text style={{ color: date ? "#000" : "#9ca3af" }}>{date ? date.toLocaleDateString() : "Select a date"}</Text>
              <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <DateTimePickerModal 
              isVisible={isDatePickerVisible} mode="date"
              onConfirm={(selectedDate) => { setDatePickerVisibility(false); setDate(selectedDate); }}
              onCancel={() => setDatePickerVisibility(false)}
            />

            <View style={{ zIndex: 2000 }}> 
              <Text style={styles.text}>Company customer</Text>
              <DropDownPicker
                open={open} value={state || ""}
                items={[{ label: "Pending", value: "pending" }, { label: "Completed", value: "completed" }]}
                setOpen={setOpen} setValue={setState} setItems={() => {}}
                placeholder="Select State" 
                placeholderStyle={{ color: '#9ca3af' }}
                style={[styles.input, { borderColor: errors.state ? "red" : "#0458AB" }]}
                listMode="SCROLLVIEW"

              />
            </View>


            <Text style={styles.textLarge}>General Data</Text>

            {[
              { label: "Key/Reference", state: keyReference, setState: setKeyReference, keyboardType: "default" },
              { label: "Customer Name", state: customerName, setState: setCustomerName, keyboardType: "default" },
              { label: "Customer Last Name", state: customerLastName, setState: setCustomerLastName, keyboardType: "default" },
            ].map((input, index) => (
              <View key={index}>
                <Text style={styles.text}>{input.label} <Text style={styles.required}>(*)</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder={input.label}
                  placeholderTextColor="#9ca3af"
                  value={input.state}
                  onChangeText={input.setState}
                  keyboardType={input.keyboardType as "default" | "numeric"}  
                />
              </View>
            ))}

            <Text style={styles.text}>Cell Phone Number</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Cell Phone Number" 
              placeholderTextColor="#9ca3af" 
              value={cellPhone} 
              onChangeText={setCellPhone} 
              keyboardType="numeric"
            />

            <Text style={styles.text}>Address</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Address" 
              placeholderTextColor="#9ca3af" 
              value={address} 
              onChangeText={setAddress} 
            />

            <Text style={styles.text}>Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              placeholderTextColor="#9ca3af" 
              value={email} 
              onChangeText={setEmail} 
            />

            <Text style={styles.text}>Weight (kg) <Text style={styles.required}>(*)</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="Weight (kg)" 
              placeholderTextColor="#9ca3af" 
              value={weight} 
              onChangeText={setWeight} 
              keyboardType="numeric"
            />

            <View style={{ zIndex: 1000 }}> 
              <Text style={styles.text}>Job <Text style={styles.required}>(*)</Text></Text>
              <DropDownPicker
                open={openJob} value={job || ""}
                items={[{ label: "Delivery", value: "delivery" }, { label: "Pick-up", value: "pickup" }]}
                setOpen={setOpenJob} setValue={setJob} setItems={() => {}}
                placeholder="Select Job" 
                placeholderStyle={{ color: '#9ca3af' }}
                style={[styles.input, { borderColor: errors.job ? "red" : "#0458AB" }]}
                listMode="SCROLLVIEW"
              />
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>
);
}
