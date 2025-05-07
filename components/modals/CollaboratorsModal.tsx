import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { X, QrCode, Plus, Search, Trash2 } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DeleteConfirmationModal from '@/components/modals/delete-confirmation';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { CollaboratorService } from '@/services/collaboratorService';
import { useEffect } from 'react';

type Collaborator = {
  id: string;
  name: string;
  percentage: number;
  imageUrl: string;
};

type CollaboratorsModalProps = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onSave: (collaborators: Collaborator[]) => void;
  initialCollaborators?: Collaborator[];
};

// Dummy data for existing collaborators
/*const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: '1',
    name: 'DJ Max',
    percentage: 30,
    imageUrl:
      'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
  },
  {
    id: '2',
    name: 'Sarah Lee',
    percentage: 20,
    imageUrl:
      'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
  },
];*/

export default function CollaboratorsModal({
  visible,
  eventId,
  onClose,
  onSave,
  initialCollaborators,
}: CollaboratorsModalProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [newPercentage, setNewPercentage] = useState('');
  const [error, setError] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<
    string | null
  >(null);

  const totalPercentage = collaborators.reduce(
    (sum, collab) => sum + collab.percentage,
    0
  );

  const handleDeleteCollaborator = (id: string) => {
    setSelectedCollaboratorId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCollaboratorId || !eventId) return;

    try {
      const payload = {
        eventId: eventId, // or EventID: eventId if your API is case-sensitive
        collaboratorId: parseInt(selectedCollaboratorId),
      };

      const response = await CollaboratorService.deleteCollaborator(payload);

      if (response.success) {
        setCollaborators(
          collaborators.filter((c) => c.id !== selectedCollaboratorId)
        );
        setError('');
      } else {
        setError(response.message || 'Failed to delete collaborator');
      }
    } catch (err) {
      console.error('Error deleting collaborator:', err);
      setError('Something went wrong while deleting the collaborator');
    }

    setShowDeleteModal(false);
    setSelectedCollaboratorId(null);
  };

  const validateNewPercentage = (percentage: number) => {
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      setError('Please enter a valid percentage (1-100)');
      return false;
    }

    if (totalPercentage + percentage > 100) {
      setError('Total percentage cannot exceed 100%');
      return false;
    }

    return true;
  };

  const handleAddCollaborator = async () => {
    const percentage = parseInt(newPercentage);
    if (!validateNewPercentage(percentage)) return;

    // You must have `selectedEventId` and `searchQueryId` available from your state or props
    const payload = {
      eventid: eventId,
      usercode: searchQuery,
      percentage: percentage,
    };

    try {
      const response = await CollaboratorService.addCollaborator(payload);

      if (!response.success) {
        console.error('Failed to add collaborator:', response);
        setError(response.message);
        return;
      }

      // Optional: update frontend with placeholder (you can later reload from API)
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        name: searchQuery,
        percentage,
        imageUrl:
          'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
      };

      setCollaborators([...collaborators, newCollaborator]);
      setSearchQuery('');
      setNewPercentage('');
      setError('');
    } catch (err) {
      console.error('Error adding collaborator:', err);
      setError('Something went wrong while adding collaborator.');
    }
  };

  const handleSave = () => {
    onSave(collaborators);
    onClose();
  };

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const response = await CollaboratorService.getAllCollaborators(eventId);
        if (response.success) {
          const parsed = JSON.parse(response.message); // message is a JSON string
          setCollaborators(parsed);
        } else {
          console.error('Failed to fetch collaborators:', response.message);
        }
      } catch (err) {
        console.error('Error fetching collaborators:', err);
      }
    };

    if (eventId) {
      fetchCollaborators();
    }
  }, [eventId]);

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
            <Text style={styles.modalTitle}>Collaborators</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Search Collaborator</Text>
              <View style={styles.searchRow}>
                <View style={styles.searchInputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by username or code"
                    placeholderTextColor={Colors.light.placeholder}
                  />
                </View>
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={() => setShowQRScanner(true)}
                >
                  <QrCode size={20} color={Colors.light.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Percentage</Text>
              <View style={styles.percentageRow}>
                <View style={styles.percentageInputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={newPercentage}
                    onChangeText={setNewPercentage}
                    placeholder="Enter percentage"
                    placeholderTextColor={Colors.light.placeholder}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddCollaborator}
                >
                  <Plus size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.collaboratorsList}>
              {collaborators.map((collaborator) => (
                <Card key={collaborator.id} style={styles.collaboratorCard}>
                  <View style={styles.collaboratorInfo}>
                    <Image
                      source={{ uri: collaborator.imageUrl }}
                      style={styles.avatar}
                    />
                    <View style={styles.collaboratorDetails}>
                      <Text style={styles.collaboratorName}>
                        {collaborator.name}
                      </Text>
                      <Text style={styles.collaboratorPercentage}>
                        {collaborator.percentage}%
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleDeleteCollaborator(collaborator.id)}
                    >
                      <Trash2 size={20} color={Colors.light.inactive} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Percentage:</Text>
              <Text style={styles.totalValue}>{totalPercentage}%</Text>
            </View>

            <Button
              label="Save Changes"
              onPress={handleSave}
              style={styles.saveButton}
            />
          </ScrollView>

          <DeleteConfirmationModal
            visible={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
            title="Remove Collaborator"
            message="Are you sure you want to remove this collaborator? This action cannot be undone."
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
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.spacing.xl,
    position: 'relative',
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
  errorText: {
    color: Colors.light.inactive,
    marginBottom: Sizes.spacing.md,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    marginBottom: Sizes.spacing.lg,
  },
  inputLabel: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    marginBottom: Sizes.spacing.xs,
    fontFamily: 'Inter-Medium',
    marginLeft: '3%',
  },
  input: {
    backgroundColor: Colors.light.inputBackground,
    height: 48,
    width: '100%',
    paddingHorizontal: Sizes.spacing.md,
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
    borderRadius: Sizes.radius.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    width: '95%',
    marginLeft: '2%',
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: Sizes.radius.sm,
    backgroundColor: Colors.light.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.spacing.sm,
  },
  percentageInputWrapper: {
    flex: 1,
    width: '95%',
    marginLeft: '2%',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: Sizes.radius.sm,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collaboratorsList: {
    gap: Sizes.spacing.md,
  },
  collaboratorCard: {
    padding: Sizes.spacing.md,
  },
  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardAlt,
  },
  collaboratorDetails: {
    flex: 1,
    marginLeft: Sizes.spacing.md,
  },
  collaboratorName: {
    fontSize: Sizes.fontSize.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  collaboratorPercentage: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  removeButton: {
    padding: Sizes.spacing.sm,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Sizes.spacing.xl,
    marginBottom: Sizes.spacing.lg,
    paddingTop: Sizes.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  totalLabel: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  totalValue: {
    fontSize: Sizes.fontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    marginTop: Sizes.spacing.md,
  },
});
