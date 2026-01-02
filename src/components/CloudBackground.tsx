import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface CloudBackgroundProps {
  children: React.ReactNode;
}

export function CloudBackground({ children }: CloudBackgroundProps) {
  return (
    <View style={styles.container}>
      <Svg
        width={width}
        height={200}
        viewBox="0 0 390 200"
        style={styles.topCloud}
      >
        <Path
          d="M-50 0 L200 0 Q180 80 120 100 Q60 120 30 80 Q0 40 -50 60 Z"
          fill={colors.primary}
        />
        <Path
          d="M-50 0 L200 0 Q175 75 115 95 Q55 115 25 75 Q-5 35 -50 55 Z"
          fill={colors.primaryLight}
          opacity={0.5}
        />
        <Path
          d="M250 0 L450 0 L450 100 Q400 120 350 80 Q300 40 250 60 Q200 80 200 40 Q200 0 250 0 Z"
          fill={colors.primary}
        />
        <Path
          d="M255 0 L445 0 L445 95 Q395 115 345 75 Q295 35 245 55 Q195 75 195 35 Q195 -5 255 0 Z"
          fill={colors.primaryLight}
          opacity={0.5}
        />
      </Svg>

      <View style={styles.content}>{children}</View>

      <Svg
        width={width}
        height={200}
        viewBox="0 0 390 200"
        style={styles.bottomCloud}
      >
        <Path
          d="M-50 200 L150 200 Q130 120 80 100 Q30 80 -20 120 Q-70 160 -50 200 Z"
          fill={colors.primaryDark}
        />
        <Path
          d="M-45 200 L145 200 Q125 125 75 105 Q25 85 -15 125 Q-65 165 -45 200 Z"
          fill={colors.primary}
          opacity={0.7}
        />
        <Path
          d="M100 200 L450 200 Q430 140 380 120 Q330 100 280 140 Q230 180 180 160 Q130 140 100 200 Z"
          fill={colors.primaryDark}
        />
        <Path
          d="M105 200 L445 200 Q425 145 375 125 Q325 105 275 145 Q225 185 175 165 Q125 145 105 200 Z"
          fill={colors.primary}
          opacity={0.7}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topCloud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomCloud: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
