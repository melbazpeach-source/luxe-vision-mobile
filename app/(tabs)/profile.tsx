import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E5E4E2', dark: '#333333' }, 'icon');
  const colorScheme = useColorScheme();

  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [showApiKeys, setShowApiKeys] = useState(false);

  const handleLogin = () => {
    Alert.alert(
      'Login',
      'Authentication flow will be implemented with beta code validation',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade Subscription',
      'Pricing modal will open with Stripe integration',
      [{ text: 'OK' }]
    );
  };

  const renderSettingRow = (
    icon: any,
    label: string,
    value?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <Pressable
      style={[styles.settingRow, { borderBottomColor: borderColor }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <IconSymbol name={icon} size={20} color={tintColor} />
        <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      </View>
      {rightElement || (
        <View style={styles.settingRight}>
          {value && <ThemedText style={styles.settingValue}>{value}</ThemedText>}
          {onPress && <IconSymbol name="chevron.right" size={16} color={borderColor} />}
        </View>
      )}
    </Pressable>
  );

  if (!isAuthenticated || !user) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom + 80, 100),
            },
          ]}
        >
          <View style={styles.loginPrompt}>
            <ThemedText type="title" style={styles.loginTitle}>
              Welcome to Luxe
            </ThemedText>
            <ThemedText style={styles.loginSubtitle}>
              Sign in to access your creations, manage subscriptions, and unlock premium features
            </ThemedText>
            <Pressable
              style={[styles.loginButton, { backgroundColor: tintColor }]}
              onPress={handleLogin}
            >
              <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom + 80, 100),
          },
        ]}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.avatarText}>
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.userName}>
            {user.name || user.email || 'User'}
          </ThemedText>
          <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
          <View style={[styles.badge, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.badgeText}>FREE</ThemedText>
          </View>
        </View>

        {/* Innovative Features */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🚀 Innovative Features
          </ThemedText>
          <View style={[styles.card, { borderColor }]}>
            <Pressable
              style={[styles.featureRow, { borderBottomColor: borderColor }]}
              onPress={() => router.push('/animation-timeline' as any)}
            >
              <ThemedText style={styles.featureIcon}>🎬</ThemedText>
              <View style={styles.featureInfo}>
                <ThemedText type="defaultSemiBold">Animation Timeline</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Multi-scene narratives with audio-reactive generation
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={borderColor} />
            </Pressable>
            <Pressable
              style={styles.featureRow}
              onPress={() => router.push('/ar-preview' as any)}
            >
              <ThemedText style={styles.featureIcon}>📱</ThemedText>
              <View style={styles.featureInfo}>
                <ThemedText type="defaultSemiBold">AR Preview</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Place creations in real-world with Snap Lens export
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={borderColor} />
            </Pressable>
          </View>
        </View>

        {/* Enhancement Features */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ✨ Enhancement Features
          </ThemedText>
          <View style={[styles.card, { borderColor }]}>
            <Pressable
              style={[styles.featureRow, { borderBottomColor: borderColor }]}
              onPress={() => router.push('/prompt-builder' as any)}
            >
              <ThemedText style={styles.featureIcon}>🎨</ThemedText>
              <View style={styles.featureInfo}>
                <ThemedText type="defaultSemiBold">Smart Prompt Builder</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Build prompts with visual components
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={borderColor} />
            </Pressable>
            <Pressable
              style={[styles.featureRow, { borderBottomColor: borderColor }]}
              onPress={() => router.push('/style-library' as any)}
            >
              <ThemedText style={styles.featureIcon}>🎭</ThemedText>
              <View style={styles.featureInfo}>
                <ThemedText type="defaultSemiBold">Style Library</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Save and reuse visual styles
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={borderColor} />
            </Pressable>
            <Pressable
              style={[styles.featureRow, { borderBottomColor: borderColor }]}
              onPress={() => router.push('/prompt-history' as any)}
            >
              <ThemedText style={styles.featureIcon}>📜</ThemedText>
              <View style={styles.featureInfo}>
                <ThemedText type="defaultSemiBold">Prompt History</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Search and reuse past prompts
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={borderColor} />
            </Pressable>
            <Pressable
              style={[styles.featureRow, { borderBottomColor: borderColor }]}
              onPress={() => router.push('/style-mixer' as any)}
            >
              <ThemedText style={styles.featureIcon}>🎨</ThemedText>
              <View style={styles.featureInfo}>
                <ThemedText type="defaultSemiBold">Style Mixer</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Blend multiple styles with ratios
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={borderColor} />
            </Pressable>
            <Pressable
              style={styles.featureRow}
              onPress={() => router.push('/workspace' as any)}
            >
              <ThemedText style={styles.featureIcon}>👥</ThemedText>
              <View style={styles.featureInfo}>
                <ThemedText type="defaultSemiBold">Collaboration</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Real-time team workspaces
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={borderColor} />
            </Pressable>
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Subscription
          </ThemedText>
          <View style={[styles.card, { borderColor }]}>
            <View style={styles.subscriptionInfo}>
              <ThemedText style={styles.subscriptionTier}>Free Plan</ThemedText>
              <ThemedText style={styles.subscriptionDetails}>
                20 credits per month • 1K resolution
              </ThemedText>
            </View>
            {true && (
              <Pressable
                style={[styles.upgradeButton, { backgroundColor: tintColor }]}
                onPress={handleUpgrade}
              >
                <ThemedText style={styles.upgradeButtonText}>Upgrade</ThemedText>
              </Pressable>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          <View style={[styles.card, { borderColor }]}>
            {renderSettingRow(
              'bell.fill',
              'Notifications',
              undefined,
              undefined,
              <Switch value={notifications} onValueChange={setNotifications} />
            )}
            {renderSettingRow(
              'gearshape.fill',
              'API Keys',
              undefined,
              () => setShowApiKeys(!showApiKeys)
            )}
          </View>
        </View>

        {/* API Keys (Expandable) */}
        {showApiKeys && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              API Keys
            </ThemedText>
            <View style={[styles.card, { borderColor }]}>
              <View style={styles.apiKeyRow}>
                <ThemedText style={styles.apiKeyLabel}>Google (Gemini)</ThemedText>
                <TextInput
                  style={[styles.apiKeyInput, { borderColor, color: textColor }]}
                  placeholder="Enter API key"
                  placeholderTextColor={borderColor}
                  secureTextEntry
                />
              </View>
              <View style={styles.apiKeyRow}>
                <ThemedText style={styles.apiKeyLabel}>OpenAI</ThemedText>
                <TextInput
                  style={[styles.apiKeyInput, { borderColor, color: textColor }]}
                  placeholder="Enter API key"
                  placeholderTextColor={borderColor}
                  secureTextEntry
                />
              </View>
              <View style={styles.apiKeyRow}>
                <ThemedText style={styles.apiKeyLabel}>Anthropic</ThemedText>
                <TextInput
                  style={[styles.apiKeyInput, { borderColor, color: textColor }]}
                  placeholder="Enter API key"
                  placeholderTextColor={borderColor}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}

        {/* Account Actions */}
        <View style={styles.section}>
          <Pressable
            style={[styles.logoutButton, { borderColor }]}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutButtonText}>
              Logout
            </ThemedText>
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <ThemedText style={styles.appInfoText}>Luxe Vision Creator v1.0.0</ThemedText>
          <ThemedText style={styles.appInfoText}>© 2024 Luxe Studio</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loginTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  loginSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscriptionInfo: {
    padding: 16,
  },
  subscriptionTier: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionDetails: {
    fontSize: 14,
    opacity: 0.6,
  },
  upgradeButton: {
    padding: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    opacity: 0.6,
  },
  apiKeyRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  apiKeyLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: 12,
    opacity: 0.4,
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
});
