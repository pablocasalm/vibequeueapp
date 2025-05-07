import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeDollarSign, X } from 'lucide-react-native';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import WeeklyChart from '@/components/earnings/WeeklyChart';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { EarningsService } from '@/services/earningsService';
import MessageModal from '@/components/modals/MessageModal';
import { MessageType } from '@/types/apiObjects';
import AuthGuard from '@/authentification/authGuard';

// Mock data for the events chart
const eventsData = [
  { id: '1', name: 'Latino', amount: 130 },
  { id: '2', name: 'Plaza', amount: 245 },
  { id: '3', name: 'X-Mas', amount: 180 },
  { id: '4', name: 'NYE', amount: 167 },
  { id: '5', name: 'House', amount: 220 },
  { id: '6', name: 'EDM', amount: 195 },
  { id: '7', name: 'Rock', amount: 150 },
  { id: '8', name: 'Jazz', amount: 175 },
];

type EarningsScreenProps = {
  isPaymentConnected?: boolean;
  withdrawableAmount?: number;
};

export default function EarningsScreen() {
  const [isPaymentConnected, setIsPaymentConnected] = useState(true);
  const [withdrawableAmount, setWithdrawableAmount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [eventsData, setEventsData] = useState<
    { id: string; name: string; amount: number }[]
  >([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);

  const router = useRouter();
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(
    withdrawableAmount.toString()
  );
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    Type: MessageType;
    Title: string;
    Message: string;
  }>({
    Type: 'info', // ✅ default to a real string, not the type
    Title: '',
    Message: '',
  });

  useEffect(() => {
    const fetchEarningsProps = async () => {
      try {
        const response = await EarningsService.getEarningScreenProps();

        if (response?.success && response.message) {
          const parsed = JSON.parse(response.message);
          setIsPaymentConnected(parsed.IsPaymentConnected);
          setWithdrawableAmount(parsed.WithdrawableAmount);
        }
      } catch (error) {
        console.error('Error fetching earnings props:', error);
      } finally {
        setLoadingData(false);
      }
    };

    const fetchGraphData = async () => {
      try {
        const response = await EarningsService.getGraphData();

        if (response?.success && response.message) {
          const parsed = JSON.parse(response.message);
          const mappedData = parsed.graphdata.map((item: any) => ({
            id: item.Id.toString(),
            name: item.Name,
            amount: item.Amount,
          }));

          setEventsData(mappedData);
          setTotalEarnings(parsed.totalearnings);
        }
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };
    setLoading(true);
    fetchEarningsProps();
    fetchGraphData();
    setLoading(false);
  }, []);

  const validateAmount = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (amount > withdrawableAmount) {
      setError('Amount exceeds available balance');
      return false;
    }
    return true;
  };

  const handleConfirmCashOut = async () => {
    if (!validateAmount()) return;

    setLoading(true);

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amount > withdrawableAmount) {
      setError('Amount exceeds available balance');
      return;
    }

    setLoading(true);

    try {
      const amountCents = Math.round(amount * 100);

      const response = await EarningsService.cashOut({
        AmountCents: amountCents,
        Currency: 'CHF',
      });

      setLoading(false);

      if (response.success) {
        setShowCashOutModal(false);
        //TODO Success modal
      } else {
        setError(response.failureReason);
      }
    } catch (err) {
      console.error('Cash out error:', err);
      setError('Something went wrong during the cash out process.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCashOutModal = async () => {
    if (!isPaymentConnected) {
      setModalData({
        Type: 'warning',
        Title: 'Warning',
        Message: 'No payment method connected',
      });
      setModalVisible(true);
    } else {
      setShowCashOutModal(true);
    }
  };

  return (
    <AuthGuard>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Earnings</Text>
          </View>

          <View style={styles.separator} />

          <Card style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.label}>Payment</Text>
                <Text
                  style={[
                    styles.statusText,
                    isPaymentConnected
                      ? styles.connectedText
                      : styles.notConnectedText,
                  ]}
                >
                  {isPaymentConnected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryItem}>
                <Text style={styles.label}>Withdrawable</Text>
                <Text style={styles.label}>
                  {withdrawableAmount.toFixed(2)} CHF
                </Text>
              </View>
            </View>
          </Card>

          <WeeklyChart data={eventsData} totalEarnings={totalEarnings} />

          {/*<Card style={styles.chartCard}>
          <Text style={styles.dateRange}>Events Overview</Text>
          <Text style={styles.totalEarnings}>{totalEarnings} CHF</Text>
          <WeeklyChart data={eventsData} totalEarnings={totalEarnings} />
          
        </Card>*/}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              //onPress={() => setShowCashOutModal(true)}
              onPress={() => handleOpenCashOutModal()}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <BadgeDollarSign size={24} color="#fff" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Cash out</Text>
                <Text style={styles.actionSubtitle}>
                  Transfer your earnings
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cash Out Modal */}
        <Modal
          visible={showCashOutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCashOutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cash Out</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCashOutModal(false)}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Card style={styles.amountCard}>
                <Text style={styles.amountLabel}>Withdraw</Text>
                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={styles.amountInput}
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.light.placeholder}
                  />
                  <Text style={styles.currencyLabel}>CHF</Text>
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </Card>

              <Text style={styles.infoText}>
                The amount will be transferred to your connected payment method.
                This process can take up to 5 business days.
              </Text>

              <Button
                label="Cash Out"
                onPress={handleConfirmCashOut}
                loading={loading}
                style={styles.cashOutButton}
              />
            </View>
          </View>
        </Modal>

        <MessageModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          data={modalData}
        />
      </ScrollView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Sizes.spacing.md,
    paddingBottom: Sizes.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Sizes.spacing.xl,
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
  summaryCard: {
    marginBottom: Sizes.spacing.md,
    backgroundColor: '#1A1A1A',
    padding: 0,
  },
  summaryContent: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    padding: Sizes.spacing.lg,
    alignItems: 'center',
    gap: Sizes.spacing.md,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  statusText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: 'Inter-Medium',
  },
  connectedText: {
    color: '#32D74B',
  },
  notConnectedText: {
    color: '#FF3B30',
  },
  chartCard: {
    marginBottom: Sizes.spacing.xl,
    paddingVertical: Sizes.spacing.lg,
  },
  dateRange: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  totalEarnings: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: Sizes.spacing.xs,
    fontFamily: 'Inter-Bold',
  },
  actionsContainer: {
    gap: Sizes.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    marginLeft: Sizes.spacing.lg,
    flex: 1,
  },
  actionTitle: {
    fontSize: Sizes.fontSize.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  actionSubtitle: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.6,
    fontFamily: 'Inter-Regular',
  },
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
  amountCard: {
    marginTop: Sizes.spacing.lg,
    alignItems: 'center',
    paddingVertical: Sizes.spacing.md,
  },
  amountLabel: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.8,
    marginBottom: Sizes.spacing.sm,
    fontFamily: 'Inter-Regular',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.inputBackground,
    borderRadius: Sizes.radius.sm,
    paddingHorizontal: Sizes.spacing.md,
    height: 48,
    width: '100%',
  },
  amountInput: {
    flex: 1,
    height: '75%',
    width: '30%',
    fontSize: Sizes.fontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    paddingRight: Sizes.spacing.sm,
  },
  currencyLabel: {
    fontSize: Sizes.fontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: 'Inter-SemiBold',
    marginLeft: Sizes.spacing.sm,
  },
  errorText: {
    color: Colors.light.inactive,
    marginTop: Sizes.spacing.sm,
    fontSize: Sizes.fontSize.sm,
    fontFamily: 'Inter-Regular',
  },
  infoText: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.light.text,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: Sizes.spacing.xl,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  cashOutButton: {
    marginTop: Sizes.spacing.xl,
  },
});
