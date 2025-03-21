import React from 'react';  
import { Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  useColorScheme
} from 'react-native';

interface ActionButtonProps {
  title: string;
  iconSource?: any; // Permite recibir una imagen como icono
}

const Home = () => {
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image 
                source={require('../assets/images/logo.png')} 
                style={[styles.userIcono, { tintColor: isDarkMode ? '#112A4A' : '#0458AB' }]} 
            />   
          </View>
          <View style={styles.userTextContainer}>
            <Text style={[styles.userName, isDarkMode ? styles.darkUserText : styles.lightPrimaryText]}>
              User name
            </Text>
            <Text style={[styles.userLevel, isDarkMode ? styles.darkSubText : styles.lightPrimaryText]}>
              Level
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Image 
              source={require('../assets/images/exit.png')} 
              style={[styles.userIcono, { tintColor: isDarkMode ? '#FFFFFF' : '#0458AB' }]} 
          /> 
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
       
      <View style={styles.imageContainer}>
        <Image 
          source={require('../assets/images/LOGOPNG.png')} 
          style={[styles.userLogo, {  tintColor: isDarkMode ? '#FFFFFF' : '#0458AB' }]} 
        /> 
      </View>
      
      {/* Grid of Action Buttons */}
      <View style={styles.gridContainer}>
        <View style={styles.row}>
          <ActionButton title={"Create\nDaily"} isDarkMode={isDarkMode} iconSource={require('../assets/images/paquete.png')} />
          <ActionButton title={"Add Extra cost"} isDarkMode={isDarkMode} iconSource={require('../assets/images/dolar.png')} />
        </View>
        <View style={styles.row}>
          <ActionButton title={"Edit\nDaily"} isDarkMode={isDarkMode} iconSource={require('../assets/images/paquete.png')} />
          <ActionButton title={"Resume\nOrder"} isDarkMode={isDarkMode} iconSource={require('../assets/images/paper.png')} />
        </View>
        <View style={styles.row}>
          <ActionButton title={"Create\nTruck"} isDarkMode={isDarkMode} iconSource={require('../assets/images/truck.png')} />
          <ActionButton title={"Collaborator\nRegistration"} isDarkMode={isDarkMode} iconSource={require('../assets/images/logo.png')} />
        </View>
        <View style={styles.row}>
          <ActionButton title={"Collaborator\nUnlink"} isDarkMode={isDarkMode} iconSource={require('../assets/images/personx.png')} />
          <ActionButton title={"Collaborator\nEdit"} isDarkMode={isDarkMode} iconSource={require('../assets/images/Pencil.png')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const ActionButton: React.FC<ActionButtonProps & { isDarkMode: boolean }> = ({ title, iconSource, isDarkMode }) => {
  return (
    <TouchableOpacity style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}>
      {iconSource ? (
        <Image 
          source={iconSource} 
          style={[
            styles.actionButtonIcon, 
            { tintColor: isDarkMode ? '#112A4A' : '#FFFFFF' }
          ]} 
        />
      ) : null}
      <Text style={[styles.actionButtonText, isDarkMode ? styles.darkText : styles.lightText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 150, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLogo: {
    width: 120,  
    height: 120, 
  },
  userIcono: {
    width: 38,  
    height: 38, 
    borderRadius: 20, 
  },
  lightBackground: {
    backgroundColor: '#fff', //color en modo claro
  },
  darkBackground: {
    backgroundColor: '#112A4A', //color del fondo cuando esta en modo oscuro (cambiado de #0458AB)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0052A5',
  },
  userTextContainer: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userLevel: {
    fontSize: 14,
  },
  darkText: {
    color: '#112A4A', // Cambiado de #0458AB
  },
  darkUserText: {
    color: '#FFFFFF', // Texto de usuario en blanco para modo oscuro
  },
  lightText: {
    color: '#ffffff',
  },
  darkSubText: {
    color: '#ffffff',
  },
  lightPrimaryText: {
    color: '#0458AB',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  gridContainer: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    flex: 1,
    width: 390,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 8,
    width: '45%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  lightButton: {
    backgroundColor: '#0458AB', //color del bonco azul en modo claro 
  },
  darkButton: {
    backgroundColor: '#FFFFFF',
  },
  actionButtonIcon: {
    width: 45,  
    height: 40, 
    resizeMode: 'contain', 
    marginBottom: 8,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Home;