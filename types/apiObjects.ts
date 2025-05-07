export type EventItemProps = {
  id: string;
  title: string;
  isActive: boolean;
  total: number;
  minPrice: number;
  imageUrl: string;
  startDateTime: string;
  endDateTime: string;

  onPress: () => void;
  onSettings: () => void;
};

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export type SongItem = {
  id: string;
  title: string;
  artist: string;
  likes: number;
  action?: 'accepted' | 'rejected';
  timestamp?: string;
  imageUrl: string;
};

export type Songs = {
  playlist: SongItem[];
  queue: SongItem[];
  history: SongItem[];
};

export type EventWithSongs = {
  id: string;
  title: string;
  isActive: boolean;
  minPrice: number;
  totalAmount: number;
  imageUrl: string;
  songs: Songs;
  code: string;
};

export type ActionType = 'accepted' | 'rejected';

export type HistoryItemProps = {
  id: string;
  title: string;
  artist: string;
  likes: number;
  action: ActionType;
  timestamp: string;
  imageUrl: string;
};

export type SongItemProps = {
  id: string;
  title: string;
  artist: string;
  likes: number;
  imageUrl: string;
  eventId: string;
  onLike: () => void;
  onFinishedPlaying: (songId: string, historyItem: HistoryItemProps) => void;
  updateEventTotal: (amount: number) => void;
};

export type Collaborator = {
  id: string;
  name: string;
  percentage: number;
};
