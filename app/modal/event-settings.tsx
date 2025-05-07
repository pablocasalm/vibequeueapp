import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import EventModal from '@/components/modals/EventModal';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { EventService } from '@/services/eventService';

export default function EventSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    router.back();
  };

  const handleSaveSettings = async (data: {
    eventName: string;
    minPrice: string;
    startDate: Date;
    endDate: Date;
    collaborators: Array<{ id: string; name: string; percentage: number }>;
  }) => {
    try {
      setLoading(true);
      setError('');

      const response = await EventService.updateEvent({
        eventid: id,
        eventname: data.eventName,
        minprice: parseFloat(data.minPrice),
        start: data.startDate.toISOString(),
        end: data.endDate.toISOString(),
        collaborators: data.collaborators,
      });

      if (response.success) {
        router.back();
      } else {
        setError(response.message || 'Failed to update event settings');
      }
    } catch (err) {
      console.error('Error updating event settings:', err);
      setError('Something went wrong while updating the event settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Event Settings</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <EventModal
        visible={true}
        onClose={handleClose}
        onSave={handleSaveSettings}
        isEditing={true}
        resetOnClose={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Sizes.spacing.xl,
    marginBottom: Sizes.spacing.xl,
    position: 'relative',
    paddingHorizontal: Sizes.spacing.md,
  },
  title: {
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    position: 'absolute',
    right: Sizes.spacing.md,
    padding: Sizes.spacing.xs,
  },
});