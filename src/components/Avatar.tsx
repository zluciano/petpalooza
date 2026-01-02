import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius } from '../constants/theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  onPress?: () => void;
}

export function Avatar({ uri, name, size = 48, onPress }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textStyle = {
    fontSize: size * 0.4,
  };

  const content = uri ? (
    <Image source={{ uri }} style={[styles.image, containerStyle]} />
  ) : (
    <View style={[styles.placeholder, containerStyle]}>
      <Text style={[styles.initials, textStyle]}>{initials}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.primaryLight,
  },
  placeholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
});
