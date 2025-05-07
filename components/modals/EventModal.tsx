import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Calendar, Clock, Plus, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { ImagePlus } from 'lucide-react-native';

type Collaborator = {
  id: string;
  name: string;
  percentage: number;
};

type EventModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    eventName: string;
    minPrice: string;
    startDate: Date;
    endDate: Date;
    collaborators: Collaborator[];
    imageUrl?: string;
  }) => void;
  initialData?: {
    eventName: string;
    minPrice: string;
    startDate?: Date;
    endDate?: Date;
    collaborators?: Collaborator[];
    imageUrl?: string;
  };
  isEditing?: boolean;
  resetOnClose?: boolean;
};

export default function EventModal({
  visible,
  onClose,
  onSave,
  initialData,
  isEditing = false,
  resetOnClose = true,
}: EventModalProps) {
  const [eventName, setEventName] = useState(initialData?.eventName ?? '');
  const [minPrice, setMinPrice] = useState(initialData?.minPrice ?? '');
  const [startDate, setStartDate] = useState(
    initialData?.startDate ?? new Date()
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ?? new Date(Date.now() + 3600000)
  );
  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    initialData?.collaborators ?? []
  );
  const [newCollaboratorName, setNewCollaboratorName] = useState('');
  const [newCollaboratorPercentage, setNewCollaboratorPercentage] =
    useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Reset form when initialData changes
  useEffect(() => {
    if (!visible && resetOnClose) {
      // Modal was closed -> Reset everything
      setEventName('');
      setMinPrice('');
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 3600000));
      setCollaborators([]);
      setNewCollaboratorName('');
      setNewCollaboratorPercentage('');
      setError('');
      setLoading(false);
      setImageUrl(null);
    } else if (initialData) {
      // Modal opened and we have initialData -> Pre-fill the form
      setEventName(initialData.eventName ?? '');
      setMinPrice(initialData.minPrice ?? '');
      setStartDate(initialData.startDate ?? new Date());
      setEndDate(initialData.endDate ?? new Date(Date.now() + 3600000));
      setCollaborators(initialData.collaborators ?? []);
      setImageUrl(initialData.imageUrl ?? null);
    }
  }, [visible, resetOnClose, initialData]);

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators(collaborators.filter((c) => c.id !== id));
  };

  const handleAddCollaborator = () => {
    if (!newCollaboratorName.trim()) {
      setError('Collaborator name is required');
      return;
    }

    const percentage = parseInt(newCollaboratorPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      setError('Please enter a valid percentage (1-100)');
      return;
    }

    const currentTotal = collaborators.reduce(
      (sum, c) => sum + c.percentage,
      0
    );
    if (currentTotal + percentage > 100) {
      setError('Total percentage cannot exceed 100%');
      return;
    }

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: newCollaboratorName,
      percentage,
    };

    setCollaborators([...collaborators, newCollaborator]);
    setNewCollaboratorName('');
    setNewCollaboratorPercentage('');
    setError('');
  };

  const validateForm = () => {
    if (!eventName.trim()) {
      setError('Event name is required');
      return false;
    }

    const price = parseFloat(minPrice);
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price');
      return false;
    }

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return false;
    }

    setError('');
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setLoading(true);

    onSave({
      eventName,
      minPrice,
      startDate,
      endDate,
      collaborators,
      imageUrl: imageUrl ?? undefined,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-CH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const onDateTimeChange = (
    event: any,
    selectedDate: Date | undefined,
    isStart: boolean,
    isTime: boolean
  ) => {
    if (Platform.OS === 'android') {
      setShowStartDate(false);
      setShowStartTime(false);
      setShowEndDate(false);
      setShowEndTime(false);
    }

    if (selectedDate) {
      const currentDate = isStart ? startDate : endDate;
      const newDate = new Date(selectedDate);

      if (isTime) {
        currentDate.setHours(newDate.getHours());
        currentDate.setMinutes(newDate.getMinutes());
      } else {
        newDate.setHours(currentDate.getHours());
        newDate.setMinutes(currentDate.getMinutes());
      }

      if (isStart) {
        setStartDate(new Date(newDate));
      } else {
        setEndDate(new Date(newDate));
      }
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Event Settings' : 'Create Event'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Event Name</Text>
              <TextInput
                style={styles.input}
                value={eventName}
                onChangeText={setEventName}
                placeholder="Enter event name"
                placeholderTextColor={Colors.light.placeholder}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Minimum Request Price (CHF)</Text>
              <TextInput
                style={styles.input}
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="Enter minimum price"
                placeholderTextColor={Colors.light.placeholder}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>From</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartDate(true)}
                >
                  <Calendar size={20} color={Colors.light.text} />
                  <Text style={styles.dateTimeText}>
                    {formatDate(startDate)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartTime(true)}
                >
                  <Clock size={20} color={Colors.light.text} />
                  <Text style={styles.dateTimeText}>
                    {formatTime(startDate)}
                  </Text>
                </TouchableOpacity>
              </View>
              {(showStartDate || showStartTime) && Platform.OS === 'ios' && (
                <View style={styles.iosPickerContainer}>
                  <DateTimePicker
                    value={startDate}
                    mode={showStartDate ? 'date' : 'time'}
                    display="spinner"
                    onChange={(event, date) =>
                      onDateTimeChange(event, date, true, !showStartDate)
                    }
                    textColor={Colors.light.text}
                    themeVariant="dark"
                  />
                  <Button
                    label="Done"
                    onPress={() => {
                      setShowStartDate(false);
                      setShowStartTime(false);
                    }}
                    style={styles.doneButton}
                  />
                </View>
              )}
              {(showStartDate || showStartTime) &&
                Platform.OS === 'android' && (
                  <DateTimePicker
                    value={startDate}
                    mode={showStartDate ? 'date' : 'time'}
                    is24Hour={true}
                    onChange={(event, date) =>
                      onDateTimeChange(event, date, true, !showStartDate)
                    }
                  />
                )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>To</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndDate(true)}
                >
                  <Calendar size={20} color={Colors.light.text} />
                  <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndTime(true)}
                >
                  <Clock size={20} color={Colors.light.text} />
                  <Text style={styles.dateTimeText}>{formatTime(endDate)}</Text>
                </TouchableOpacity>
              </View>
              {(showEndDate || showEndTime) && Platform.OS === 'ios' && (
                <View style={styles.iosPickerContainer}>
                  <DateTimePicker
                    value={endDate}
                    mode={showEndDate ? 'date' : 'time'}
                    display="spinner"
                    onChange={(event, date) =>
                      onDateTimeChange(event, date, false, !showEndDate)
                    }
                    textColor={Colors.light.text}
                    themeVariant="dark"
                  />
                  <Button
                    label="Done"
                    onPress={() => {
                      setShowEndDate(false);
                      setShowEndTime(false);
                    }}
                    style={styles.doneButton}
                  />
                </View>
              )}
              {(showEndDate || showEndTime) && Platform.OS === 'android' && (
                <DateTimePicker
                  value={endDate}
                  mode={showEndDate ? 'date' : 'time'}
                  is24Hour={true}
                  onChange={(event, date) =>
                    onDateTimeChange(event, date, false, !showEndDate)
                  }
                />
              )}
            </View>

            {/*
               <Text style={styles.sectionTitle}>Collaborators</Text>

            {collaborators.map(collaborator => (
              <Card key={collaborator.id} style={styles.collaboratorCard}>
                <View style={styles.collaboratorInfo}>
                  <Text style={styles.collaboratorName}>{collaborator.name}</Text>
                  <Text style={styles.collaboratorPercentage}>{collaborator.percentage}%</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveCollaborator(collaborator.id)}
                >
                  <X size={20} color={Colors.light.inactive} />
                </TouchableOpacity>
              </Card>
            ))}

            <Card variant="alt" style={styles.addCollaboratorCard}>
              <View style={styles.addCollaboratorInputs}>
                <TextInput
                  style={[styles.input, styles.collaboratorNameInput]}
                  value={newCollaboratorName}
                  onChangeText={setNewCollaboratorName}
                  placeholder="Collaborator name"
                  placeholderTextColor={Colors.light.placeholder}
                />
                <TextInput
                  style={[styles.input, styles.collaboratorPercentageInput]}
                  value={newCollaboratorPercentage}
                  onChangeText={setNewCollaboratorPercentage}
                  placeholder="%"
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
            </Card>
            
            */}

            <View style={styles.imagePickerWrapper}>
              <Text style={styles.inputLabel}>Background Image</Text>{' '}
              {/* ✅ Label */}
              <TouchableOpacity
                onPress={handleImagePick}
                style={styles.imagePicker}
              >
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.imageThumbnail}
                  />
                ) : (
                  <ImagePlus size={28} color={Colors.light.text} />
                )}
              </TouchableOpacity>
            </View>

            <Button
              label={isEditing ? 'Save Settings' : 'Create Event'}
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
          </ScrollView>
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
    borderRadius: Sizes.radius.sm,
    height: 48,
    width: '95%',
    marginLeft: '2%',
    paddingHorizontal: Sizes.spacing.md,
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: Sizes.spacing.sm,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.inputBackground,
    borderRadius: Sizes.radius.sm,
    height: 50,
    paddingHorizontal: Sizes.spacing.md,
    gap: Sizes.spacing.sm,
  },
  dateTimeText: {
    flex: 1,
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
  },
  iosPickerContainer: {
    backgroundColor: Colors.light.cardAlt,
    borderRadius: Sizes.radius.lg,
    marginTop: Sizes.spacing.sm,
    overflow: 'hidden',
  },
  doneButton: {
    margin: Sizes.spacing.sm,
  },
  sectionTitle: {
    fontSize: Sizes.fontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Sizes.spacing.md,
    marginTop: Sizes.spacing.lg,
    fontFamily: 'Inter-SemiBold',
  },
  collaboratorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Sizes.spacing.sm,
    marginBottom: Sizes.spacing.sm,
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: Sizes.fontSize.md,
    fontWeight: '500',
    color: Colors.light.text,
    fontFamily: 'Inter-Medium',
  },
  collaboratorPercentage: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.7,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  removeButton: {
    padding: Sizes.spacing.xs,
  },
  addCollaboratorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Sizes.spacing.xs,
    marginBottom: Sizes.spacing.lg,
  },
  addCollaboratorInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: Sizes.spacing.sm,
  },
  collaboratorNameInput: {
    flex: 2,
    height: 40,
  },
  collaboratorPercentageInput: {
    flex: 1,
    height: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Sizes.spacing.sm,
  },
  saveButton: {
    marginBottom: Sizes.spacing.xl,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: Sizes.spacing.lg,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: Sizes.radius.md,
    marginBottom: Sizes.spacing.sm,
  },
  removeImageText: {
    color: Colors.light.tint,
    fontFamily: 'Inter-Medium',
    fontSize: Sizes.fontSize.sm,
    textAlign: 'center',
  },
  imagePickerWrapper: {
    alignItems: 'center',
    marginBottom: Sizes.spacing.lg,
  },

  imagePicker: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.light.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 12,
  },

  imageIcon: {
    fontSize: 32,
    color: Colors.light.text,
    fontWeight: 'bold',
  },
});
