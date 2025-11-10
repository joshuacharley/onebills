import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { StatusBar } from 'expo-status-bar';
import { NeonBackground } from '@/components/ui/neon-background';

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0B1420' }]}>
      <StatusBar style="light" />
      <NeonBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { borderColor: colors.tint + '15' }]}>
          <View style={[styles.logoBadge, { backgroundColor: colors.tint + '20' }]}>
            <Text style={[styles.logo, { color: '#00C3FF' }]}>💳</Text>
          </View>
          <Text style={[styles.brand, { color: '#9FB8C9' }]}>One<Text style={{ color: '#00C3FF', fontWeight: '800' }}>Bills</Text></Text>
          <Text style={[styles.heroSubtitle, { color: '#C7D2E0' }]}>
            Pay your bills and support loved ones with a single, secure app experience.
          </Text>
        </View>

        <View
          style={[
            styles.featureCard,
            {
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderColor: '#1E2A38',
            },
          ]}>
          <Text style={[styles.featureHeading, { color: colors.text }]}>
            Everything you need for effortless bill payments
          </Text>
          <View style={styles.featureList}>
            <FeatureItem
              label="Manage all your bills in one dashboard"
              color={colors.tint}
              textColor={colors.text}
            />
            <FeatureItem
              label="Send payments on behalf of friends & family"
              color={colors.tint}
              textColor={colors.text}
            />
            <FeatureItem
              label="Track receipts and stay on top of due dates"
              color={colors.tint}
              textColor={colors.text}
            />
          </View>
        </View>

        <View
          style={[
            styles.ctaCard,
            {
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderColor: '#1E2A38',
            },
          ]}>
          <Text style={[styles.ctaTitle, { color: colors.text }]}>Ready to get started?</Text>
          <Text style={[styles.ctaSubtitle, { color: '#C7D2E0' }]}>
            Create your account in minutes or sign in to continue.
          </Text>
          <View style={styles.buttons}>
            <Button
              title="Get Started"
              onPress={() => router.push('/(auth)/register')}
              variant="cta"
              size="large"
              fullWidth
            />
            <Button
              title="Sign In"
              onPress={() => router.push('/(auth)/login')}
              variant="outline"
              size="large"
              fullWidth
              style={styles.secondaryButton}
            />
            <Text style={[styles.bioText, { color: '#9FB8C9' }]}>Unlock with Biometrics</Text>
          </View>
        </View>
      </ScrollView>
      </NeonBackground>
    </SafeAreaView>
  );
}

function FeatureItem({
  label,
  color,
  textColor,
}: {
  label: string;
  color: string;
  textColor: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureBullet, { backgroundColor: color + '25', borderColor: color + '40' }]}>
        <Text style={[styles.featureBulletText, { color }]}>✓</Text>
      </View>
      <Text style={[styles.featureCopy, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    gap: 24,
  },
  hero: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 54,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  brand: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.85,
  },
  featureCard: {
    borderRadius: 24,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featureHeading: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureBullet: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBulletText: {
    fontSize: 18,
    fontWeight: '700',
  },
  featureCopy: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
    lineHeight: 22,
  },
  ctaCard: {
    borderRadius: 24,
    padding: 24,
    gap: 18,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  ctaSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    marginTop: 4,
  },
  bioText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
});

