import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'alt';
};

export default function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View 
      style={[
        styles.card, 
        variant === 'alt' ? styles.altCard : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  altCard: {
    backgroundColor: Colors.light.cardAlt,
  },
});