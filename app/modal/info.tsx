import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';

export default function InfoModal() {
  const router = useRouter();
  
  const handleClose = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Info</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          This application is developed by Efford AG based in Switzerland. In case of bugs or mal functionality please contact us as soon as possible.
        </Text>
        
        <View style={styles.versionInfo}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Current version:</Text>
            <Text style={styles.versionValue}>1.0.1</Text>
          </View>
          
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Latest available version:</Text>
            <Text style={styles.versionValue}>1.0.1</Text>
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Sizes.spacing.md,
  },
  description: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: Sizes.spacing.xl,
    fontFamily: 'Inter-Regular',
  },
  versionInfo: {
    backgroundColor: Colors.light.card,
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    gap: Sizes.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  versionValue: {
    fontSize: Sizes.fontSize.md,
    color: Colors.light.text,
    fontFamily: 'Inter-Medium',
  },
});