import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import AddOrderForm from "./modals/AddOrderForm";


export default function OperatorsScreen() {
  const [operators, setOperators] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 80,
      backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff',
    },
    header: {
      backgroundColor: colorScheme === 'dark' ? '#112A4A' : '#ffffff',
      flexDirection: "row",
      justifyContent: "center", // Centra el título
      alignItems: "center",
      paddingBottom: 20,
      paddingTop: 30, 
      borderBottomWidth: 2,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      width: "100%",
      position: "relative", // Permite usar posición absoluta en hijos
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colorScheme === 'dark' ? '#FFFFFF' : '#0458AB',
      marginTop: 25,
    },
    addButton: {
      position: "absolute",
      right: 10, 
      top: 50, // Mueve el boton en vertical
      backgroundColor: colorScheme === 'dark' ? "#FFF" : "#0458AB",
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    plus: {
      fontSize: 24,
      color: colorScheme === 'dark' ? "#0458AB" : "#FFF",
      fontWeight: "bold",
    },
    operatorItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },
    icon: {
      width: 30,
      height: 30,
      marginRight: 10,
    },
    operatorText: {
      fontSize: 16,
      color: "#0458AB",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center", 
      gap: 120,
      marginTop: 20,
    },
    backButton: {
      backgroundColor: colorScheme === 'dark' ? '#0458AB' : '#545257',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    saveButton: {
      backgroundColor: colorScheme === 'dark' ? '#FFFFFF' : '#0458AB',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    backButtonText: {
        color: "#FFF", // Texto blanco para Back
        fontWeight: "bold",
      },
    saveButtonText: {
      color: colorScheme === 'dark' ? '#0458AB' : '#FFFFFF',
      fontWeight: "bold",
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#A1C6EA" }}>
      {/* Header fuera del container */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>     
        <Text style={styles.title}>Operators</Text>
      </View>

      <View style={styles.container}>
        <AddOrderForm visible={modalVisible} onClose={() => setModalVisible(false)} />

        {/* Operators List */}
        <FlatList
          data={operators}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.operatorItem}>
            <Image source={require("../assets/images/PNG_blanco.png")} style={styles.icon} />
              <Text style={styles.operatorText}>{item}</Text>
            </View>
          )}
        />

        <View style={styles.buttonContainer}>
        <TouchableOpacity 
  style={styles.backButton} 
  onPress={() => setModalVisible(false)} // Solo cierra el modal
>
  <Text style={styles.backButtonText}>Back</Text>
</TouchableOpacity>

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
