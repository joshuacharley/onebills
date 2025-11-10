import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useServiceProviders } from '@/lib/hooks/use-bills';
import { SearchBar } from '@/components/ui/search-bar';
import { ServiceProviderCard } from '@/components/bills/service-provider-card';

export default function ServiceProviderDirectory() {
  const params = useLocalSearchParams<{
    categoryId: string;
    categoryName?: string;
    categoryIcon?: string;
  }>();
  const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
  const categoryName = Array.isArray(params.categoryName) ? params.categoryName[0] : params.categoryName;
  const categoryIcon = Array.isArray(params.categoryIcon) ? params.categoryIcon[0] : params.categoryIcon;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { data: providers, isLoading, isRefetching, refetch, error } = useServiceProviders(categoryId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProviders = useMemo(() => {
    if (!providers) return [];
    if (!searchQuery.trim()) return providers;
    const query = searchQuery.trim().toLowerCase();
    return providers.filter((provider) => provider.name.toLowerCase().includes(query));
  }, [providers, searchQuery]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.icon }]}>Loading providers…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load providers</Text>
        <Text style={[styles.errorSubtitle, { color: colors.icon }]}>Please check your connection and try again.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceProviderCard provider={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.categoryBadge, { backgroundColor: colors.tint + '18', color: colors.tint }]}>
              {categoryIcon ?? '🧾'} {categoryName ?? 'Category'}
            </Text>
            <Text style={[styles.heading, { color: colors.text }]}>Service providers</Text>
            <Text style={[styles.subheading, { color: colors.icon }] }>
              Choose a provider to view billing options and schedule payments.
            </Text>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search providers"
              autoCorrect={false}
            />
            <Text style={[styles.meta, { color: colors.icon }] }>
              {filteredProviders.length} providers available
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No providers found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }] }>
              Try a different search or check back soon for more providers.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 36,
    gap: 16,
  },
  header: {
    gap: 14,
    marginBottom: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 14,
    fontWeight: '700',
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subheading: {
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
