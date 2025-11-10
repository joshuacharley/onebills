import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

export default function BillsLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="[categoryId]" options={{ title: 'Service Providers' }} />
      </Stack>
    </ThemeProvider>
  );
}
