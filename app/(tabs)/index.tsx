import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  TriangleAlert as AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Users,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { EventService } from '@/services/eventService';
import EventModal from '@/components/modals/EventModal';
import Button from '@/components/ui/Button';
import { Collaborator, EventItemProps } from '@/types/apiObjects';
import AuthGuard from '@/authentification/authGuard';

type FilterType = 'active' | 'inactive' | 'all';

function EventItem({
  id,
  title,
  isActive,
  minPrice,
  imageUrl,
  onPress,
  startDateTime,
  endDateTime,
}: EventItemProps) {
  // Format date and time
  const date = new Date(startDateTime);
  const endDate = new Date(endDateTime);
  const router = useRouter();

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = `${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })} - ${endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;

  const handleEventPress = (id: string) => {
    router.push(`/event/${id}`);
  };

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image Header */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.eventImage} />
      </View>

      {/* Content Section */}
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{title}</Text>
          {isActive && (
            <View style={styles.activeStatus}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={Colors.light.text} style={styles.icon} />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color={Colors.light.text} style={styles.icon} />
            <Text style={styles.detailText}>{formattedTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={16} color={Colors.light.text} style={styles.icon} />
            <Text style={styles.detailText}>Event Location</Text>
          </View>

          <View style={styles.detailRow}>
            <Users size={16} color={Colors.light.text} style={styles.icon} />
            <Text style={styles.detailText}>120 attendees</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEventPress(id as string)}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItemProps[]>([]);
  const [showActiveEvents, setShowActiveEvents] = useState(true);
  const [showInactiveEvents, setShowInactiveEvents] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const scrollY = new Animated.Value(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await EventService.getAllEvents();

      if (response.success && response.message) {
        const eventsArray = JSON.parse(response.message);

        const mappedEvents: EventItemProps[] = eventsArray.map((event: any) => {
          return {
            id: event.ID.toString(),
            title: event.Name,
            isActive: event.IsActive,
            minPrice: event.MinPrice,
            imageUrl: event.ImageUrl,
            startDateTime: event.Start,
            endDateTime: event.End,
            onPress: () => handleEventPress(event.ID.toString()),
            onSettings: () => handleEventSettings(event.ID.toString()),
          };
        });

        setEvents(mappedEvents);
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleNewEvent = () => {
    setShowCreateEventModal(true);
  };

  const handleEventPress = (id: string) => {
    router.push(`/event/${id}`);
  };

  const handleEventSettings = (id: string) => {
    router.push(`/modal/event-settings?id=${id}`);
  };

  const extractBase64 = (dataUrl: string) => {
    return dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
  };

  const handleCreateEvent = async (eventData: {
    eventName: string;
    minPrice: string;
    startDate: Date;
    endDate: Date;
    collaborators: Collaborator[];
    imageUrl?: string;
  }) => {
    try {
      console.log('Creating event with data:', eventData);

      const response = await EventService.createEvent({
        eventName: eventData.eventName,
        minPrice: parseFloat(eventData.minPrice),
        startDate: eventData.startDate.toISOString(),
        endDate: eventData.endDate.toISOString(),
        collaborators: eventData.collaborators,
        imageBase64: eventData.imageUrl
          ? extractBase64(eventData.imageUrl)
          : undefined,
      });

      if (response.success) {
        console.log('Event created successfully!');
        fetchEvents();
        setShowCreateEventModal(false);
      } else {
        console.error('Failed to create event:', response.message);
        setError('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed creating event');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEventId) return;

    try {
      const response = await EventService.deleteEvent(selectedEventId);
      if (response.success) {
        await fetchEvents();
      } else {
        setError('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  const confirmDelete = () => {
    handleConfirmDelete();
    setShowDeleteModal(false);
  };

  const filteredEvents = events.filter((event) => {
    if (showActiveEvents && showInactiveEvents) return true;
    if (showActiveEvents) return event.isActive;
    if (showInactiveEvents) return !event.isActive;
    return false;
  });

  return (
    <AuthGuard>
      <View style={styles.container}>
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Events</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.filters}>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterToggle,
                  showActiveEvents && styles.activeFilterToggle,
                ]}
                onPress={() => setShowActiveEvents(!showActiveEvents)}
              >
                <Text
                  style={[
                    styles.filterText,
                    showActiveEvents && styles.activeFilterText,
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterToggle,
                  showInactiveEvents && styles.activeFilterToggle,
                ]}
                onPress={() => setShowInactiveEvents(!showInactiveEvents)}
              >
                <Text
                  style={[
                    styles.filterText,
                    showInactiveEvents && styles.activeFilterText,
                  ]}
                >
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleNewEvent}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventItem {...item} />}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No events found</Text>
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />

        <EventModal
          visible={showCreateEventModal}
          onClose={() => setShowCreateEventModal(false)}
          onSave={handleCreateEvent}
          isEditing={false}
          resetOnClose={true}
        />

        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModalContent}>
              <View style={styles.confirmModalIcon}>
                <AlertTriangle size={32} color={Colors.light.inactive} />
              </View>

              <Text style={styles.confirmModalTitle}>Delete Event</Text>
              <Text style={styles.confirmModalText}>
                Are you sure you want to delete this event? This action cannot
                be undone.
              </Text>

              <View style={styles.confirmModalActions}>
                <Button
                  label="Cancel"
                  onPress={() => setShowDeleteModal(false)}
                  variant="secondary"
                  style={styles.confirmModalButton}
                />
                <Button
                  label="Delete"
                  onPress={confirmDelete}
                  style={StyleSheet.flatten([
                    styles.confirmModalButton,
                    styles.deleteButton,
                  ])}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: Sizes.spacing.md,
    marginTop: Sizes.spacing.xl,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Sizes.spacing.md,
  },
  title: {
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    fontFamily: 'Inter-Bold',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.tint,
    marginHorizontal: Sizes.spacing.lg,
    opacity: 0.6,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Sizes.spacing.md,
    marginBottom: Sizes.spacing.xxl,
    paddingHorizontal: Sizes.spacing.lg,
    gap: Sizes.spacing.md,
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: Sizes.spacing.md,
  },
  filterToggle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Sizes.spacing.sm,
    borderRadius: Sizes.radius.lg,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeFilterToggle: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterText: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Medium',
  },
  activeFilterText: {
    opacity: 1,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsList: {
    padding: Sizes.spacing.md,
    paddingTop: 160,
  },
  eventCard: {
    borderRadius: 12,
    backgroundColor: '#1E1E1E', // Distinct from black background
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android
  },
  imageContainer: {
    height: 150, // Set your preferred height
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  eventContent: {
    padding: 12,
    backgroundColor: '#1E1E1E', // Match card background
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    fontFamily: 'Inter-Bold',
    flex: 1,
    marginRight: Sizes.spacing.md,
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 215, 75, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#32D74B',
    marginRight: 6,
  },
  activeText: {
    fontSize: Sizes.fontSize.sm,
    color: '#32D74B',
    fontFamily: 'Inter-Medium',
  },
  eventDetails: {
    flex: 1,
    marginTop: Sizes.spacing.xl,
    gap: Sizes.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Sizes.spacing.sm,
    opacity: 0.8,
  },
  detailText: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.8,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    flexDirection: 'row',
    gap: Sizes.spacing.md,
    marginTop: Sizes.spacing.xl,
  },
  editButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Sizes.radius.sm,
  },
  playlistButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Sizes.radius.sm,
    borderWidth: 1,
    borderColor: Colors.light.text,
  },
  buttonText: {
    color: Colors.light.text,
    fontSize: Sizes.fontSize.sm,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  priceTag: {
    position: 'absolute',
    top: Sizes.spacing.lg,
    right: Sizes.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  priceValue: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.text,
    opacity: 0.6,
    marginTop: Sizes.spacing.xl,
    fontFamily: 'Inter-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.xl,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  confirmModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.spacing.lg,
  },
  confirmModalTitle: {
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Sizes.spacing.md,
    fontFamily: 'Inter-Bold',
  },
  confirmModalText: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: Sizes.spacing.xl,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: Sizes.spacing.md,
  },
  confirmModalButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: Colors.light.inactive,
  },
});
