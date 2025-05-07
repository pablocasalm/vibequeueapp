import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import StatusBadge from '@/components/ui/StatusBadge';
import { Pencil } from 'lucide-react-native';

type EventCardProps = {
  id: string;
  title: string;
  isActive: boolean;
  amount: number;
  minAmount?: number;
  imageUrl?: string;
};

export default function EventCard({ 
  id, 
  title, 
  isActive, 
  amount,
  minAmount = 10,
  imageUrl 
}: EventCardProps) {
  const router = useRouter();
  
  const navigateToEventDetails = () => {
    router.push(`/event/${id}`);
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={navigateToEventDetails}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Pencil size={16} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Min: </Text>
            <Text style={styles.amount}>{minAmount} CHF</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.amountLabel}>Total: </Text>
            <Text style={styles.amount}>{amount} CHF</Text>
          </View>
          
          {isActive && (
            <View style={styles.activeIndicator}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active Now</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  content: {
    padding: 16,
  },
  header: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: 'Inter-SemiBold',
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.6,
    fontFamily: 'Inter-Regular',
  },
  amount: {
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: 'Inter-Medium',
  },
  dot: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.6,
    marginHorizontal: 8,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.active,
  },
  activeText: {
    fontSize: 12,
    color: Colors.light.active,
    fontFamily: 'Inter-Medium',
  },
});