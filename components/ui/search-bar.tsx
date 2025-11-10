import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SearchBarProps extends TextInputProps {
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({ placeholder = 'Search', value, onChangeText, onClear, ...props }: SearchBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isFocused, setIsFocused] = useState(false);

  const palette = useMemo(() => {
    const isDark = colorScheme === 'dark';
    return {
      background: isDark ? '#111827' : '#F8FAFC',
      placeholder: isDark ? '#9CA3AF' : '#6B7280',
      border: isDark ? '#1F2937' : '#E2E8F0',
    };
  }, [colorScheme]);

  const showClear = !!value?.length && !!onClear;

  return (
    <View style={[styles.container, { borderColor: isFocused ? colors.tint : palette.border, backgroundColor: palette.background }] }>
      <Text style={[styles.icon, { color: colors.icon }]}>🔍</Text>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={palette.placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={(event) => {
          setIsFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          props.onBlur?.(event);
        }}
        selectionColor={colors.tint}
        {...props}
      />
      {showClear && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Text style={[styles.clearText, { color: colors.tint }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    minHeight: 52,
    gap: 12,
  },
  icon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
