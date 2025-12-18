import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useDemoMode } from '@/hooks/use-demo-mode';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, 'tint');
  const { enableDemoMode } = useDemoMode();

  const handleDemoMode = async () => {
    await enableDemoMode();
    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    // Navigate to actual login (to be implemented)
    router.push('/(tabs)');
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 40),
          paddingBottom: Math.max(insets.bottom, 40),
        },
      ]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="title" style={styles.title}>
          Luxe Vision Creator
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          AI-Powered Creative Studio
        </ThemedText>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <ThemedText style={styles.feature}>✨ Generate Images & Videos</ThemedText>
        <ThemedText style={styles.feature}>🎨 AI Creative Director (Muse)</ThemedText>
        <ThemedText style={styles.feature}>📊 Manage Your Creations</ThemedText>
        <ThemedText style={styles.feature}>⚙️ Multi-Provider API Support</ThemedText>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.demoButton, { backgroundColor: tintColor }]}
          onPress={handleDemoMode}
        >
          <ThemedText style={styles.demoButtonText}>
            Try Demo Mode
          </ThemedText>
          <ThemedText style={styles.demoButtonSubtext}>
            Explore all features without login
          </ThemedText>
        </Pressable>

        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <ThemedText style={[styles.loginButtonText, { color: tintColor }]}>
            Sign In
          </ThemedText>
        </Pressable>
      </View>

      {/* Footer */}
      <ThemedText style={styles.footer}>
        © 2024 Luxe Studio • v1.1
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  features: {
    gap: 16,
    alignItems: 'flex-start',
    width: '100%',
  },
  feature: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  demoButton: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  demoButtonSubtext: {
    color: '#000000',
    fontSize: 14,
    opacity: 0.8,
  },
  loginButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 228, 226, 0.3)',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
  },
});
