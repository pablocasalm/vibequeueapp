import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';

export default function CashOutModal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Mock data
  const withdrawableAmount = 293.45;
  
  const handleClose = () => {
    router.back();
  };
  
  const handleCashOut = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.back();
      // Show success message or navigate to history
    }, 2000);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cash Out</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>Withdrawable amount</Text>
        <Text style={styles.amount}>{withdrawableAmount} CHF</Text>
      </Card>
      
      <Text style={styles.infoText}>
        The amount will be transferred to your connected payment method.
        This process can take up to 5 business days.
      </Text>
      
      <Button
        label="Cash Out"
        onPress={handleCashOut}
        loading={loading}
        style={styles.cashOutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Sizes.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Sizes.spacing.xl,
    marginBottom: Sizes.spacing.xl,
    position: 'relative',
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
    right: 0,
    top: 0,
    padding: Sizes.spacing.xs,
  },
  amountCard: {
    marginTop: Sizes.spacing.lg,
    alignItems: 'center',
    paddingVertical: Sizes.spacing.xl,
  },
  amountLabel: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.8,
    marginBottom: Sizes.spacing.sm,
    fontFamily: 'Inter-Regular',
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.light.text,
    fontFamily: 'Inter-Bold',
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