import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { HistoryService } from '@/services/historyService';
import AuthGuard from '@/authentification/authGuard';

type TransactionStatus = 'waiting' | 'processed' | 'failed';
type FilterState = {
  complete: boolean;
  waiting: boolean;
  failed: boolean;
};

type Transaction = {
  id: string;
  status: TransactionStatus;
  amount: number;
  date: string;
  transactionId: string;
  lastDigits: string;
};

function TransactionItem({
  status,
  amount,
  date,
  transactionId,
  lastDigits,
}: Omit<Transaction, 'id'>) {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);

    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      friction: 10,
      tension: 50,
    }).start();
  };

  const detailsHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  return (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={[styles.statusIndicator, styles[`status${status}`]]} />
        <Text style={styles.amount}>{amount.toFixed(2)} CHF</Text>
      </View>

      <View style={styles.transactionFooter}>
        <Text style={styles.statusText}>{status}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity onPress={toggleExpand}>
          <Text style={styles.toggleText}>
            {expanded ? 'Hide Info' : 'More Info...'}
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.details, { height: detailsHeight }]}>
        <Text style={styles.detailText}>TXN #{transactionId}</Text>
        <Text style={styles.detailText}>•••• {lastDigits}</Text>
      </Animated.View>
    </Card>
  );
}

export default function HistoryScreen() {
  const [filters, setFilters] = useState<FilterState>({
    complete: true,
    waiting: true,
    failed: true,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await HistoryService.getHistory();

        if (Array.isArray(response)) {
          const formatted: Transaction[] = response.map((item: any) => ({
            id: item.Id.toString(),
            amount: item.ConvertedAmount,
            date: new Date(item.RequestedAt).toLocaleDateString('de-DE'),
            status: item.Success
              ? 'processed'
              : item.CompletedAt
              ? 'failed'
              : 'waiting',
            transactionId: item.StripeTransferId || 'unknown...',
            lastDigits: item.Last4Digits || '0000',
          }));

          setTransactions(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch transaction history:', err);
      }
    };

    fetchHistory();
  }, []);

  const toggleFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (transaction.status === 'processed' && filters.complete) return true;
    if (transaction.status === 'waiting' && filters.waiting) return true;
    if (transaction.status === 'failed' && filters.failed) return true;
    return false;
  });

  return (
    <AuthGuard>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.filters}>
          <TouchableOpacity
            style={[
              styles.filterToggle,
              filters.complete && styles.activeFilterToggle,
            ]}
            onPress={() => toggleFilter('complete')}
          >
            <Text
              style={[
                styles.filterText,
                filters.complete && styles.activeFilterText,
              ]}
            >
              Complete
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterToggle,
              filters.waiting && styles.activeFilterToggle,
            ]}
            onPress={() => toggleFilter('waiting')}
          >
            <Text
              style={[
                styles.filterText,
                filters.waiting && styles.activeFilterText,
              ]}
            >
              Waiting
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterToggle,
              filters.failed && styles.activeFilterToggle,
            ]}
            onPress={() => toggleFilter('failed')}
          >
            <Text
              style={[
                styles.filterText,
                filters.failed && styles.activeFilterText,
              ]}
            >
              Failed
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem
              status={item.status}
              amount={item.amount}
              date={item.date}
              transactionId={item.transactionId}
              lastDigits={item.lastDigits}
            />
          )}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No transactions found</Text>
          }
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Sizes.spacing.xxl,
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
    marginTop: Sizes.spacing.md,
    marginBottom: Sizes.spacing.xl,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Sizes.spacing.md,
    marginBottom: Sizes.spacing.md,
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
  transactionsList: {
    padding: Sizes.spacing.md,
  },
  transactionCard: {
    marginBottom: Sizes.spacing.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Sizes.spacing.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusprocessed: {
    backgroundColor: '#32D74B',
  },
  statuswaiting: {
    backgroundColor: '#FF9500',
  },
  statusfailed: {
    backgroundColor: '#FF3B30',
  },
  amount: {
    fontSize: Sizes.fontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: 'Inter-SemiBold',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.7,
    textTransform: 'capitalize',
    fontFamily: 'Inter-Regular',
  },
  date: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.text,
    opacity: 0.6,
    marginTop: Sizes.spacing.xl,
    fontFamily: 'Inter-Regular',
  },
  toggleContainer: {
    alignItems: 'flex-end',
    marginTop: Sizes.spacing.md,
    marginBottom: Sizes.spacing.xs,
  },
  toggleText: {
    color: '#E91E63',
    fontSize: Sizes.fontSize.sm,
    fontFamily: 'Inter-Medium',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  detailText: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
});
