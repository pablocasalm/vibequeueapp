import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator
} from 'react-native';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import { Bone as Icon } from 'lucide-react-native';
import { Video as LucideIcon } from 'lucide-react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  
  const buttonStyle = [
    styles.button,
    isPrimary ? styles.primaryButton : styles.secondaryButton,
    disabled && styles.disabledButton,
    style,
  ];
  
  const textColorStyle = isPrimary 
    ? styles.primaryText 
    : styles.secondaryText;
  
  const combinedTextStyle = [
    styles.text,
    textColorStyle,
    disabled && styles.disabledText,
    textStyle,
  ];
  
  const renderIcon = () => {
    if (!icon || loading) return null;
    
    return (
      <Icon 
        icon={icon}
        size={20}
        color={isPrimary ? Colors.light.buttonText : Colors.light.buttonSecondaryText}
        style={[
          styles.icon,
          iconPosition === 'right' ? styles.iconRight : styles.iconLeft,
        ]}
      />
    );
  };
  
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={isPrimary ? Colors.light.buttonText : Colors.light.buttonSecondaryText} 
          size="small"
        />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          <Text style={combinedTextStyle}>{label}</Text>
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Sizes.buttonHeight,
    paddingHorizontal: Sizes.spacing.xl,
    borderRadius: Sizes.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: Colors.light.button,
  },
  secondaryButton: {
    backgroundColor: Colors.light.buttonSecondary,
    borderWidth: 1,
    borderColor: Colors.light.buttonSecondaryText,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: Sizes.fontSize.md,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: Colors.light.buttonText,
  },
  secondaryText: {
    color: Colors.light.buttonSecondaryText,
  },
  disabledText: {
    opacity: 0.8,
  },
  icon: {
    marginHorizontal: Sizes.spacing.xs,
  },
  iconLeft: {
    marginRight: Sizes.spacing.sm,
  },
  iconRight: {
    marginLeft: Sizes.spacing.sm,
  },
});