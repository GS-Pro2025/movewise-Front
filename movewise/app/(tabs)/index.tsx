import React, { useState } from "react";
import { View } from "react-native";
import Home from "../../components/Home"; // Importa tu componente Home

const IndexScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Home onOpenModal={() => setModalVisible(true)} />
    </View>
  );
};

export default IndexScreen;