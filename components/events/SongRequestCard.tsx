import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThumbsUp } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';

type RequestTier = 'regular' | 'premium';

type SongRequestCardProps = {
  songTitle: string;
  artist: string;
  imageUrl?: string;
  likes?: number;
  onPress?: () => void;
  tier?: RequestTier;
  onLike?: () => void;
};

export default function SongRequestCard({
  songTitle,
  artist,
  imageUrl,
  likes = 0,
  onPress,
  tier = 'regular',
  onLike,
}: SongRequestCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <Image
        source={{ 
          uri: imageUrl || 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg'
        }}
        style={styles.image}
      />
      
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {songTitle}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
        </Text>
      </View>
      
      {likes > 0 && (
        <TouchableOpacity 
          style={styles.likesContainer}
          onPress={onLike}
          disabled={!onLike}
        >
          <Text style={styles.likesText}>{likes}</Text>
          <ThumbsUp size={16} color={Colors.light.text} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.light.cardAlt,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  artist: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.6,
    fontFamily: 'Inter-Regular',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  likesText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
});