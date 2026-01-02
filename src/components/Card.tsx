import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({ children, style, onPress, variant = 'elevated' }: CardProps) {
  const cardStyles: StyleProp<ViewStyle> = [styles.base, styles[variant], style];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  elevated: {
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: {
    backgroundColor: colors.surfaceVariant,
  },
});
