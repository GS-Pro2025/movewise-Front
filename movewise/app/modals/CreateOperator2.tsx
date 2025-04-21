
// import { Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity } from "react-native"
// import { ThemedView } from "../../components/ThemedView"
// import { useRouter } from "expo-router"
// import DateTimePickerModal from "react-native-modal-datetime-picker"
// import { MaterialIcons } from "@expo/vector-icons"
// import { KeyboardAvoidingView, Platform } from "react-native"
// import { useColorScheme } from "react-native"
// import { useState, useEffect } from "react"
// import { Image, View, StyleSheet } from "react-native"
// import * as ImagePicker from "expo-image-picker"

// interface CreateOperator2 {
//   visible: boolean
//   onClose: () => void
// }

// export default function CreateOperator2({ visible, onClose }: CreateOperator2) {
//   const [date, setDate] = useState<string | null>(null)
//   const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
//   const [Driving, setDriving] = useState("")
//   const [NameParent, setNameParent] = useState("")
//   const [CellPhone, setCellPhone] = useState("")
//   const [NumberChildren, setNumberChildren] = useState("")

//   const [hasDrivingLicense, setHasDrivingLicense] = useState<"yes" | "no" | null>(null)
//   const [selectedDrivingLicense, setSelectedDrivingLicense] = useState<"yes" | "no" | null>(null)
//   const router = useRouter()
//   const [licencePhoto1, setLicencePhoto1] = useState<string | null>(null)
//   const [licencePhoto2, setLicencePhoto2] = useState<string | null>(null)
//   // Add new state variables for children
//   const [numberOfChildren, setNumberOfChildren] = useState("0")
//   const [showChildrenDropdown, setShowChildrenDropdown] = useState(false)
//   const [childrenData, setChildrenData] = useState<Array<{ name: string; birthDate: string }>>([])
//   const [childBirthDateIndex, setChildBirthDateIndex] = useState<number | null>(null)

//   const colorScheme = useColorScheme()

//   useEffect(() => {
//     ;(async () => {
//       const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()
//       const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
//       if (cameraStatus.status !== "granted" || mediaLibraryStatus.status !== "granted") {
//         alert("Se necesitan permisos para acceder a la cámara y a la galería de fotos.")
//       }
//     })()
//   }, [])

//   // Update children data when number of children changes
//   useEffect(() => {
//     const count = Number.parseInt(numberOfChildren)
//     const newChildrenData = [...childrenData]

//     // Add or remove children data as needed
//     while (newChildrenData.length < count) {
//       newChildrenData.push({ name: "", birthDate: "" })
//     }
//     while (newChildrenData.length > count) {
//       newChildrenData.pop()
//     }

//     setChildrenData(newChildrenData)
//   }, [numberOfChildren])

//   const pickImage1 = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     })

//     console.log("Resultado de pickImage1:", result)

//     if (!result.canceled) {
//       setLicencePhoto1(result.assets[0].uri)
//     }
//   }

//   const pickImage2 = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     })

//     console.log("Resultado de pickImage2:", result)

//     if (!result.canceled) {
//       setLicencePhoto2(result.assets[0].uri)
//     }
//   }

//   const selectNumberOfChildren = (value: string) => {
//     setNumberOfChildren(value)
//     setShowChildrenDropdown(false)
//   }

//   const openChildDatePicker = (index: number) => {
//     setChildBirthDateIndex(index)
//     setDatePickerVisibility(true)
//   }

//   const handleDateConfirm = (selectedDate: Date) => {
//     setDatePickerVisibility(false)
//     const formattedDate = selectedDate.toISOString().split("T")[0]

//     if (childBirthDateIndex !== null) {
//       // Update child birth date
//       const newChildrenData = [...childrenData]
//       newChildrenData[childBirthDateIndex].birthDate = formattedDate
//       setChildrenData(newChildrenData)
//       setChildBirthDateIndex(null)
//     } else {
//       // Update license expiry date
//       setDate(formattedDate)
//     }
//   }

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 19,
//       paddingTop: 1,
//       borderRadius: 10,
//       backgroundColor: colorScheme === "dark" ? "#112A4A" : "#ffffff",
//     },
//     photoContainer: {
//       flexDirection: "row",
//       justifyContent: "space-around",
//       marginVertical: 10,
//     },
//     photoBox: {
//       width: 130,
//       height: 130,
//       borderWidth: 2,
//       borderColor: "#0458AB",
//       borderRadius: 8,
//       justifyContent: "center",
//       alignItems: "center",
//       marginBottom: 5,
//     },
//     photoLabel: {
//       color: "#0458AB",
//       fontWeight: "bold",
//       fontSize: 16,
//       marginTop: 5,
//       paddingTop:20,
//     },
//     photoImage: {
//       width: "100%",
//       height: "100%",
//       borderRadius: 6,
//     },
//     photoPlaceholder: {
//       width: "100%",
//       height: "100%",
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     photoCircle: {
//       width: 20,
//       height: 20,
//       borderRadius: 10,
//       borderWidth: 2,
//       borderColor: "#0458AB",
//       position: "absolute",
//       top: "30%",
//       left: "30%",
//     },
//     photoMountain: {
//       width: 80,
//       height: 40,
//       borderBottomWidth: 2,
//       borderLeftWidth: 2,
//       borderRightWidth: 2,
//       borderColor: "#0458AB",
//       borderBottomLeftRadius: 40,
//       borderBottomRightRadius: 40,
//       position: "absolute",
//       bottom: "30%",
//       transform: [{ rotate: "10deg" }],
//     },
//     header: {
//       backgroundColor: colorScheme === "dark" ? "#112A4A" : "#ffffff",
//       paddingVertical: 5,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       borderBottomWidth: 2,
//       borderBottomColor: colorScheme === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.1)",
//     },
//     text: {
//       fontSize: 14,
//       fontWeight: "600",
//       color: colorScheme === "dark" ? "#ffffff" : "#0458AB",
//       marginTop: 8,
//     },
//     textLarge: {
//       fontSize: 18,
//       fontWeight: "bold",
//       color: colorScheme === "dark" ? "#ffffff" : "#0458AB",
//       marginTop: 16,
//       marginBottom: 8,
//     },
//     textLargeTitle: {
//       fontSize: 15,
//       fontWeight: "bold",
//       color: colorScheme === "dark" ? "#ffffff" : "#0458AB",
//       marginTop: 16,
//       marginBottom: 8,
//     },
//     input: {
//       borderWidth: 2,
//       borderColor: colorScheme === "dark" ? "#9ca3af" : "#0458AB",
//       backgroundColor: colorScheme === "dark" ? "#FFFFFF36" : "#ffffff",
//       padding: 8,
//       borderRadius: 8,
//       color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
//     },
//     buttonContainer: {
//       flexDirection: "row",
//       justifyContent: "center",
//       marginTop: 60,
//     },
//     buttonCancel: {
//       backgroundColor: colorScheme === "dark" ? "#0458AB" : "#545257",
//       padding: 10,
//       borderRadius: 6,
//       flex: 1,
//       alignItems: "center",
//       marginRight: 8,
//     },
//     buttonBack: {
//       backgroundColor: colorScheme === "dark" ? "#545257" : "#0458AB",
//       padding: 10,
//       borderRadius: 6,
//       flex: 1,
//       alignItems: "center",
//       marginRight: 8,
//     },
//     buttonNext: {
//       backgroundColor: colorScheme === "dark" ? "#FFFFFF" : "#60A3D9",
//       padding: 10,
//       borderRadius: 6,
//       flex: 1,
//       alignItems: "center",
//     },
//     buttonTextCancel: {
//       color: "#FFFFFF",
//       fontWeight: "bold",
//     },
//     buttonTextBack: {
//       color: colorScheme === "dark" ? "#ffffff" : "#FFFFFF",
//       fontWeight: "bold",
//     },
//     buttonTextNext: {
//       color: colorScheme === "dark" ? "#0458AB" : "#FFFFFF",
//       fontWeight: "bold",
//     },
//     required: {
//       color: "#FF0000",
//     },
//     stepperImage: {
//       width: 200, // ancho específico en px
//       height: 40,
//       marginBottom: 10,
//       marginTop: 10,
//       padding: 0,
//       alignSelf: "center",
//     },
//     // Add new styles for the dropdown
//     dropdownButton: {
//       borderWidth: 2,
//       borderColor: colorScheme === "dark" ? "#9ca3af" : "#0458AB",
//       backgroundColor: colorScheme === "dark" ? "#FFFFFF36" : "#ffffff",
//       padding: 10,
//       borderRadius: 8,
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       marginBottom: 10,
//     },
//     dropdownText: {
//       color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
//     },
//     dropdownMenu: {
//       position: "absolute",
//       top: 45,
//       left: 0,
//       right: 0,
//       backgroundColor: colorScheme === "dark" ? "#112A4A" : "#ffffff",
//       borderWidth: 2,
//       borderColor: colorScheme === "dark" ? "#9ca3af" : "#0458AB",
//       borderRadius: 8,
//       zIndex: 1000,
//       elevation: 5,
//     },
//     dropdownItem: {
//       padding: 10,
//       borderBottomWidth: 1,
//       borderBottomColor: colorScheme === "dark" ? "#9ca3af" : "#e5e7eb",
//     },
//     childContainer: {
//       borderWidth: 2,
//       borderColor: colorScheme === "dark" ? "#9ca3af" : "#0458AB",
//       borderRadius: 8,
//       padding: 10,
//       marginTop: 10,
//       backgroundColor: colorScheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(4, 88, 171, 0.05)",
//     },
//     childDateButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       borderWidth: 2,
//       borderColor: colorScheme === "dark" ? "#9ca3af" : "#0458AB",
//       backgroundColor: colorScheme === "dark" ? "#FFFFFF36" : "#ffffff",
//       padding: 8,
//       borderRadius: 8,
//     },
//   })

//   return (
//     <Modal visible={visible} transparent animationType="slide">
//       <SafeAreaView
//         style={{
//           flex: 1,
//           backgroundColor: colorScheme === "dark" ? "#112A4A" : "#FFFFFF",
//         }}
//       >
//         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
//           <ScrollView
//             contentContainerStyle={{ flexGrow: 1 }}
//             keyboardShouldPersistTaps="handled"
//             nestedScrollEnabled={true}
//           >
//             <View style={styles.header}>
//               <Text style={styles.textLargeTitle}>Operator Registration</Text>
//             </View>

//             <Image
//               source={require("../../assets/images/paso_2.png")} // ajusta la ruta
//               style={styles.stepperImage}
//             />

//             <ThemedView style={styles.container}>
//               <Text style={styles.textLarge}>Driving Licence</Text>

//               <Text style={styles.text}>
//                 Driving permit <Text style={styles.required}>(*)</Text>
//               </Text>
//               <View style={{ flexDirection: "row", marginBottom: 12 }}>
//                 {[
//                   { value: "yes", label: "Yes" },
//                   { value: "no", label: "No" },
//                 ].map((option) => (
//                   <TouchableOpacity
//                     key={option.value}
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       marginRight: 20,
//                     }}
//                     onPress={() => setHasDrivingLicense(option.value as "yes" | "no")}
//                   >
//                     <View
//                       style={{
//                         height: 20,
//                         width: 20,
//                         borderRadius: 10,
//                         borderWidth: 2,
//                         borderColor: "#0458AB",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         marginRight: 8,
//                       }}
//                     >
//                       {hasDrivingLicense === option.value && (
//                         <View
//                           style={{
//                             height: 10,
//                             width: 10,
//                             borderRadius: 5,
//                             backgroundColor: "#0458AB",
//                           }}
//                         />
//                       )}
//                     </View>
//                     <Text style={styles.text}>{option.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//               <Text style={styles.text}>
//                 Driving licence number <Text style={styles.required}>(*)</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="010100"
//                 placeholderTextColor="#9ca3af"
//                 value={Driving}
//                 onChangeText={setDriving}
//                 keyboardType="numeric"
//               />
//               <View style={{ zIndex: 2000 }}>
//                 <Text style={styles.text}>
//                   Expiry date <Text style={styles.required}>(*)</Text>
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => setDatePickerVisibility(true)}
//                   style={[
//                     styles.input,
//                     {
//                       flexDirection: "row",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                     },
//                   ]}
//                 >
//                   <Text style={{ color: date ? "#000" : "#9ca3af" }}>{date ? date : "01/01/2025"}</Text>
//                   <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
//                 </TouchableOpacity>
//               </View>

//               <Text style={styles.text}>
//                 Licence photo<Text style={styles.required}>(*)</Text>
//               </Text>
//               <View style={styles.photoContainer}>
//                 <TouchableOpacity style={styles.photoBox} onPress={pickImage1}>
//                   {licencePhoto1 ? (
//                     <Image source={{ uri: licencePhoto1 }} style={styles.photoImage} />
//                   ) : (
//                     <>
//                       <View style={styles.photoPlaceholder}>
//                         <View style={styles.photoCircle} />
//                         <View style={styles.photoMountain} />
//                       </View>
//                     </>
//                   )}
//                   <Text style={styles.photoLabel}>Front</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.photoBox} onPress={pickImage2}>
//                   {licencePhoto2 ? (
//                     <Image source={{ uri: licencePhoto2 }} style={styles.photoImage} />
//                   ) : (
//                     <>
//                       <View style={styles.photoPlaceholder}>
//                         <View style={styles.photoCircle} />
//                         <View style={styles.photoMountain} />
//                       </View>
//                     </>
//                   )}
//                   <Text style={styles.photoLabel}>Back</Text>
//                 </TouchableOpacity>
//               </View>

//               <Text style={styles.textLarge}>Family information</Text>
//               <Text style={styles.text}>
//                 Name parent/guardian <Text style={styles.required}></Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter name"
//                 placeholderTextColor="#9ca3af"
//                 value={NameParent}
//                 onChangeText={setNameParent}
//               />
//               <Text style={styles.text}>
//                 Cell Phone parent/guardian <Text style={styles.required}>(*)</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="100101010"
//                 placeholderTextColor="#9ca3af"
//                 value={CellPhone}
//                 onChangeText={setCellPhone}
//                 keyboardType="numeric"
//               />

//               <View style={{ zIndex: 1000 }}>
//                 <Text style={styles.text}>
//                   state <Text style={styles.required}>(*)</Text>
//                 </Text>
//               </View>

//               <Text style={styles.text}>
//                 Minor children <Text style={styles.required}>(*)</Text>
//               </Text>

//               <View style={{ flexDirection: "row", marginBottom: 12 }}>
//                 {[
//                   { value: "yes", label: "Yes" },
//                   { value: "no", label: "No" },
//                 ].map((drivingLicenseOption) => (
//                   <TouchableOpacity
//                     key={drivingLicenseOption.value}
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       marginRight: 20,
//                     }}
//                     onPress={() => setSelectedDrivingLicense(drivingLicenseOption.value as "yes" | "no")}
//                   >
//                     <View
//                       style={{
//                         height: 20,
//                         width: 20,
//                         borderRadius: 10,
//                         borderWidth: 2,
//                         borderColor: "#0458AB",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         marginRight: 8,
//                       }}
//                     >
//                       {selectedDrivingLicense === drivingLicenseOption.value && (
//                         <View
//                           style={{
//                             height: 10,
//                             width: 10,
//                             borderRadius: 5,
//                             backgroundColor: "#0458AB",
//                           }}
//                         />
//                       )}
//                     </View>
//                     <Text style={styles.text}>{drivingLicenseOption.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <Text style={styles.text}>
//                 Number of children <Text style={styles.required}>(*)</Text>
//               </Text>

//               {/* Custom dropdown for number of children */}
//               <View style={{ position: "relative", marginBottom: 15 }}>
//                 <TouchableOpacity
//                   style={styles.dropdownButton}
//                   onPress={() => setShowChildrenDropdown(!showChildrenDropdown)}
//                 >
//                   <Text style={styles.dropdownText}>{numberOfChildren}</Text>
//                   <MaterialIcons
//                     name={showChildrenDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
//                     size={24}
//                     color="#0458AB"
//                   />
//                 </TouchableOpacity>

//                 {showChildrenDropdown && (
//                   <View style={styles.dropdownMenu}>
//                     {["0", "1", "2", "3", "4", "5"].map((num) => (
//                       <TouchableOpacity
//                         key={num}
//                         style={styles.dropdownItem}
//                         onPress={() => selectNumberOfChildren(num)}
//                       >
//                         <Text style={styles.dropdownText}>{num}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}
//               </View>

//               {/* Child information sections */}
//               {childrenData.map((child, index) => (
//                 <View key={index} style={styles.childContainer}>
//                   <Text style={styles.text}>
//                     Son's name <Text style={styles.required}>(*)</Text>
//                   </Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Name"
//                     placeholderTextColor="#9ca3af"
//                     value={child.name}
//                     onChangeText={(text) => {
//                       const newData = [...childrenData]
//                       newData[index].name = text
//                       setChildrenData(newData)
//                     }}
//                   />

//                   <Text style={styles.text}>
//                     Date of birth <Text style={styles.required}>(*)</Text>
//                   </Text>
//                   <TouchableOpacity style={styles.childDateButton} onPress={() => openChildDatePicker(index)}>
//                     <Text style={{ color: child.birthDate ? "#000" : "#9ca3af" }}>
//                       {child.birthDate || "01/01/2025"}
//                     </Text>
//                     <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
//                   </TouchableOpacity>
//                 </View>
//               ))}

//               <DateTimePickerModal
//                 isVisible={isDatePickerVisible}
//                 mode="date"
//                 onConfirm={handleDateConfirm}
//                 onCancel={() => {
//                   setDatePickerVisibility(false)
//                   setChildBirthDateIndex(null)
//                 }}
//               />

//               <View style={styles.buttonContainer}>
//                 <TouchableOpacity style={styles.buttonCancel} onPress={() => router.back()}>
//                   <Text style={styles.buttonTextCancel}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.buttonBack} onPress={() => router.back()}>
//                   <Text style={styles.buttonTextBack}>Back</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.buttonNext} onPress={() => router.back()}>
//                   <Text style={styles.buttonTextNext}>Next</Text>
//                 </TouchableOpacity>
//               </View>
//             </ThemedView>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </Modal>
//   )
// }
