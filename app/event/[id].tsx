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
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Settings,
  Share2,
  ChartBar as BarChart3,
  Check,
  X,
  Users,
  Trash,
  Play,
  QrCode,
} from 'lucide-react-native';
import {
  GestureHandlerRootView,
  Swipeable,
} from 'react-native-gesture-handler';
import IconButton from '@/components/ui/IconButton';
import EventModal from '@/components/modals/EventModal';
import DeleteConfirmationModal from '@/components/modals/delete-confirmation';
import QRCodeModal from '@/components/modals/QRCodeModal';
import CollaboratorsModal from '@/components/modals/CollaboratorsModal';
import MessageModal from '@/components/modals/MessageModal';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { EventService } from '@/services/eventService';
//import { setAuthToken } from '@/services/apiClient';
import { SongItemProps, EventWithSongs, MessageType } from '@/types/apiObjects';
import { SongRequestService } from '@/services/songRequestService';
import { QueueHubService } from '@/services/QueueHubService';
import AuthGuard from '@/authentification/authGuard';

type TabType = 'playlist' | 'queue' | 'history';
type ActionType = 'accepted' | 'rejected';

function LoadingScreen() {
  return (
    <View style={[styles.container, styles.loadingContainer]}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function SongItem({
  id,
  title,
  artist,
  likes,
  imageUrl,
  eventId,
  onLike,
  onFinishedPlaying,
  updateEventTotal,
}: SongItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationRunning, setAnimationRunning] = useState(false);
  const [progress] = useState(new Animated.Value(0));
  const [backgroundColor] = useState(new Animated.Value(0));

  const startPlaying = async () => {
    if (animationRunning) return;

    setAnimationRunning(true);

    const response = await SongRequestService.startPlayingSong({
      songrequestid: id,
      eventid: eventId,
    });

    if (response.success) {
      setIsPlaying(true);

      Animated.timing(backgroundColor, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      Animated.timing(progress, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: false,
      }).start(async () => {
        setIsPlaying(false);
        setAnimationRunning(false);
        progress.setValue(0);
        backgroundColor.setValue(0);

        const result = await SongRequestService.modifySongRequest({
          songrequestid: id,
          state: '1', // finished playing
          eventid: eventId,
        });

        if (result.success && onFinishedPlaying) {
          const songData = JSON.parse(result.message);
          updateEventTotal(songData.Payment.ConvertedPayedAmount);

          onFinishedPlaying(id, songData);
        } else {
          // Optionally handle errors here
        }
      });
    } else {
      setAnimationRunning(false);
      // TODO: show error toast/modal
    }
  };

  const renderLeftActions = (
    progressAnimatedValue: Animated.AnimatedInterpolation<number>,
    dragAnimatedValue: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragAnimatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.playActionContainer}
        onPress={startPlaying}
      >
        <Animated.View style={[styles.playAction, { transform: [{ scale }] }]}>
          <Play size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const backgroundColorInterpolation = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.light.card, 'rgba(50, 215, 75, 0.2)'],
  });

  return (
    <Swipeable renderLeftActions={renderLeftActions} overshootLeft={false}>
      <Animated.View
        style={[
          styles.songItem,
          { backgroundColor: backgroundColorInterpolation },
        ]}
      >
        <Image source={{ uri: imageUrl }} style={styles.songImage} />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {artist}
          </Text>
        </View>
        <TouchableOpacity style={styles.likesButton} onPress={onLike}>
          <Text style={styles.likesCount}>{likes}</Text>
          <Text style={styles.likesIcon}>👍</Text>
        </TouchableOpacity>

        {isPlaying && (
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        )}
      </Animated.View>
    </Swipeable>
  );
}

type QueueItemProps = {
  title: string;
  artist: string;
  imageUrl: string;
  onAccept: () => void;
  onReject: () => void;
};

function QueueItem({
  title,
  artist,
  imageUrl,
  onAccept,
  onReject,
}: QueueItemProps) {
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeableActions}>
        <Animated.View
          style={[
            styles.swipeableAction,
            styles.acceptAction,
            { transform: [{ scale }] },
          ]}
        >
          <Check size={34} color="#fff" />
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeableActions}>
        <Animated.View
          style={[
            styles.swipeableAction,
            styles.rejectAction,
            { transform: [{ scale }] },
          ]}
        >
          <X size={24} color="#fff" />
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableLeftOpen={onAccept}
      onSwipeableRightOpen={onReject}
    >
      <View style={styles.songItem}>
        <Image source={{ uri: imageUrl }} style={styles.songImage} />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {artist}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
}

type HistoryItemProps = {
  id: string;
  title: string;
  artist: string;
  likes: number;
  action: ActionType;
  timestamp: string;
  imageUrl: string;
};

function HistoryItem({
  title,
  artist,
  action,
  timestamp,
  imageUrl,
}: HistoryItemProps) {
  const isAccepted = action === 'accepted';

  return (
    <View
      style={[
        styles.songItem,
        isAccepted ? styles.acceptedHistoryItem : styles.rejectedHistoryItem,
      ]}
    >
      <Image source={{ uri: imageUrl }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {artist}
        </Text>
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.timestamp}>{timestamp}</Text>
        {isAccepted ? (
          <Check size={16} color="#32D74B" />
        ) : (
          <X size={16} color="#FF3B30" />
        )}
      </View>
    </View>
  );
}

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [eventDetails, setEventDetails] = useState<EventWithSongs | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    Type: MessageType;
    Title: string;
    Message: string;
  }>({
    Type: 'info',
    Title: '',
    Message: '',
  });

  const updateEventTotal = (amount: number) => {
    setEventDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        totalAmount: prev.totalAmount + amount,
      };
    });
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      const response = await EventService.getEventDetails(id as string);
      if (response.success && response.message) {
        const data = JSON.parse(response.message);

        const event: EventWithSongs = {
          id: data.mEvent.ID.toString(),
          title: data.mEvent.Name,
          isActive: data.mEvent.IsActive,
          minPrice: data.mEvent.MinPrice,
          totalAmount: data.eventTotalEarnings,
          code: data.mEvent.Code,
          imageUrl: data.mEvent.ImageUrl,
          songs: {
            playlist: data.playlist.map((s: any) => ({
              id: s.ID.toString(),
              title: s.SongName,
              artist: s.ArtistName,
              likes: s.Votes,
              imageUrl: s.ImageUrl,
            })),
            queue: data.queue.map((s: any) => ({
              id: s.ID.toString(),
              title: s.SongName,
              artist: s.ArtistName,
              likes: s.Votes,
              imageUrl: s.ImageUrl,
            })),
            history: data.history.map((s: any) => ({
              id: s.ID.toString(),
              title: s.SongName,
              artist: s.ArtistName,
              likes: s.Votes,
              action: s.State == 1 ? 'accepted' : 'rejected',
              timestamp: s.Timestamp,
              imageUrl: s.ImageUrl,
            })),
          },
        };

        setEventDetails(event);
        setActiveTab(event.isActive ? 'playlist' : 'history');
      } else {
        setError('Failed to load event details');
        router.back();
      }
    } catch (error) {
      console.error(error);
      setError('Failed to fetch event details');

      setModalData({
        Type: 'error',
        Title: 'Error',
        Message: 'Unexpected error loading event details',
      });
      setModalVisible(true);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const addSongToQueue = (songData: any) => {
    setEventDetails((prev) => {
      if (!prev) return prev;

      console.log('adding to queue... ', songData.ID);
      return {
        ...prev,
        songs: {
          ...prev.songs,
          queue: [
            ...prev.songs.queue,
            {
              id: songData.ID,
              title: songData.SongName,
              artist: songData.ArtistName,
              likes: songData.Votes,
              imageUrl: songData.ImageUrl,
            },
          ],
        },
      };
    });
  };

  useEffect(() => {
    const loadEventAndConnectHub = async () => {
      await fetchEventDetails();

      if (!id) return;

      const handleIncomingSong = (song: any) => {
        console.log('Song entered via HUB: ', song);
        const songData = JSON.parse(song);
        addSongToQueue(songData);
      };

      QueueHubService.startConnection(id.toString(), handleIncomingSong);
    };

    loadEventAndConnectHub();

    return () => {
      if (id) {
        QueueHubService.stopConnection(id.toString());
      }
    };
  }, [id]);

  if (!eventDetails) {
    return <LoadingScreen />;
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleCollaborators = () => {
    setShowCollaboratorsModal(true);
  };

  const handleSaveCollaborators = (collaborators: any[]) => {
    //TODO?
    console.log('Saving collaborators:', collaborators);
  };

  const handleConfirmDelete = async () => {
    try {
      const requestBody = {
        eventid: id,
        eventname: eventDetails?.title ?? '',
        minprice: parseFloat(eventDetails?.minPrice?.toString() ?? '0'),
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        collaborators: [],
      };

      console.log('Sending delete request:', requestBody);

      const response = await EventService.deleteEvent(requestBody);

      if (response.success) {
        console.log('Event deleted successfully!');
        router.replace('/');
      } else {
        setError('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
      setModalData({
        Type: 'error',
        Title: 'Error',
        Message: 'Unexpected error deleting event',
      });
      setModalVisible(true);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const extractBase64 = (dataUrl: string) => {
    return dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
  };

  const handleSaveSettings = async (data: {
    eventName: string;
    minPrice: string;
    startDate: Date;
    endDate: Date;
    collaborators: Array<{ id: string; name: string; percentage: number }>;
    imageUrl?: string;
  }) => {
    try {
      const requestBody = {
        eventid: id,
        eventname: data.eventName,
        minprice: parseFloat(data.minPrice),
        start: data.startDate.toISOString(),
        end: data.endDate.toISOString(),
        collaborators: data.collaborators.map((c) => ({
          id: c.id,
          name: c.name,
          percentage: c.percentage,
        })),
        imageBase64: data.imageUrl ? extractBase64(data.imageUrl) : undefined,
      };

      const response = await EventService.updateEvent(requestBody);

      if (response.success) {
        console.log('Event updated successfully!');
        setShowSettingsModal(false);
        fetchEventDetails();
      } else {
        console.error('Failed to update event:', response.message);
        setModalData({
          Type: 'error',
          Title: 'Error',
          Message: response.message,
        });
        setModalVisible(true);
      }
    } catch (error: unknown) {
      console.error('Error updating event:', error);

      const message =
        error instanceof Error ? error.message : 'Unexpected error occurred.';

      setModalData({
        Type: 'error',
        Title: 'Error',
        Message: message,
      });
      setModalVisible(true);
    }
  };

  const handleLike = (songId: string) => {
    console.log('Liked song:', songId);
  };

  const handleAccept = async (songId: string, eventId: string) => {
    console.log('Accepted song:', songId);

    const response = await SongRequestService.modifySongRequest({
      songrequestid: songId,
      state: '3', // OnPlayQueue
      eventid: eventId,
    });

    if (response.success) {
      const songData = JSON.parse(response.message);
      removeSongFromQueue(songId);
      addSongToPlaylist(songData);
    } else {
      setModalData({
        Type: 'error',
        Title: 'Error',
        Message: response.message,
      });
      setModalVisible(true);
      console.error('Failed to accept song');
    }
  };

  const addSongToPlaylist = (songData: any) => {
    setEventDetails((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        songs: {
          ...prev.songs,
          playlist: [
            ...prev.songs.playlist,
            {
              id: songData.ID.toString(),
              title: songData.SongName,
              artist: songData.ArtistName,
              likes: songData.Votes,
              imageUrl: songData.ImageUrl,
            },
          ],
        },
      };
    });
  };

  const handleReject = async (songId: string, eventId: string) => {
    console.log('Rejected song:', songId);
    const response = await SongRequestService.modifySongRequest({
      songrequestid: songId,
      state: '2', // Rejected
      eventid: eventId,
    });

    if (response.success) {
      const songData = JSON.parse(response.message);
      removeSongFromQueue(songId);
      addSongToHistory(songData);
    } else {
      setModalData({
        Type: 'error',
        Title: 'Error',
        Message: response.message,
      });
      setModalVisible(true);
      console.error('Failed to reject song');
    }
  };

  const addSongToHistory = (songData: any) => {
    setEventDetails((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        songs: {
          ...prev.songs,
          history: [
            {
              id: songData.ID.toString(),
              title: songData.SongName,
              artist: songData.ArtistName,
              likes: songData.Votes,
              imageUrl: songData.ImageUrl,
              timestamp: songData.Timestamp,
              action: 'rejected',
            },
            ...prev.songs.history,
          ],
        },
      };
    });
  };

  const removeSongFromQueue = (songId: string) => {
    setEventDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        songs: {
          ...prev.songs,
          queue: prev.songs.queue.filter((song) => song.id !== songId),
        },
      };
    });
  };

  const handleFinishedPlaying = (songId: string, songData: any) => {
    setEventDetails((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        songs: {
          ...prev.songs,
          playlist: prev.songs.playlist.filter((s) => s.id !== songId),
          history: [
            {
              id: songData.ID,
              title: songData.SongName,
              artist: songData.ArtistName,
              likes: songData.Votes,
              imageUrl: songData.ImageUrl,
              timestamp: songData.Timestamp,
              action: 'accepted', // or use logic based on songData.state
            },
            ...prev.songs.history,
          ],
        },
      };
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'playlist':
        return (
          <FlatList
            data={eventDetails.songs.playlist}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SongItem
                {...item}
                onLike={() => handleLike(item.id)}
                eventId={eventDetails.id}
                onFinishedPlaying={(songId, songData) =>
                  handleFinishedPlaying(songId, songData)
                }
                updateEventTotal={(amount: number) => {
                  setEventDetails((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      totalAmount: prev.totalAmount + amount,
                    };
                  });
                }}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.songsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No songs in playlist</Text>
            }
          />
        );
      case 'queue':
        return (
          <FlatList
            data={eventDetails.songs.queue}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <QueueItem
                {...item}
                onAccept={() => handleAccept(item.id, id as string)}
                onReject={() => handleReject(item.id, id as string)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.songsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Queue is empty</Text>
            }
          />
        );
      case 'history':
        return (
          <FlatList
            data={eventDetails.songs.history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <HistoryItem {...(item as HistoryItemProps)} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.songsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No history yet</Text>
            }
          />
        );
    }
  };

  return (
    <AuthGuard>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: eventDetails.imageUrl }}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{eventDetails.title}</Text>
                <View style={styles.eventDetails}>
                  <Text style={styles.detailLabel}>Min: </Text>
                  <Text style={styles.detailValue}>
                    {eventDetails.minPrice} CHF
                  </Text>
                  <Text style={styles.detailSeparator}>•</Text>
                  <Text style={styles.detailLabel}>Total: </Text>
                  <Text style={styles.detailValue}>
                    {eventDetails.totalAmount} CHF
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <IconButton
                icon={ChevronLeft}
                onPress={handleBack}
                color={Colors.light.text}
                size={20}
                style={styles.actionButton}
              />

              {eventDetails.isActive && (
                <>
                  <IconButton
                    icon={Settings}
                    onPress={handleSettings}
                    color={Colors.light.text}
                    size={20}
                    style={styles.actionButton}
                  />
                  <IconButton
                    icon={Users}
                    onPress={handleCollaborators}
                    color={Colors.light.text}
                    size={20}
                    style={styles.actionButton}
                  />
                  <IconButton
                    icon={QrCode}
                    onPress={() => setShowQRModal(true)}
                    color={Colors.light.text}
                    size={20}
                    style={styles.actionButton}
                  />
                </>
              )}

              <IconButton
                icon={Trash}
                onPress={handleDelete}
                color={Colors.light.text}
                size={20}
                style={styles.actionButton}
              />
            </View>

            {eventDetails.isActive && (
              <View style={styles.activeContainer}>
                <View style={styles.activeStatus}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.tabs}>
            {eventDetails.isActive && (
              <>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === 'playlist' && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab('playlist')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'playlist' && styles.activeTabText,
                    ]}
                  >
                    Playlist
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === 'queue' && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab('queue')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'queue' && styles.activeTabText,
                    ]}
                  >
                    Queue
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'history' && styles.activeTabText,
                ]}
              >
                History
              </Text>
            </TouchableOpacity>
          </View>

          {renderContent()}
        </View>

        <EventModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveSettings}
          initialData={{
            eventName: eventDetails.title,
            minPrice: eventDetails.minPrice.toString(),
            startDate: new Date(),
            endDate: new Date(Date.now() + 3600000),
            collaborators: [],
          }}
          isEditing={true}
          resetOnClose={true}
        />

        <DeleteConfirmationModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />

        <QRCodeModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          qrcodedata={`https://vibequeue.com/event/${eventDetails.code?.replace(
            /^#/,
            ''
          )}`}
          title="Event QR Code"
          displaymessage="Scan this QR code to access your profile page"
        />

        <CollaboratorsModal
          visible={showCollaboratorsModal}
          eventId={id as string}
          onClose={() => setShowCollaboratorsModal(false)}
          onSave={handleSaveCollaborators}
        />

        <MessageModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          data={modalData}
        />
      </GestureHandlerRootView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontFamily: 'Inter-Medium',
    marginTop: 12,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  headerContent: {
    ...StyleSheet.absoluteFillObject,
    padding: Sizes.spacing.md,
  },
  headerTop: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.spacing.md,
    marginTop: Sizes.spacing.xl,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    fontFamily: 'Inter-Medium',
  },
  detailSeparator: {
    marginHorizontal: Sizes.spacing.sm,
    color: Colors.light.text,
    opacity: 0.7,
  },
  activeContainer: {
    alignItems: 'center',
    marginTop: Sizes.spacing.sm,
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 215, 75, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: Sizes.spacing.sm,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Sizes.spacing.sm,
    backgroundColor: 'rgba(50, 215, 75, 0.9)',
  },
  activeText: {
    fontSize: Sizes.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: 'rgba(50, 215, 75, 0.9)',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center', // 👈 centers items horizontally
    alignItems: 'center', // 👈 aligns vertically in the row
    gap: Sizes.spacing.sm,
    marginTop: Sizes.spacing.sm,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center', // 👈 centers icon inside button
    alignItems: 'center', // 👈 centers icon inside button
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    marginVertical: Sizes.spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Sizes.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.active,
  },
  tabText: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.6,
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    opacity: 1,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  songsList: {
    paddingBottom: Sizes.spacing.xxl,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Sizes.radius.md,
    padding: Sizes.spacing.md,
    marginBottom: Sizes.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    position: 'relative',
  },
  songImage: {
    width: 48,
    height: 48,
    borderRadius: Sizes.radius.sm,
    backgroundColor: Colors.light.cardAlt,
  },
  songInfo: {
    flex: 1,
    marginLeft: Sizes.spacing.md,
  },
  songTitle: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  songArtist: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.6,
    fontFamily: 'Inter-Regular',
  },
  likesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Sizes.radius.sm,
    gap: 4,
  },
  likesCount: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    fontFamily: 'Inter-Medium',
  },
  likesIcon: {
    fontSize: Sizes.fontSize.sm,
  },
  swipeableActions: {
    width: 80,
    height: '100%',
  },
  swipeableAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Sizes.radius.md,
  },
  acceptAction: {
    backgroundColor: 'rgba(50, 215, 75, 0.2)',
  },
  rejectAction: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  acceptedHistoryItem: {
    backgroundColor: 'rgba(50, 215, 75, 0.1)',
    borderColor: 'rgba(50, 215, 75, 0.2)',
  },
  rejectedHistoryItem: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  historyInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timestamp: {
    fontSize: Sizes.fontSize.xs,
    color: Colors.light.text,
    opacity: 0.5,
    fontFamily: 'Inter-Regular',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.text,
    opacity: 0.6,
    marginTop: Sizes.spacing.xl,
    fontFamily: 'Inter-Regular',
  },
  playActionContainer: {
    width: 75,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(50, 215, 75, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: '#fff',
  },
});
