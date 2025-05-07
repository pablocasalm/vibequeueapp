import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';

type TransactionStatus = 'waiting' | 'processed' | 'failed';

type TransactionItemProps = {
  status: TransactionStatus;
  amount: number;
  date: string;
};

export default function TransactionItem({ status, amount, date }: TransactionItemProps) {
  return (
    <Card>
      <View style={styles.row}>
        <Text style={styles.label}>State</Text>
        <StatusBadge status={status} />
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Withdrawn</Text>
        <Text style={styles.value}>{amount} CHF</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{date}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Sizes.spacing.xs,
  },
  label: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.8,
  },
  value: {
    fontSize: Sizes.fontSize.md,
    fontWeight: '600',
    color: Colors.light.text,
  },
});