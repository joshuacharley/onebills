import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth-store';
import { validatePhone, formatPhoneNumber } from '@/lib/utils/validation';
import { getUserFriendlyMessage } from '@/lib/utils/errors';
import { StatusBar } from 'expo-status-bar';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = (params.mode as string) || 'login';
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signInWithPhone, verifyOtp, isLoading } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});
  const [countdown, setCountdown] = useState(0);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }

    if (!validatePhone(phone)) {
      setErrors({ phone: 'Please enter a valid phone number' });
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(phone);
      await signInWithPhone(formattedPhone);
      setStep('otp');
      setCountdown(60);
      setErrors({});
    } catch (error: any) {
      const userMessage = getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage, [{ text: 'OK' }]);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(phone);
      await verifyOtp(formattedPhone, otpCode);
      // Navigate based on mode
      if (mode === 'register') {
        router.replace('/(auth)/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      const userMessage = getUserFriendlyMessage(error);
      Alert.alert('Verification Failed', userMessage, [{ text: 'OK' }]);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  if (step === 'otp') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setStep('phone')}
              style={styles.backButton}>
              <Text style={[styles.backText, { color: colors.tint }]}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Verify OTP</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={{ fontWeight: '600' }}>{phone}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (otpInputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#1F1F1F' : '#F5F5F5',
                    color: colors.text,
                    borderColor: errors.otp ? '#EF4444' : 'transparent',
                  },
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
          {errors.otp && (
            <Text style={styles.error}>{errors.otp}</Text>
          )}

          <Button
            title="Verify"
            onPress={handleVerifyOtp}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            size="large"
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: colors.icon }]}>
              Didn't receive the code?{' '}
            </Text>
            {countdown > 0 ? (
              <Text style={[styles.countdown, { color: colors.icon }]}>
                Resend in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={[styles.resendLink, { color: colors.tint }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.tint }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {mode === 'register' ? 'Sign Up' : 'Sign In'} with Phone
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            We'll send you a verification code
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Phone Number"
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

          <Button
            title="Send OTP"
            onPress={handleSendOtp}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            size="large"
            style={styles.sendButton}
          />
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
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  sendButton: {
    marginTop: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    borderWidth: 2,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  countdown: {
    fontSize: 14,
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

