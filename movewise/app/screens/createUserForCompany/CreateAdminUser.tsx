import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "@/app/Colors";

const CreateAdminUser = () => {
  const theme = useColorScheme();

  // Estados para los campos
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [adressPerson, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Errores (puedes usarlos si quieres validación visual)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={
          theme === "dark"
            ? require("../../../assets/images/patron_modo_oscuro.png")
            : require("../../../assets/images/patron_modo_claro.png")
        }
        style={[
          styles.background,
          { backgroundColor: "#0B2863" },
        ]}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <Text
              style={[
                styles.title,
                { color: theme === "dark" ? colors.textDark : colors.primary },
              ]}
            >
              Crear nuevo administrador
            </Text>

            {/* Email */}
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.email
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Correo electrónico"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Username */}
            {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.userName && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.userName
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Nombre de usuario"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={userName}
              onChangeText={setUserName}
            />

            {/* Password */}
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.password && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.password
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Contraseña"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Nombre */}
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.firstName && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.firstName
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Nombre"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={firstName}
              onChangeText={setFirstName}
            />

            {/* Apellido */}
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.lastName && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.lastName
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Apellido"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={lastName}
              onChangeText={setLastName}
            />

            {/* Fecha de nacimiento */}
            {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
            <View style={{ zIndex: 1000, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setDatePickerVisibility(true)}
                style={[
                  styles.input,
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                    borderColor: errors.birthDate
                      ? "#FF0000"
                      : theme === "dark"
                      ? colors.borderDark
                      : colors.borderLight,
                  },
                ]}
              >
                <Text style={{ color: birthDate ? (theme === "dark" ? colors.textDark : colors.textLight) : (theme === "dark" ? colors.placeholderDark : colors.placeholderLight) }}>
                  {birthDate ? birthDate : "Fecha de nacimiento"}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color={theme === "dark" ? colors.placeholderDark : colors.placeholderLight} />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(selectedDate) => {
                  setDatePickerVisibility(false);
                  setBirthDate(selectedDate.toISOString().split("T")[0]);
                }}
                onCancel={() => setDatePickerVisibility(false)}
              />
            </View>

            {/* Tipo de ID */}
            {errors.idType && <Text style={styles.errorText}>{errors.idType}</Text>}
            <View
              style={[
                styles.input,
                {
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  justifyContent: "center",
                  borderColor: errors.idType
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                },
              ]}
            >
              <Picker
                selectedValue={idType}
                onValueChange={(itemValue) => setIdType(itemValue)}
                style={{
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  backgroundColor: "transparent",
                }}
                dropdownIconColor={theme === "dark" ? colors.textDark : colors.textLight}
              >
                <Picker.Item label="Tipo de identificación" value="" color={theme === "dark" ? colors.placeholderDark : colors.placeholderLight} />
                <Picker.Item label="Licencia de conducir" value="DL" />
                <Picker.Item label="ID estatal" value="SI" />
                <Picker.Item label="Green Card" value="GC" />
                <Picker.Item label="Pasaporte" value="PA" />
              </Picker>
            </View>

            {/* Número de ID */}
            {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.idNumber && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.idNumber
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Número de identificación"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={idNumber}
              onChangeText={setIdNumber}
            />

            {/* Estado */}
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.state && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.state
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Estado"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={state}
              onChangeText={setState}
            />

            {/* Ciudad */}
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.city && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.city
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Ciudad"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={city}
              onChangeText={setCity}
            />

            {/* Código postal */}
            {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.zipCode && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.zipCode
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Código postal"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
            />

            {/* Dirección */}
            {errors.adressPerson && <Text style={styles.errorText}>{errors.adressPerson}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.adressPerson && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.adressPerson
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Dirección"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              value={adressPerson}
              onChangeText={setAddress}
            />

            {/* Teléfono */}
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            <TextInput
              style={[
                styles.input,
                errors.phone && styles.inputError,
                {
                  backgroundColor: theme === "dark" ? colors.cardDark : colors.cardLight,
                  color: theme === "dark" ? colors.textDark : colors.textLight,
                  borderColor: errors.phone
                    ? "#FF0000"
                    : theme === "dark"
                    ? colors.borderDark
                    : colors.borderLight,
                },
              ]}
              placeholder="Teléfono"
              placeholderTextColor={theme === "dark" ? colors.placeholderDark : colors.placeholderLight}
              keyboardType="numeric"
              value={phone}
              onChangeText={setPhone}
            />
            {/* Botón de crear */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {/* handleCrearAdmin */}}
            >
              <Text style={styles.buttonText}>Crear administrador</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    paddingBottom: 80,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#FF0000",
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    height: 48,
    backgroundColor: "#002366",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  termsText: {
    marginLeft: 8,
    color: "#000",
    fontSize: 14,
  },
  link: {
    color: "#002366",
    textDecorationLine: "underline",
  },
});

export default CreateAdminUser;