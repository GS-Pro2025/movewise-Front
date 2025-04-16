import { router, Stack } from "expo-router";
import ListTruckModal from "@/components/ListTruckModal"; // Assuming this is the correct path

export default function ListTruckModalScreen() {
  return (
    <>
      <Stack.Screen options={{ presentation: "modal", title: "Trucks" }} />
      <ListTruckModal visible={true} onClose={() => router.replace("/Home")} />
    </>
  );
}