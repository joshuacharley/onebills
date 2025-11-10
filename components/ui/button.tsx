import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cta';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isDisabled = disabled || loading;

  const sizeStyles = {
    small: { paddingVertical: 10, paddingHorizontal: 18, fontSize: 14, minHeight: 44 },
    medium: { paddingVertical: 14, paddingHorizontal: 22, fontSize: 16, minHeight: 50 },
    large: { paddingVertical: 18, paddingHorizontal: 26, fontSize: 18, minHeight: 56 },
  } as const;

  const currentSize = sizeStyles[size] ?? sizeStyles.medium;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: currentSize.minHeight,
      paddingVertical: currentSize.paddingVertical,
      paddingHorizontal: currentSize.paddingHorizontal,
      ...(fullWidth && { width: '100%' }),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 16,
          shadowOpacity: variant === 'primary' && !isDisabled ? 0.16 : 0.08,
        },
        android: {
          elevation: variant === 'primary' && !isDisabled ? 6 : 2,
        },
      }),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? '#9CA3AF' : colors.tint,
        };
      case 'cta':
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? '#F59E8F' : '#FF6B5A',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? '#9CA3AF' : '#6B7280',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isDisabled ? '#D1D5DB' : colors.tint,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderRadius: 12,
          paddingVertical: currentSize.paddingVertical - 4,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    };

    return { ...baseStyle, fontSize: currentSize.fontSize };
  };

  const getTextColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') {
      return isDisabled ? '#9CA3AF' : colors.tint;
    }
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[getTextStyle(), { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

