import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../constants/theme';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  disabled = false,
  style,
}: IconButtonProps) {
  const buttonSize = {
    sm: 32,
    md: 44,
    lg: 56,
  }[size];

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 28,
  }[size];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        { width: buttonSize, height: buttonSize },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, { fontSize: iconSize }]}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  default: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    textAlign: 'center',
  },
});
