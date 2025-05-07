import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';

type QRCodeModalProps = {
  visible: boolean;
  onClose: () => void;
  qrcodedata: string;
  title: string;
  displaymessage: string;
};

export default function QRCodeModal({
  visible,
  onClose,
  qrcodedata,
  title,
  displaymessage,
}: QRCodeModalProps) {
  //const qrValue = `https://vibequeue.com/event/${qrcodedata}`;
  const qrValue = qrcodedata;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.qrContainer}>
            <QRCode
              value={qrValue}
              size={200}
              backgroundColor={Colors.light.card}
              color={Colors.light.text}
            />
          </View>

          <Text style={styles.description}>{displaymessage}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.xl,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.spacing.xl,
    position: 'relative',
    width: '100%',
  },
  modalTitle: {
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: Sizes.spacing.xs,
  },
  qrContainer: {
    padding: Sizes.spacing.lg,
    backgroundColor: Colors.light.card,
    borderRadius: Sizes.radius.lg,
    marginBottom: Sizes.spacing.lg,
  },
  description: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});
