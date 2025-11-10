# Frontend Integration Guide - OneBills

## React Native/Expo Setup for Backend Integration

### Step 1: Install Required Dependencies

```bash
npm install axios
npm install @tanstack/react-query
npm install zustand
npm install react-hook-form
npm install @hookform/resolvers zod
npm install expo-secure-store
npm install @react-native-async-storage/async-storage
npm install expo-notifications
```

### Step 2: Project Structure

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   └── verify-otp.tsx
├── (tabs)/
│   ├── index.tsx          # Home/Dashboard
│   ├── bills.tsx          # My Bills
│   ├── pay.tsx            # Pay Bills
│   └── history.tsx        # Transaction History
├── bills/
│   ├── browse.tsx         # Browse Bill Categories
│   ├── add-bill.tsx       # Add New Bill
│   └── [id].tsx           # Bill Details
├── payments/
│   ├── initiate.tsx       # Initiate Payment
│   └── success.tsx        # Payment Success
└── _layout.tsx

lib/
├── api/
│   ├── client.ts          # Axios instance
│   ├── auth.api.ts
│   ├── bills.api.ts
│   ├── payments.api.ts
│   └── transactions.api.ts
├── store/
│   ├── auth.store.ts      # Zustand auth store
│   └── app.store.ts
├── hooks/
│   ├── use-auth.ts
│   └── use-bills.ts
└── utils/
    ├── storage.ts
    └── validation.ts

constants/
└── config.ts              # API endpoints
```

### Step 3: API Client Setup

Create `lib/api/client.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api' // Development
  : 'https://api.onebills.com/api'; // Production

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('refresh_token');
          // Redirect to login
        }
        return Promise.reject(error);
      }
    );
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;
```

### Step 4: API Services

Create `lib/api/auth.api.ts`:

```typescript
import { apiClient } from './client';

export interface RegisterDto {
  email: string;
  phone: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export const authApi = {
  register: async (data: RegisterDto) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginDto) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
  },
};
```

Create `lib/api/bills.api.ts`:

```typescript
import { apiClient } from './client';

export interface BillCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  categoryId: string;
  logoUrl: string;
  isActive: boolean;
}

export interface UserBill {
  id: string;
  userId: string;
  serviceProviderId: string;
  accountNumber: string;
  accountName: string;
  isSaved: boolean;
  serviceProvider?: ServiceProvider;
  createdAt: string;
}

export interface CreateBillDto {
  serviceProviderId: string;
  accountNumber: string;
  accountName: string;
}

export const billsApi = {
  getCategories: async () => {
    const response = await apiClient.get<BillCategory[]>('/bills/categories');
    return response.data;
  },

  getProviders: async (categoryId?: string) => {
    const params = categoryId ? { categoryId } : {};
    const response = await apiClient.get<ServiceProvider[]>('/bills/providers', {
      params,
    });
    return response.data;
  },

  getMyBills: async () => {
    const response = await apiClient.get<UserBill[]>('/bills/my-bills');
    return response.data;
  },

  addBill: async (data: CreateBillDto) => {
    const response = await apiClient.post<UserBill>('/bills/add', data);
    return response.data;
  },

  deleteBill: async (id: string) => {
    await apiClient.delete(`/bills/${id}`);
  },
};
```

Create `lib/api/payments.api.ts`:

```typescript
import { apiClient } from './client';

export interface InitiatePaymentDto {
  billId: string;
  amount: number;
  paymentMethodId: string;
  recipientDetails?: {
    name: string;
    phone?: string;
    email?: string;
  };
}

export interface PaymentResponse {
  transactionId: string;
  paymentIntent?: string; // For Stripe
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export const paymentsApi = {
  initiatePayment: async (data: InitiatePaymentDto) => {
    const response = await apiClient.post<PaymentResponse>(
      '/payments/initiate',
      data
    );
    return response.data;
  },

  verifyPayment: async (transactionId: string) => {
    const response = await apiClient.post('/payments/verify', {
      transactionId,
    });
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await apiClient.get<PaymentMethod[]>(
      '/payments/methods'
    );
    return response.data;
  },

  addPaymentMethod: async (data: any) => {
    const response = await apiClient.post<PaymentMethod>(
      '/payments/methods',
      data
    );
    return response.data;
  },
};
```

### Step 5: State Management (Zustand)

Create `lib/store/auth.store.ts`:

```typescript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, AuthResponse } from '../api/auth.api';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    phone: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      await SecureStore.setItemAsync('auth_token', response.access_token);
      await SecureStore.setItemAsync(
        'refresh_token',
        response.refresh_token
      );
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    try {
      const response = await authApi.register(data);
      await SecureStore.setItemAsync('auth_token', response.access_token);
      await SecureStore.setItemAsync(
        'refresh_token',
        response.refresh_token
      );
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        // Optionally verify token with backend
        set({ isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
```

### Step 6: React Query Setup

Update `app/_layout.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth.store';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Your existing layout */}
    </QueryClientProvider>
  );
}
```

### Step 7: Custom Hooks

Create `lib/hooks/use-bills.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi, CreateBillDto } from '../api/bills.api';

export const useBillCategories = () => {
  return useQuery({
    queryKey: ['bill-categories'],
    queryFn: () => billsApi.getCategories(),
  });
};

export const useServiceProviders = (categoryId?: string) => {
  return useQuery({
    queryKey: ['service-providers', categoryId],
    queryFn: () => billsApi.getProviders(categoryId),
    enabled: !!categoryId || categoryId === undefined,
  });
};

export const useMyBills = () => {
  return useQuery({
    queryKey: ['my-bills'],
    queryFn: () => billsApi.getMyBills(),
  });
};

export const useAddBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBillDto) => billsApi.addBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bills'] });
    },
  });
};
```

### Step 8: Environment Configuration

Create `constants/config.ts`:

```typescript
import Constants from 'expo-constants';

export const config = {
  apiUrl:
    __DEV__ || Constants.expoConfig?.extra?.useLocalApi
      ? 'http://localhost:3000/api'
      : 'https://api.onebills.com/api',
  stripePublishableKey: Constants.expoConfig?.extra?.stripePublishableKey,
};
```

Update `app.json`:

```json
{
  "expo": {
    "extra": {
      "useLocalApi": true,
      "stripePublishableKey": "pk_test_your_key"
    }
  }
}
```

---

## Example Screen Implementation

### Login Screen (`app/(auth)/login.tsx`)

```typescript
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '@/lib/store/auth.store';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## Testing API Connection

Create a test component to verify backend connection:

```typescript
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { apiClient } from '@/lib/api/client';

export default function ApiTest() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    apiClient
      .get('/health')
      .then(() => setStatus('✅ Connected'))
      .catch(() => setStatus('❌ Connection Failed'));
  }, []);

  return (
    <View>
      <Text>API Status: {status}</Text>
    </View>
  );
}
```

---

## Next Steps

1. Implement authentication screens
2. Create bill browsing UI
3. Build payment flow
4. Add transaction history
5. Implement error handling
6. Add loading states
7. Test on real devices

---

## Tips

- Use React Query for all API calls (caching, refetching)
- Store sensitive data in SecureStore
- Handle network errors gracefully
- Show loading states during API calls
- Validate forms before submission
- Test on both iOS and Android

