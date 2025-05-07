import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import {
  CircleCheck as CheckCircle,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { MessageType } from '@/types/apiObjects';

type MessageModalProbs = {
  visible: boolean;
  onClose: () => void;
  data: {
    Type: MessageType;
    Title: string;
    Message: string;
  };
};
export default function MessageModal({
  visible,
  onClose,
  data,
}: MessageModalProbs) {
  const getIcon = () => {
    switch (data.Type) {
      case 'success':
        return <CheckCircle size={32} color="#32D74B" />;
      case 'error':
        return <AlertTriangle size={32} color="#FF3B30" />;
      case 'warning':
        return <AlertTriangle size={32} color="#FFD60A" />;
      case 'info':
        return <CheckCircle size={32} color="#0A84FF" />;
      default:
        return null;
    }
  };

  const getIconStyle = () => {
    switch (data.Type) {
      case 'success':
        return styles.successIcon;
      case 'error':
        return styles.errorIcon;
      case 'warning':
        return styles.warningIcon;
      case 'info':
        return styles.infoIcon;
      default:
        return {};
    }
  };

  const getButtonStyle = () => {
    switch (data.Type) {
      case 'success':
        return { backgroundColor: '#32D74B' }; // green
      case 'error':
        return { backgroundColor: '#FF3B30' }; // red
      case 'warning':
        return { backgroundColor: '#FFD60A' }; // yellow
      case 'info':
        return { backgroundColor: '#0A84FF' }; // blue
      default:
        return { backgroundColor: '#888' }; // fallback gray
    }
  };

  const getLabelStyle = () => {
    switch (data.Type) {
      case 'warning':
        return { color: '#000' }; // dark text on yellow
      default:
        return { color: '#fff' }; // white text for most
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={[styles.iconContainer, getIconStyle()]}>
            {getIcon()}
          </View>

          <Text style={styles.title}>{data.Title}</Text>
          <Text style={styles.message}>{data.Message}</Text>
          <Button
            label="Confirm"
            onPress={onClose}
            variant="secondary"
            style={styles.button}
          />
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.spacing.lg,
  },
  successIcon: {
    backgroundColor: 'rgba(50, 215, 75, 0.1)',
  },
  errorIcon: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  warningIcon: {
    backgroundColor: 'rgba(255, 214, 10, 0.1)', // yellow
  },
  infoIcon: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)', // blue
  },
  title: {
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Sizes.spacing.md,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  message: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: Sizes.spacing.xl,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  button: {
    minWidth: 200,
    //backgroundColor: Colors.light.inactive,
  },
});
