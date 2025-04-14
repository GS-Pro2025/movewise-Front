import { router, Stack } from "expo-router";
import ListTruckModal from "@/components/ListTruckModal"; // Suponiendo que lo tienes como componente separado

export default function ListTruckModalScreen() {
  return (
    <>
      <Stack.Screen options={{ presentation: "modal", title: "Trucks" }} />
      <ListTruckModal visible={true} onClose={() => router.back()} />
    </>
  );
}
