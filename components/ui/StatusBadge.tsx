import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors, { statusColors } from '@/constants/Colors';

type StatusType = 'active' | 'inactive' | 'waiting' | 'processed' | 'failed';

type StatusBadgeProps = {
  status: StatusType;
  size?: 'small' | 'medium';
};

const statusMap: Record<StatusType, { color: string; label: string }> = {
  active: { color: Colors.light.active, label: 'Active' },
  inactive: { color: Colors.light.inactive, label: 'Inactive' },
  waiting: { color: statusColors.waiting, label: 'Waiting' },
  processed: { color: statusColors.processed, label: 'Processed' },
  failed: { color: statusColors.failed, label: 'Failed' },
};

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const { color, label } = statusMap[status];
  const diameter = size === 'small' ? 8 : 12;
  
  if (size === 'small') {
    return (
      <View style={[styles.indicator, { width: diameter, height: diameter, backgroundColor: color }]} />
    );
  }
  
  return (
    <Text style={[styles.text, { color }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  indicator: {
    borderRadius: 50,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});