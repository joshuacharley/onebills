import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth-store';
import { validatePhone } from '@/lib/utils/validation';
import { getUserFriendlyMessage } from '@/lib/utils/errors';
import { StatusBar } from 'expo-status-bar';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { updateProfile, profile, user, isLoading } = useAuthStore();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    dateOfBirth?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Date of birth is optional for MVP, but validate if provided
    if (dateOfBirth && dateOfBirth.length !== 10) {
      newErrors.dateOfBirth = 'Please enter a valid date (DD/MM/YYYY)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });

      // For MVP, we'll set KYC status to pending
      // In production, you'd submit KYC documents here
      Alert.alert(
        'Profile Updated',
        'Your profile has been set up successfully. KYC verification is pending.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      const userMessage = getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage, [{ text: 'OK' }]);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can complete your profile later, but some features may be limited.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Complete Your Profile</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Help us verify your identity (KYC)
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Basic Information
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>
              Required for account verification
            </Text>
          </View>

          <Input
            label="Full Name *"
            placeholder="Enter your full legal name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) setErrors({ ...errors, fullName: undefined });
            }}
            autoCapitalize="words"
            autoComplete="name"
            error={errors.fullName}
          />

          <Input
            label="Phone Number *"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            keyboardType="phone-pad"
            autoComplete="tel"
            error={errors.phone}
          />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Additional Information
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>
              Optional - Can be completed later
            </Text>
          </View>

          <Input
            label="Date of Birth"
            placeholder="DD/MM/YYYY"
            value={dateOfBirth}
            onChangeText={(text) => {
              // Simple date formatting
              let formatted = text.replace(/\D/g, '');
              if (formatted.length >= 2) {
                formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
              }
              if (formatted.length >= 5) {
                formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
              }
              setDateOfBirth(formatted);
              if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: undefined });
            }}
            keyboardType="number-pad"
            maxLength={10}
            error={errors.dateOfBirth}
          />

          <Input
            label="Address"
            placeholder="Enter your address (optional)"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="words"
            autoComplete="street-address"
            multiline
            numberOfLines={3}
          />

          <View style={styles.kycInfo}>
            <Text style={[styles.kycTitle, { color: colors.text }]}>
              KYC Verification
            </Text>
            <Text style={[styles.kycText, { color: colors.icon }]}>
              Your profile will be reviewed for verification. This process typically takes 1-2 business days.
            </Text>
            <Text style={[styles.kycStatus, { color: colors.tint }]}>
              Status: Pending
            </Text>
          </View>

          <Button
            title="Complete Setup"
            onPress={handleContinue}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            size="large"
            style={styles.continueButton}
          />

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.icon }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  kycInfo: {
    marginTop: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  kycTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  kycText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  kycStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    marginBottom: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
  },
});

