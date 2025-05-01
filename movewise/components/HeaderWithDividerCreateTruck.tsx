import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { t } from "i18next"; // Importa la función t desde i18next
const HeaderWithDividerCreateTruck = () => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{t("Create_truck")}</Text>
      <View style={styles.divider} />
    </View>
  );
};

export default HeaderWithDividerCreateTruck;

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0458AB", // azul tipo Moviwise
    marginBottom: 8,
  },
  divider: {
    height: 2,
    backgroundColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
