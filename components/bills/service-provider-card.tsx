import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

interface ServiceProviderCardProps {
  provider: Database['public']['Tables']['service_providers']['Row'];
  onPress?: () => void;
}

export function ServiceProviderCard({ provider, onPress }: ServiceProviderCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colorScheme === 'dark' ? '#0B1220' : '#FFFFFF',
          borderColor: colors.tint + '18',
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <View style={[styles.avatar, { backgroundColor: colors.tint + '20' }] }>
        <Text style={[styles.avatarText, { color: colors.tint }]}>
          {provider.name.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {provider.name}
        </Text>
        {provider.api_endpoint ? (
          <Text style={[styles.meta, { color: colors.icon }]} numberOfLines={1}>
            {provider.api_endpoint.replace(/^https?:\/\//, '')}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.navigate, { color: colors.tint }]}>{'›'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: 13,
  },
  navigate: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 4,
  },
});
