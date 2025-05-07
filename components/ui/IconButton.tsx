import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { Video as LucideIcon } from 'lucide-react-native';

type IconButtonProps = {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  disabled?: boolean;
};

export default function IconButton({
  icon: Icon,
  onPress,
  size = Sizes.iconSize.md,
  color = Colors.light.text,
  style,
  disabled = false,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});