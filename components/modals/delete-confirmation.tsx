import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';

type DeleteConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
};

export default function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = 'Delete Event',
  message = 'Are you sure you want to delete this event? This action cannot be undone.',
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={32} color={Colors.light.inactive} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Button
              label="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.button}
            />
            <Button
              label="Delete"
              onPress={onConfirm}
              style={[styles.button, styles.deleteButton]}
            />
          </View>
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
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.spacing.lg,
  },
  title: {
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Sizes.spacing.md,
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
  actions: {
    flexDirection: 'row',
    gap: Sizes.spacing.md,
  },
  button: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: Colors.light.inactive,
  },
});