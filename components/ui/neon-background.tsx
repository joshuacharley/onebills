import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinear, Stop } from 'react-native-svg';

interface NeonBackgroundProps {
  children?: React.ReactNode;
}

export function NeonBackground({ children }: NeonBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0B1420", "#0C1220"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Neon lines layer */}
      <Svg pointerEvents="none" width="100%" height="100%" viewBox="0 0 400 800" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinear id="blue" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#00C3FF" stopOpacity="0.0" />
            <Stop offset="50%" stopColor="#00C3FF" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#00C3FF" stopOpacity="0.0" />
          </SvgLinear>
          <SvgLinear id="red" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#FF6B5A" stopOpacity="0.0" />
            <Stop offset="50%" stopColor="#FF6B5A" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#FF6B5A" stopOpacity="0.0" />
          </SvgLinear>
        </Defs>

        {/* top blue */}
        <Path d="M10 90 C 80 90, 120 50, 200 50 S 320 90, 390 90" stroke="url(#blue)" strokeWidth={5} fill="none" />
        {/* top red */}
        <Path d="M10 140 C 120 140, 150 120, 220 120 S 310 140, 390 140" stroke="url(#red)" strokeWidth={5} fill="none" />
        {/* mid blue */}
        <Path d="M10 360 C 80 360, 160 330, 210 330 S 320 360, 390 360" stroke="url(#blue)" strokeWidth={5} fill="none" />
        {/* bottom red */}
        <Path d="M10 640 C 100 640, 150 600, 240 600 S 320 640, 390 640" stroke="url(#red)" strokeWidth={5} fill="none" />
      </Svg>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
