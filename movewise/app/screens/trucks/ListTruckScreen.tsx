import { router, Stack } from "expo-router";
import ListTruckModal from "@/components/ListTruckModal";
import { useState } from "react";
import { Text } from "react-native";

export default function ListTruckScreen() {
  const [modalVisible, setModalVisible] = useState(true); // Control visibility dynamically

  const handleClose = () => {
    setModalVisible(false); // Close the modal
    router.replace("/Home"); // Navigate back to Home
  };

  return (
    <>
      <Stack.Screen options={{ presentation: "containedModal", title: "Trucks" }} />
      <ListTruckModal visible={true} onClose={handleClose} />
    </>
  );
}