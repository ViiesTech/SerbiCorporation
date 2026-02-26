import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppText from './AppText';
import { colors } from '../assets/colors';
import { responsiveHeight, responsiveWidth } from '../utils';

const OfflineModal = ({ visible }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Feather name="wifi-off" size={40} color={colors.primary} />
          </View>
          <AppText
            title="Connection Lost"
            size={2.2}
            fontWeight="bold"
            align="center"
          />
          <View style={{ height: 10 }} />
          <AppText
            title="Your internet connection is offline. Please check your network settings."
            size={1.6}
            color={colors.black}
            align="center"
            style={{ opacity: 0.6 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default OfflineModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: responsiveWidth(80),
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});
