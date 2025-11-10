import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

interface BillCategoryCardProps {
  category: Database['public']['Tables']['bill_categories']['Row'];
  onPress?: () => void;
}

export function BillCategoryCard({ category, onPress }: BillCategoryCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colorScheme === 'dark' ? '#0F172A' : '#FFFFFF',
          borderColor: colors.tint + '15',
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.tint + '18' }] }>
        <Text style={styles.icon}>{category.icon ?? '🧾'}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{category.name}</Text>
        {category.description ? (
          <Text style={[styles.subtitle, { color: colors.icon }]} numberOfLines={2}>
            {category.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
