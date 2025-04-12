"use client";

import {
  Modal,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from "react";
import { ThemedView } from "../../components/ThemedView";
import { useRouter } from "expo-router";
import AddOrderformApi from "@/hooks/api/AddOrderFormApi";
import type { AddOrderForm } from "@/models/ModelAddOrderForm";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform } from "react-native";
import type { job } from "@/models/ModelJob";
import { ListJobs } from "@/hooks/api/JobClient";
import { ListCompanies } from "@/hooks/api/CompanyClient";
import { ListStates } from "@/hooks/api/StatesClient";
import { Image, useColorScheme } from "react-native";

interface AddOrderModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddOrderModal({
  visible,
  onClose,
}: AddOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term
  const [openJob, setOpenJob] = useState(false);
  const [job, setJob] = useState<string | null>(null);
  const [openCompany, setOpenCompany] = useState(false);
  const [company, setCompany] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [keyReference, setKeyReference] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [cellPhone, setCellPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [weight, setWeight] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [jobList, setJobList] = useState<job[]>([]);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [hasDrivingLicense, setHasDrivingLicense] = useState<
    "yes" | "no" | null
  >(null);
  const [selectedDrivingLicense, setSelectedDrivingLicense] = useState<
    "yes" | "no" | null
  >(null);

  const router = useRouter();
  const { saveOrder, isLoading, error } = AddOrderformApi();

  const handleSave = async () => {
    if (!validateFields()) return;
    const orderData: AddOrderForm = {
      status: "Pending",
      date: date || "",
      key_ref: keyReference,
      address: address,
      state_usa: state || "",
      phone: cellPhone,
      person: {
        first_name: customerName,
        last_name: customerLastName,
        address: address,
        email: email,
      },
      weight: weight,
      job: job || "",
      company: company || "",
    };

    try {
      const savedOrder = await saveOrder(orderData);
      console.log("info", savedOrder);
      if (savedOrder) {
        console.log("Order saved successfully!", saveOrder);
        alert("Order saved successfully!");
        setTimeout(() => {
          onClose();
          router.push("/modals/OperatorModal");
        }, 3000);
      }
      console.log("Saving order...", orderData);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const fetchStates = async () => {
    try {
      const states = await ListStates();
      setStateList(states);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const jobs = await ListJobs();
      setJobList(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companies = await ListCompanies();
      setCompanyList(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchStates();
  }, []);

  //   const validateFields = () => {
  //     const newErrors: { [key: string]: string } = {};
  //     if (!state) newErrors.state = "State is required";
  //     if (!date) newErrors.date = "Date is required";
  //     if (!keyReference) newErrors.keyReference = "Key/Reference is required";
  //     if (!customerName) newErrors.customerName = "Customer Name is required";
  //     if (!customerLastName)
  //       newErrors.customerLastName = "Customer Last Name is required";
  //     if (!weight) newErrors.weight = "Weight is required";
  //     if (!job) newErrors.job = "Job is required";
  //     if (!company) newErrors.company = "Company is required";

  //     setErrors(newErrors);
  //     return Object.keys(newErrors).length === 0;
  //   };

  const colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 19,
      paddingTop: 1,
      borderRadius: 10,
      backgroundColor: colorScheme === "dark" ? "#112A4A" : "#ffffff",
    },
    header: {
      backgroundColor: colorScheme === "dark" ? "#112A4A" : "#ffffff",
      paddingVertical: 5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 2,
      borderBottomColor:
        colorScheme === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.1)",
    },
    image: {
      width: 50,
      height: 50,
      resizeMode: "contain",
      position: "absolute",
      left: 10,
    },
    text: {
      fontSize: 14,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#ffffff" : "#0458AB",
      marginTop: 8,
    },
    textLarge: {
      fontSize: 18,
      fontWeight: "bold",
      color: colorScheme === "dark" ? "#ffffff" : "#0458AB",
      marginTop: 16,
      marginBottom: 8,
    },
    textLargeTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: colorScheme === "dark" ? "#ffffff" : "#0458AB",
      marginTop: 16,
      marginBottom: 8,
    },
    input: {
      borderWidth: 2,
      borderColor: colorScheme === "dark" ? "#9ca3af" : "#0458AB",
      backgroundColor: colorScheme === "dark" ? "#FFFFFF36" : "#ffffff",
      padding: 8,
      borderRadius: 8,
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 60,
    },
    buttonCancel: {
      backgroundColor: colorScheme === "dark" ? "#0458AB" : "#545257",
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: "center",
      marginRight: 8,
    },
    buttonBack: {
      backgroundColor: colorScheme === "dark" ? "#0458AB" : "#60A3D9",
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: "center",
      marginRight: 8,
    },
    buttonNext: {
      backgroundColor: colorScheme === "dark" ? "#FFFFFF" : "#0458AB",
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: "center",
    },
    buttonTextCancel: {
      color: "#FFFFFF",
      fontWeight: "bold",
    },
    buttonTextBack: {
      color: colorScheme === "dark" ? "#0458AB" : "#FFFFFF",
      fontWeight: "bold",
    },
    buttonTextNext: {
      color: colorScheme === "dark" ? "#ffffff" : "#FFFFFF",
      fontWeight: "bold",
    },
    required: {
      color: "#FF0000",
    },
    stepperImage: {
      width: 200, // ancho específico en px
      height: 40,
      marginBottom: 10,
      marginTop: 10,
      padding: 20,
      alignSelf: "center",
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colorScheme === "dark" ? "#112A4A" : "#FFFFFF",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={styles.header}>
              <Text style={styles.textLargeTitle}>Operator Registration</Text>
            </View>

            <Image
              source={require("../../assets/images/paso_2.png")} // ajusta la ruta
              style={styles.stepperImage}
            />

            <ThemedView style={styles.container}>
              <Text style={styles.textLarge}>Driving Licence</Text>

              <Text style={styles.text}>
                Driving permit <Text style={styles.required}>(*)</Text>
              </Text>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                {[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                    onPress={() =>
                      setHasDrivingLicense(option.value as "yes" | "no")
                    }
                  >
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: "#0458AB",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8,
                      }}
                    >
                      {hasDrivingLicense === option.value && (
                        <View
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: "#0458AB",
                          }}
                        />
                      )}
                    </View>
                    <Text style={styles.text}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.text}>
                Driving licence number <Text style={styles.required}>(*)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="010100"
                placeholderTextColor="#9ca3af"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
              <View style={{ zIndex: 2000 }}>
                <Text style={styles.text}>
                  Expiry date <Text style={styles.required}>(*)</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setDatePickerVisibility(true)}
                  style={[
                    styles.input,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                  ]}
                >
                  <Text style={{ color: date ? "#000" : "#9ca3af" }}>
                    {date ? date : "01/01/2025"}
                  </Text>
                  <MaterialIcons
                    name="calendar-today"
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={(selectedDate) => {
                    setDatePickerVisibility(false);
                    setDate(selectedDate.toISOString().split("T")[0]);
                  }}
                  onCancel={() => setDatePickerVisibility(false)}
                />
              </View>

              <Text style={styles.text}>
                Licence photo <Text style={styles.required}>(*)</Text>
              </Text>

              <Text style={styles.textLarge}>Family information</Text>
              <Text style={styles.text}>
                Name parent/guardian <Text style={styles.required}></Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="select Type"
                placeholderTextColor="#9ca3af"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
              <Text style={styles.text}>
                Cell Phone parent/guardian{" "}
                <Text style={styles.required}>(*)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="100101010"
                placeholderTextColor="#9ca3af"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />

              <View style={{ zIndex: 1000 }}>
                <Text style={styles.text}>
                  state <Text style={styles.required}>(*)</Text>
                </Text>
                <DropDownPicker
                  open={openJob}
                  value={job || ""}
                  items={jobList.map((jobItem) => ({
                    label: jobItem.name,
                    value: jobItem.id,
                  }))}
                  setOpen={setOpenJob}
                  setValue={setJob}
                  setItems={() => {}}
                  placeholder="Select State"
                  placeholderStyle={{ color: "#9ca3af" }} //aqui para cambiar el color de state, solamente de aqui
                  style={[
                    styles.input,
                    { borderColor: errors.job ? "#9ca3af" : "#0458AB" }, //en job se llamaria otro controlador si no estoy mal
                  ]}
                  listMode="SCROLLVIEW"
                  dropDownContainerStyle={{ maxHeight: 200 }} // Set max height for dropdown
                />
              </View>

              <Text style={styles.text}>
                Minor children <Text style={styles.required}>(*)</Text>
              </Text>

              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                {[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ].map((drivingLicenseOption) => (
                  <TouchableOpacity
                    key={drivingLicenseOption.value}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                    onPress={() =>
                      setSelectedDrivingLicense(
                        drivingLicenseOption.value as "yes" | "no"
                      )
                    }
                  >
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: "#0458AB",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8,
                      }}
                    >
                      {selectedDrivingLicense ===
                        drivingLicenseOption.value && (
                        <View
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: "#0458AB",
                          }}
                        />
                      )}
                    </View>
                    <Text style={styles.text}>
                      {drivingLicenseOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.text}>
                Number of children <Text style={styles.required}>(*)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />

              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: colorScheme === "dark" ? "#9ca3af" : "#0458AB",
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 5,
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(4, 88, 171, 0.05)",
                  }}
                >
                  <Text style={styles.text}>
                    Son's name <Text style={styles.required}>(*)</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor="#9ca3af"
                  />

                  <Text style={styles.text}>
                    Date of birth <Text style={styles.required}>(*)</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDatePickerVisibility(true)}
                    style={[
                      styles.input,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      },
                    ]}
                  >
                    <Text style={{ color: date ? "#000" : "#9ca3af" }}>
                      01/01/2025
                    </Text>
                    <MaterialIcons
                      name="calendar-today"
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.buttonCancel}
                  onPress={() => router.back()}
                >
                  <Text style={styles.buttonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonNext}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonTextBack}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonBack}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonTextNext}>Next</Text>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
