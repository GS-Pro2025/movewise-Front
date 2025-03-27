import React, { useState } from "react";
import { View } from "react-native";
import Home from "../(tabs)/Home";
import OrderModal from "../modals/OrderModal";
import OperatorModal from "../modals/OperatorModal";


const IndexScreen = () => {
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [operatorModalVisible, setOperatorModalVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Home Component */}
      <Home 
        onOpenModal={() => setOrderModalVisible(true)} 
        onOpenOperatorModal={() => setOperatorModalVisible(true)} 
      />
      
      {/* Modal de órdenes */}
      <OrderModal 
        visible={orderModalVisible} 
        onClose={() => setOrderModalVisible(false)} 
      />

      {/* Modal de operadores */}
      <OperatorModal 
  visible={operatorModalVisible} 
  onClose={() => setOperatorModalVisible(false)} 
/>

    </View>
  );
};

export default IndexScreen;
