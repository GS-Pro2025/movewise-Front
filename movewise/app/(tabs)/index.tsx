import React, { useState } from "react";
import { View } from "react-native";
import Home from "../../components/Home"; // Importa tu componente Home
import OrderModal from "../OrderModal"; // Importa el modal

const IndexScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Home onOpenModal={() => setModalVisible(true)} />
      <OrderModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
};

export default IndexScreen;
