import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import HeaderWithDivider from "@/components/HeaderWithDivider";
import { CreateTruck } from "@/hooks/api/TruckClient";
import { ModelAddTruck } from "@/models/ModelAddTruck";
import Toast from "react-native-toast-message";

const CreateTruckScreen: React.FC = () => {
  const navigation = useNavigation();
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");

  const [errors, setErrors] = useState({
    type: false,
    category: false,
    name: false,
    number: false,
  });

  const [loading, setLoading] = useState(false); // Estado de carga

  const validateFields = () => {
    const newErrors = {
      type: !type,
      category: !category,
      name: !name.trim(),
      number: !number.trim(),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    const newTruck: ModelAddTruck = {
      number_truck: number,
      type: type,
      rol: category,
      name: name,
    };

    setLoading(true); // Mostrar carga

    try {
      await CreateTruck(newTruck);
      console.log("Camión creado:", newTruck);
      Toast.show({
        type: "success",
        text1: "Camion creado",
      });
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error al crear el camión:", error);
      setLoading(false);
      Toast.show({
        type: "error", // Cambié el tipo a error
        text1: "Error",
        text2: "Error al crear el camión",
      });
    }
  };

  return (
    <View style={styles.container}>
      <HeaderWithDivider />

      <View style={styles.form}>
        <Text style={styles.label}>
          Type <Text style={styles.required}>*</Text>
        </Text>
        <View
          style={[styles.pickerContainer, errors.type && styles.errorBorder]}
        >
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Type" value="" />
            <Picker.Item label="Refrigerated" value="Refrigerated" />
            <Picker.Item label="Tanker" value="Tanker" />
            <Picker.Item label="Flatbed" value="Flatbed" />
            <Picker.Item label="Cargo" value="Cargo" />
          </Picker>
        </View>

        <Text style={styles.label}>
          Category <Text style={styles.required}>*</Text>
        </Text>
        <View
          style={[styles.pickerContainer, errors.category && styles.errorBorder]}
        >
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Category" value="" />
            <Picker.Item label="Category A" value="a" />
            <Picker.Item label="Category B" value="b" />
          </Picker>
        </View>

        <Text style={styles.label}>
          Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.name && styles.errorBorder]}
          placeholder="Truck Name"
          placeholderTextColor="#ccc"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>
          Number of Truck <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.number && styles.errorBorder]}
          placeholder="0.0"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
          value={number}
          onChangeText={setNumber}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading} // Deshabilitar el botón mientras carga
          >
            <Text style={styles.saveText}>
              {loading ? "Guardando..." : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CreateTruckScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    color: "#0458AB",
    marginBottom: 4,
    marginTop: 12,
  },
  required: {
    color: "red",
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: "#0458AB",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  picker: {
    height: Platform.OS === "ios" ? 200 : 48,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#0458AB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  errorBorder: {
    borderColor: "red",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    width: "48%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#3C3C3C",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#79B6EC",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
